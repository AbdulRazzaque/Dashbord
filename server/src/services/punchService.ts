
import { bioGet } from "../bioClient";
import PunchModel, { IPunch } from "../models/PunchModel";
import { BioTimePunch } from "../types";
import logger from "../config/logger";

export interface FetchPunchesOptions {
  start_time?: string;
  end_time?: string;
  page_size?: number;
  maxPages?: number;
}

export class PunchService {
  fetchAndSaveTodayPunches = async (
    options: FetchPunchesOptions = {}
  ): Promise<number> => {
    const today = new Date().toISOString().slice(0, 10);
    const start = options.start_time || `${today} 00:00:00`;
    const end = options.end_time || `${today} 23:59:59`;
    const pageSize = options.page_size || 200;
    const maxPages = options.maxPages || 200; // guard against infinite loops

    let totalSaved = 0;
    for (let page = 1; page <= maxPages; page++) {
      const res = await bioGet<BioTimePunch>("/iclock/api/transactions/", {
        start_time: start,
        end_time: end,
        page,
        page_size: pageSize,
      });

      if (!Array.isArray(res.data) || res.data.length === 0) break;

      for (const rec of res.data) {
        if (typeof rec?.id !== "number") continue;
        const toSave: Partial<IPunch> = {
          ...rec,
          punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
          upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
          raw: rec,
        };
        await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
        totalSaved++;
      }

      if (!res.next) break;
    }

    if (totalSaved > 0) logger.info(`Saved/Updated ${totalSaved} punches`);
    return totalSaved;
  };

  saveWebhookPunch = async (payload: unknown): Promise<number> => {
    const records = Array.isArray(payload) ? (payload as BioTimePunch[]) : [payload as BioTimePunch];
    let saved = 0;
    for (const rec of records) {
      if (!rec || typeof rec.id !== "number") continue;
      const toSave: Partial<IPunch> = {
        ...rec,
        punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
        upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
        raw: rec,
      };
      await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
      saved++;
    }
    return saved;
  };
}

