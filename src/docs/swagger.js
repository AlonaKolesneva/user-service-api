import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const { APP_URL, PORT } = process.env;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User service API Documentation",
      version: "1.0.0",
      description: "API documentation for the User service",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `${APP_URL}:${PORT}/api/v1/`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "Unique identifier for the user",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              description: "User password (hashed)",
              writeOnly: true,
            },
            isTest: {
              type: "boolean",
              description: "Indicates if the user is a test user",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of user creation",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp of user update",
            },
          },
          required: ["email", "password"],
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/v1/*.js")],
};

export default swaggerJsdoc(options);
