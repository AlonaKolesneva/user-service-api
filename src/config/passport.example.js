import { use, serializeUser, deserializeUser } from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { User } from "../models/index.js";
import config from "./config.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.sessionSecret,
};

use(
  new JwtStrategy(opts, async (payload, done) => {
    try {
      const user = await User.findOne({ where: { email: payload.email } });
      if (!user) {
        return done(null, false, { message: "Invalid credentials" });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return done(null, false, { message: "Invalid credentials" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

serializeUser((user, done) => {
  done(null, user.id);
});

deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
