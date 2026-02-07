import * as cron from "node-cron";
import { PunchService } from "../services/punchService";
import logger from "../config/logger";

const punchService = new PunchService();

/**
 * Sync today's punches from BioTime and save/update EmployeeDay records.
 * Runs in the background so data keeps saving even when no one opens the app.
 * Schedule: every 15 minutes (and at server start via poll if enabled).
 */
cron.schedule(
  "*/15 * * * *",
  async (): Promise<void> => {
    try {
      logger.info("Punch sync cron started");
      const saved = await punchService.fetchAndSaveTodayPunches();
      logger.info("Punch sync cron completed", { punchesSaved: saved });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Punch sync cron failed", {
          message: error.message,
          stack: error.stack,
        });
      } else {
        logger.error("Punch sync cron failed with unknown error", { error });
      }
    }
  },
  {
    timezone: "Asia/Qatar",
  }
);

logger.info("Punch sync cron registered (every 15 minutes)");
