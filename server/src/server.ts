// import startPolling from "../utils/poll";
import { StartPolling } from "../utils/poll";
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

        // ⭐ Correct way to start polling
        const poller = new StartPolling(logger, new PunchService());
        poller.start();
        
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(error.message);
            process.exit(1);
        }
    }
};

void startServer()
