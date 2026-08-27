# Din Bilforhandler – komplet website + admin-system

Et fuldt fungerende bilforhandler-system: offentlig hjemmeside + beskyttet admin-panel,
med rigtig database, billed-upload, autentifikation og SEO-venlige bil-sider.

## Arkitektur

```
dealer/
  server/   Node.js + Express + TypeScript API, Prisma ORM, JWT-auth, billed-upload
  client/   React + TypeScript + Vite + Tailwind CSS (offentlig side + admin-panel i samme app)
```

**Hvorfor denne stack:**
- **Frontend:** React + TypeScript + Tailwind, som ønsket. Vite som build-værktøj (hurtig dev-server).
- **Backend:** Node.js + Express + TypeScript, som ønsket.
- **Database:** PostgreSQL via **Prisma ORM**. Prisma-skemaet er skrevet så det virker 1:1 med både
  SQLite og PostgreSQL — projektet er sat op med **SQLite som udviklings-database** (kører uden nogen
  ekstern opsætning: ingen server, intet login, ingen firewall), og er klar til at blive skiftet til
  **PostgreSQL i produktion** ved blot at ændre to linjer (se "Skift til PostgreSQL" nedenfor).
  Postgres blev valgt frem for MongoDB fordi data er relationelt (forhandler → biler → billeder →
  leads) med behov for transaktioner, unikke constraints (slugs, email) og fremtidig multi-tenant
  understøttelse — det passer bedre til et relationelt skema end til et dokument-skema.
- **Billeder:** gemmes IKKE som base64 i databasen. De uploades til disk (`server/uploads/`),
  komprimeres og konverteres til WebP med `sharp`, og kun URL'en gemmes i databasen. I produktion
  kan `uploads/`-mappen nemt erstattes af en cloud-bucket (S3/Cloudflare R2) ved at ændre upload-
  routen i `server/src/routes/admin.ts` — resten af systemet er uændret, da det kun arbejder med URL'er.
- **Auth:** JWT gemt i en httpOnly-cookie. `/admin/*`-ruter på både API og frontend er beskyttet —
  et direkte kald til `/api/admin/...` uden gyldig token returnerer `401`, og frontend-ruten
  `/admin` redirecter til login, hvis man ikke er logget ind.

## Sådan kommer du i gang

**Krav:** Node.js 18+ installeret.

### 1. Backend

```bash
cd server
cp .env.example .env
npm run setup
```

`npm run setup` installerer afhængigheder, opretter SQLite-databasen, kører migreringer og
seeder demo-data (inkl. en admin-bruger). Kør derefter:

```bash
npm run dev
```

Serveren kører nu på `http://localhost:4000`. I terminalen kan du se login-oplysningerne til
demo-admin-brugeren (standard: `admin@dinbilforhandler.dk` / `ChangeMe123!` — **skift adgangskoden
i `.env` før du seeder i produktion**).

### 2. Frontend

I et nyt terminalvindue:

```bash
cd client
npm install
npm run dev
```

Åbn `http://localhost:5173` for den offentlige hjemmeside, og `http://localhost:5173/admin/login`
for admin-panelet.

## Fuld brugerflow (testet igennem)

1. Start begge servere (se ovenfor).
2. Gå til `/admin/login` og log ind med demo-admin-brugeren.
3. Klik "+ Tilføj bil" og udfyld formularen → "Gem som kladde".
4. Upload billeder (træk-og-slip eller klik) — første billede bliver automatisk hovedbillede,
   og du kan trække billeder om for at ændre rækkefølgen.
5. Klik "Udgiv" → bilen får status "Til salg" og vises øjeblikkeligt på `/biler` og på forsiden.
6. Gå til den offentlige side og se bilen, brug filtrene, og prøv "Kontakt om denne bil".
7. Gå tilbage til admin, rediger bilen (fx pris), og se ændringen slå igennem med det samme.
8. Sæt status til "Solgt" — bilen forsvinder øjeblikkeligt fra den offentlige biloversigt
   (den er stadig i databasen og kan ses i admin-panelet under "Biler").

## Demo-data

Seed-scriptet (`server/prisma/seed.ts`) opretter 5 realistiske demo-biler (forskellige statusser)
med placeholder-billeder. De er markeret internt med et `VIN`, der starter med `DEMO-`, så du nemt
kan finde og slette dem fra admin-panelet, eller køre:

```bash
npx prisma studio
```
for at få et visuelt UI til databasen, hvor demo-bilerne nemt kan slettes eller redigeres direkte.

## Skift til PostgreSQL (produktion)

1. I `server/prisma/schema.prisma`: ændr `provider = "sqlite"` til `provider = "postgresql"`.
2. I `server/.env`: sæt `DATABASE_URL` til din Postgres connection string, fx:
   `postgresql://bruger:kodeord@host:5432/dealer`
3. Kør `npx prisma migrate dev --name init` igen for at oprette skemaet i Postgres.
4. Kør `npm run prisma:seed` for demo-data (kan udelades i produktion).

## SEO

- Hver bil har sin egen URL: `/biler/{mærke-model-variant-årgang}`.
- Sidetitel, meta description, Open Graph-tags og JSON-LD (schema.org `Vehicle`) sættes dynamisk
  pr. bil i `client/src/pages/CarDetail.tsx`.
- **Vigtigt forbehold:** dette er en client-renderet React-app (SPA). Google's crawler kører
  JavaScript og kan derfor indeksere siderne fint, men crawlere der IKKE kører JS (fx Facebooks
  og LinkedIns link-preview-bots) vil ikke se de dynamiske meta-tags. Hvis fuld social-preview-
  understøttelse er vigtig, anbefales det senere at migrere frontend til Next.js (server-side
  rendering) — resten af arkitekturen (API, database, admin-panel) er allerede fuldt genanvendelig.

## Sikkerhed

- Alle `/api/admin/*`-endepunkter kræver et gyldigt JWT (httpOnly-cookie) — verificeret server-side
  i `server/src/middleware/auth.ts`.
- Adgangskoder hashes med bcrypt, aldrig gemt i klartekst.
- Input valideres både i frontend (required-felter, typer) og i backend med `zod`-skemaer —
  serveren stoler aldrig blindt på frontend.
- Billed-upload validerer filtype og størrelse server-side (kun billeder, maks 15 MB pr. fil).

## Videre udbygning (databasen er allerede klar til det)

Prisma-skemaet indeholder allerede:
- `Dealer`-model, så systemet kan udvides til flere forhandlere (SaaS).
- `User`-model med `role`, klar til flere admin-brugere pr. forhandler.
- `Lead`-model, der gemmer alle henvendelser (generelle, bil-specifikke og finansiering) —
  ses i admin under "Henvendelser".

Ikke inkluderet endnu, men naturlige næste skridt: favoritter (kræver kunde-login), statistik-
dashboard over tid, og e-mail-notifikationer ved nye leads (fx via Resend/SendGrid).
