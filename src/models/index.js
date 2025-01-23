import { Sequelize } from "sequelize";
import config from "../config/config.js";
import userModel from "./user.js";

export const sequelize = new Sequelize(config.db);
export const User = userModel(sequelize);
