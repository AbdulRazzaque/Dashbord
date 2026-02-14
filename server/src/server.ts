import app from "./app";
import { Config } from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";
import { PunchService } from "./services/punchService";

const startServer = async () => {
    const PORT = Config.PORT;

    try {
        await connectDB();

        app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
        logger.info(`Server running on http://localhost:${PORT}`);
        logger.info(`BioTime URL: ${process.env.BIOTIME_URL}`);

        // Punch sync: cron only (every 15 min via syncPunches.cron). Run once on startup so first sync is immediate.
        const punchService = new PunchService();
        punchService.fetchAndSaveTodayPunches().catch((err) => {
            logger.error("Startup punch sync failed", { message: err instanceof Error ? err.message : err });
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            process.exit(1);
        }
    }
};

void startServer();
