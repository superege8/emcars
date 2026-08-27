import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth";
import carsRoutes from "./routes/cars";
import leadsRoutes from "./routes/leads";
import adminRoutes from "./routes/admin";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// Statiske upload-billeder
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/leads", leadsRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Generisk fejlhåndtering (bl.a. multer-fejl som forkert filtype/for stor fil)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 400).json({ error: err.message || "Der skete en fejl på serveren." });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server kører på http://localhost:${PORT}`);
});
