import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import leadsRoutes from "./routes/leads";
import carsRoutes from "./routes/cars";

dotenv.config();

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://emcars-client.vercel.app",
  process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Tillad requests uden Origin-header
    if (!origin) {
      return callback(null, true);
    }

    // Tillad kendte origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Tillad Vercel deployments
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    return callback(new Error("Ikke tilladt af CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// =====================================================
// MIDDLEWARE
// =====================================================

// CORS skal være før routes
app.use(cors(corsOptions));

// JSON body parser
app.use(express.json());

// Cookie parser
// VIGTIGT: requireAuth() bruger req.cookies.token
app.use(cookieParser());

// =====================================================
// ROUTES
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Leads
app.use("/api/leads", leadsRoutes);

// Cars
app.use("/api/cars", carsRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "EM Cars backend virker",
  });
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint ikke fundet.",
    path: req.path,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Serverfejl:", error);

    if (error instanceof Error) {
      if (error.message === "Ikke tilladt af CORS") {
        return res.status(403).json({
          error: "Ikke tilladt af CORS",
        });
      }

      return res.status(500).json({
        error: "Intern serverfejl.",
        details:
          process.env.NODE_ENV === "production"
            ? undefined
            : error.message,
      });
    }

    return res.status(500).json({
      error: "Intern serverfejl.",
    });
  }
);

// =====================================================
// VERCEL
// =====================================================

export default app;