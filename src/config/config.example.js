import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "..", "database", "database.sqlite");
const config = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || "your-session-secret",
  db: {
    storage: dbDir,
    dialect: "sqlite",
    logging: false,
    define: {
      timestamps: true,
    },
  },
};

export default config;
