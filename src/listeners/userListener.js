import eventEmitter from "../events/index.js";
import { USER_CREATED } from "../events/eventTypes.js";
import logger from "../logger.js";

eventEmitter.on(USER_CREATED, async (user) => {
  try {
    logger.info(`User Created Event Triggered for ID: ${user.id}`);
  } catch (error) {
    logger.error("Error handling User Created event:", error.message);
  }
});
