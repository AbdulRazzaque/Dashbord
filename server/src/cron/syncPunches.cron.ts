import * as cron from "node-cron";
import { PunchService } from "../services/punchService";
import logger from "../config/logger";

const punchService = new PunchService();

/**
 * Sync today's punches from BioTime and save/update EmployeeDay records.
 * Schedule: every 3 minutes. No timezone option (uses server time) so it works on Windows/IIS.
 * Backup: server.ts also runs setInterval every 3 min so sync runs even if cron fails on IIS.
 */
cron.schedule(
  "*/3 * * * *",
  async (): Promise<void> => {
    try {
      logger.info("Punch sync started at", { time: new Date().toISOString() })
      const saved = await punchService.fetchAndSaveTodayPunches();
      // logger.info("Punch sync cron completed", { punchesSaved: saved });
      logger.info("Punch sync finished at", {  time: new Date().toISOString(), punchesSaved: saved });
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error("Punch sync cron failed", {
          time: new Date().toISOString(),
          message: error.message,
          stack: error.stack,
        });
      } else {
        logger.error("Punch sync cron failed with unknown error", { error });
      }
    }
  }
  // No timezone - on Windows/IIS timezone option can prevent cron from running
);

logger.info("Punch sync cron registered (every 3 minutes)");
