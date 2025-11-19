import { Logger } from "winston";
import { PunchService } from "../src/services/punchService";

export class StartPolling {
  private readonly INTERVAL: number;
  private readonly ENABLED: boolean;

  constructor(
    private logger: Logger,
    private punchService: PunchService
  ) {
    this.INTERVAL = Number(process.env.POLL_INTERVAL_MS || 30000);
    this.ENABLED =
      String(process.env.POLLING_ENABLED || "true").toLowerCase() !== "false" &&
      this.INTERVAL > 0;
  }

  public start() {
    if (!this.ENABLED) {
      this.logger.info("Polling disabled (POLLING_ENABLED=false or INTERVAL<=0)");
      return;
    }

    this.logger.info(`Polling every ${this.INTERVAL / 1000} seconds...`);

    const poll = async () => {
      try {
        await this.punchService.fetchAndSaveTodayPunches();
      } catch (err: any) {
        if (err instanceof Error) {
          this.logger.error("Poll error:", {
            message: err.message,
            stack: err.stack,
          });
        } else {
          this.logger.error("Poll error:", { error: err });
        }
      } finally {
        setTimeout(poll, this.INTERVAL); // Prevent overlapping
      }
    };

    void poll(); // Start immediately
  }
}
