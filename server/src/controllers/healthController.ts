import { Request, Response } from "express";
import mongoose from "mongoose";

export const health = (req: Request, res: Response) => {
  res.json({
    ok: true,
    biotime: process.env.BIOTIME_URL || null,
    mongo: mongoose.connection.readyState === mongoose.ConnectionStates.connected,
  });
};