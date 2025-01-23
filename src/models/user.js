import { Model, DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
const { compare, hash } = bcrypt;

export default (sequelize) => {
  class User extends Model {
    async validatePassword(password) {
      return compare(password, this.password);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isTest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
      hooks: {
        beforeSave: async (user) => {
          if (user.changed("password")) {
            user.password = await hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};
