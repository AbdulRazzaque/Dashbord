import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";
import { PunchService } from "./services/punchService";

const PUNCH_SYNC_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

const startServer = async () => {
    const PORT = Config.PORT;

    try {
        await connectDB();

        app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
        logger.info(`Server running on http://localhost:${PORT}`);
        logger.info(`BioTime URL: ${process.env.BIOTIME_URL}`);

        const punchService = new PunchService();

        // 1) Run sync once on startup (await so we log success/failure before "ready")
        try {
            logger.info("Startup punch sync started");
            const saved = await punchService.fetchAndSaveTodayPunches();
            logger.info("Startup punch sync completed", { punchesSaved: saved });
        } catch (err) {
            logger.error("Startup punch sync failed", {
                message: err instanceof Error ? err.message : String(err),
            });
        }

        // 2) Backup: setInterval every 15 min (works on Windows/IIS even if node-cron doesn't)
        setInterval(() => {
            punchService.fetchAndSaveTodayPunches().then((saved) => {
                logger.info("Punch sync (interval) completed", { punchesSaved: saved });
            }).catch((err) => {
                logger.error("Punch sync (interval) failed", {
                    message: err instanceof Error ? err.message : String(err),
                });
            });
        }, PUNCH_SYNC_INTERVAL_MS);
        logger.info(`Punch sync interval scheduled every ${PUNCH_SYNC_INTERVAL_MS / 60000} minutes`);
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            process.exit(1);
        }
    }
};

void startServer();
