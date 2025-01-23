import { body, param, query } from "express-validator";
import { validateRequest } from "../middleware/validateRequest.js";

export const userValidation = {
  register: [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }).trim(),
    validateRequest,
  ],
  login: [
    body("email").isEmail().normalizeEmail(),
    body("password").exists(),
    validateRequest,
  ],
  getAll: [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    validateRequest,
  ],
  getById: [param("id").isInt({ min: 1 }), validateRequest],
  update: [
    param("id").isInt({ min: 1 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("password").optional().isLength({ min: 6 }).trim(),
    validateRequest,
  ],
  delete: [param("id").isInt({ min: 1 }), validateRequest],
};
