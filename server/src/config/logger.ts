import winston from "winston";
import { MongoDB, MongoDBConnectionOptions } from "winston-mongodb";
import { Config } from ".";
import * as sourceMapSupport from "source-map-support";
import "winston-mongodb";
sourceMapSupport.install();

if (!Config.MONGO_URI) {
    
  throw new Error("MONGO_URI must be set to enable MongoDB logging");
}

// Explicitly type the options so TS picks the correct overload
const mongoOpts: MongoDBConnectionOptions = {
  level: "info",
  db: Config.MONGO_URI,                // now definitely a string
  options: { useUnifiedTopology: true },
  expireAfterSeconds: 3600 * 24 * 30,  // 30 days
  collection: "application-logs",
  tryReconnect: true,
  silent: Config.NODE_ENV === "test",
};

const transports: winston.transport[] = [
  new winston.transports.File({
    dirname: "logs",
    filename: "combined.log",
    level: "info",
    silent: Config.NODE_ENV === "test",
  }),
  new winston.transports.File({
    dirname: "logs",
    filename: "error.log",
    level: "error",
    silent: Config.NODE_ENV === "test",
  }),
  new winston.transports.Console({
    level: "info",
    silent: Config.NODE_ENV === "test",
  }),
];

// add MongoDB transport
transports.push(new MongoDB(mongoOpts));

const logger = winston.createLogger({
  level: "info",
  defaultMeta: { serviceName: "auth-service" },
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports,
});

export default logger;
