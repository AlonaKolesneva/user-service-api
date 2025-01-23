import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import eventEmitter from "../events/index.js";
import { USER_CREATED } from "../events/eventTypes.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

export const userController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const error = new Error("Email already registered");
        error.status = 400;
        throw error;
      }

      const user = await User.create({ email, password });
      eventEmitter.emit(USER_CREATED, user);

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        const error = new Error("Invalid credentials");
        error.status = 401;
        throw error;
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const users = await User.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: ["id", "email", "createdAt", "updatedAt"],
      });

      return res.status(200).json({
        users: users.rows,
        total: users.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.count / limit),
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ["id", "email", "createdAt", "updatedAt"],
      });

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      // Update user own data only
      if (user.id !== req.user.id) {
        const error = new Error("Unauthorized");
        error.status = 403;
        throw error;
      }

      await user.update({ email, password });

      return res.status(200).json({
        message: "User updated successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        const error = new Error("User not found");
        error.status = 404;
        throw error;
      }

      // Only allow users to delete their own account
      if (user.id !== req.user.id) {
        const error = new Error("Unauthorized");
        error.status = 403;
        throw error;
      }

      await user.destroy();

      return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
};
