import request from "supertest";
import app from "../app.js";
import { User, sequelize } from "../models/index.js";
import jwt from "jsonwebtoken";

const API_PREFIX = "/api/v1/users";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

describe("User Routes", () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await User.destroy({ where: { isTest: true } });
  });

  beforeEach(async () => {
    testUser = await User.create({
      email: "test@example.com",
      password: "password123",
      isTest: true,
    });
    authToken = jwt.sign({ id: testUser.id }, JWT_SECRET);
  });

  afterEach(async () => {
    await User.destroy({ where: { isTest: true } });
  });

  afterAll(async () => {
    await User.destroy({ where: { isTest: true } });
    await sequelize.close();
    if (app.server) {
      await new Promise((resolve) => app.server.close(resolve));
    }
  });

  describe("POST /register", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app).post(`${API_PREFIX}/register`).send({
        email: "new@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", "new@example.com");
    });

    it("should reject registration with invalid email", async () => {
      const res = await request(app).post(`${API_PREFIX}/register`).send({
        email: "invalid-email",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should reject registration with existing email", async () => {
      const res = await request(app).post(`${API_PREFIX}/register`).send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email already registered");
    });
  });

  describe("POST /login", () => {
    it("should login successfully with valid credentials", async () => {
      const res = await request(app).post(`${API_PREFIX}/login`).send({
        email: "test@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", "test@example.com");
    });

    it("should reject login with invalid password", async () => {
      const res = await request(app).post(`${API_PREFIX}/login`).send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /", () => {
    it("should get paginated users list", async () => {
      const res = await request(app)
        .get(`${API_PREFIX}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("currentPage");
      expect(res.body).toHaveProperty("totalPages");
    });

    it("should handle pagination parameters", async () => {
      const res = await request(app)
        .get(`${API_PREFIX}?page=1&limit=5`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.currentPage).toBe(1);
    });
  });

  describe("GET /:id", () => {
    it("should get user by id", async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", testUser.id);
      expect(res.body).toHaveProperty("email", testUser.email);
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request(app)
        .get(`${API_PREFIX}/99999`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /:id", () => {
    it("should update user successfully", async () => {
      const res = await request(app)
        .put(`${API_PREFIX}/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          email: "updated@example.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("updated@example.com");
    });

    it("should prevent updating other users", async () => {
      const otherUser = await User.create({
        email: "other@example.com",
        password: "password123",
        isTest: true,
      });

      const res = await request(app)
        .put(`${API_PREFIX}/${otherUser.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          email: "hacked@example.com",
        });

      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /:id", () => {
    it("should delete user successfully", async () => {
      const res = await request(app)
        .delete(`${API_PREFIX}/${testUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      const deletedUser = await User.findByPk(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it("should prevent deleting other users", async () => {
      const otherUser = await User.create({
        email: "other@example.com",
        password: "password123",
        isTest: true,
      });

      const res = await request(app)
        .delete(`${API_PREFIX}/${otherUser.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(403);
    });
  });
});
