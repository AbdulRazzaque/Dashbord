import * as cron from "node-cron";
import { AbsentService } from "../services/AbsentService";
// import logger from "../utils/logger";

import logger from "../config/logger";

const absentService = new AbsentService();

cron.schedule(
//  "40 10 * * *",
  "* * * * *",
  async (): Promise<void> => {
    try { 
      logger.info("Absent cron started");
      await absentService.markTodayAbsent();
      logger.info("Absent cron completed");
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Absent cron failed", { message: error.message, stack: error.stack });
      } else {
        logger.error("Absent cron failed with unknown error", { error });
      }
    }
  },
  {
    timezone: "Asia/Qatar",
  }
);
