import express, { json } from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import passport from "passport";
import sqlite3 from "sqlite3";
import SQLiteStoreFactory from "connect-sqlite3";
import router from "./routes/v1/index.js";
import { serve, setup } from "swagger-ui-express";
import swagger from "./docs/swagger.js";
import { sequelize, User } from "./models/index.js";
import config from "./config/config.js";
import logger from "./logger.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createTestData } from "./utils/initTestData.js";
import "./listeners/userListener.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: "draft-8",
  legacyHeaders: true,
});

app.use(limiter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "database");
const sessionsDir = path.join(__dirname, "sessions");

app.use(json());

const SQLiteStore = SQLiteStoreFactory(session);
app.use(
  session({
    store: new SQLiteStore({
      dir: sessionsDir,
      db: "sessions.sqlite",
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: false,
      secure: process.env.NODE_ENV,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api-docs", serve, setup(swagger));
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";

  logger.error(message, { stack: err.stack });
  res.status(statusCode).json({ message, error: err.details || message });
});
const initializeServer = async () => {
  try {
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, "database.sqlite");
    const isNewDatabase = !fs.existsSync(dbPath);

    if (isNewDatabase) {
      logger.info("Creating new database file");
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          logger.error("Error creating database:", err);
          throw err;
        }
      });
      db.close();
    }

    app.set("models", User);

    await sequelize.authenticate();
    logger.info("Database connection established successfully");

    await sequelize.sync({
      force: isNewDatabase,
      alter: false,
    });
    logger.info("Database models synchronized successfully");

    if (isNewDatabase) {
      await createTestData({ User });
      logger.info("Test data created successfully");
    }

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error("Failed to initialize server:", error);
    process.exit(1);
  }
};

initializeServer();

export default app;
