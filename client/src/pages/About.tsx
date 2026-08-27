import Eyebrow from "../components/Eyebrow";

export default function About() {
  return (
    <div className="bg-[#131316] text-white">

      {/* INTRO */}
      <section className="border-b border-white/10 bg-[#131316]">
        <div className="container-page py-20 max-w-2xl">
          <Eyebrow className="mb-3">
            Om EM Cars
          </Eyebrow>

          <h1 className="text-4xl mb-6 text-white">
            En ny bilforhandler med fokus på det, der faktisk betyder noget
          </h1>

          <p className="text-white/65 leading-relaxed">
            EM Cars er en nystartet bilforhandler. Vi har ikke et stort
            showroom eller en lang historie at læne os op ad — til gengæld
            har vi et klart mål: at gøre det trygt og ligetil at købe eller
            sælge en bil.
          </p>
        </div>
      </section>

      {/* TEKST */}
      <section className="container-page py-20 max-w-2xl">
        <div className="space-y-10">

          <div>
            <h2 className="text-xl mb-3 text-white">
              Hvad vi lover
            </h2>

            <p className="text-white/65 leading-relaxed">
              Hver bil, vi sætter til salg, bliver gennemgået, så vi kan
              stå inde for stand og specifikationer. Priserne er tydelige
              fra start, og vi svarer ærligt på de spørgsmål, du måtte
              have — også dem, der ikke har et pænt svar.
            </p>
          </div>

          <div>
            <h2 className="text-xl mb-3 text-white">
              Hvorfor en ny forhandler
            </h2>

            <p className="text-white/65 leading-relaxed">
              Vi startede EM Cars, fordi vi selv har oplevet, hvor
              uigennemskuelig bilhandel kan være. Målet er en forhandler,
              hvor du kan handle uden at føle, du skal forhandle dig frem
              til sandheden.
            </p>
          </div>

          <div>
            <h2 className="text-xl mb-3 text-white">
              Har du spørgsmål?
            </h2>

            <p className="text-white/65 leading-relaxed">
              Skriv eller ring til os endelig — vi svarer gerne, uanset om
              du er klar til at handle eller bare vil vide mere.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}