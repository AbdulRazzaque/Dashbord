
import { bioGet } from "../bioClient";
import PunchModel from "../models/PunchModel";
import { BioTimePunch } from "../types";
import logger from "../config/logger";

export class PunchService {

    fetchAndSaveTodayPunches = async (
  options: { start_time?: string; end_time?: string; page_size?: number } = {}
) => {
  const today = new Date().toISOString().slice(0, 10);
  const start = options.start_time || `${today} 00:00:00`;
  const end = options.end_time || `${today} 23:59:59`;
  const pageSize = options.page_size || 200;

  let page = 1;
  let totalSaved = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await bioGet<BioTimePunch>("/iclock/api/transactions/", {
      start_time: start,
      end_time: end,
      page,
      page_size: pageSize,
    });

    if (!res.data || res.data.length === 0) break;

    for (const rec of res.data) {
      const toSave = {
        ...rec,
        punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
        upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
        raw: rec,
      };

      await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
      totalSaved++;
    }

    if (!res.next) break;
    page++;
  }

  if (totalSaved > 0) {
    logger.info(`Saved/Updated ${totalSaved} punches`);
  }
  return totalSaved;
};

 saveWebhookPunch = async (payload: any) => {
  const records = Array.isArray(payload) ? payload : [payload];
  let saved = 0;

  for (const rec of records) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (!rec?.id) continue;
    const toSave = {
      ...rec,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      punch_time: rec.punch_time ? new Date(rec.punch_time) : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      upload_time: rec.upload_time ? new Date(rec.upload_time) : null,
      raw: rec,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await PunchModel.updateOne({ id: rec.id }, { $set: toSave }, { upsert: true });
    saved++;
  }
  return saved;
};
}

