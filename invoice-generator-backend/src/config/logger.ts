import log4js, { Configuration, LoggingEvent, Logger } from "log4js";

const format = (elements: any[]): string[] =>
  elements.map((element) =>
    !(element instanceof Error) ? element.toString() : `${element.stack}`
  );

log4js.addLayout("json", (config) => (logEvent: LoggingEvent) => {
  const { startTime, data, level, context } = logEvent;
  const newLog = {
    timestamp: startTime,
    level: level.levelStr,
    message: format(data).join(config.separator),
    ...context,
  };
  return JSON.stringify(newLog);
});

const log4jsConfig: Configuration = {
  appenders: {
    stdout: { type: "stdout", layout: { type: "json", separator: "," } },
    stderr: { type: "stderr", layout: { type: "json", separator: "," } },
    error: { type: "logLevelFilter", appender: "stderr", level: "warn" },
    information: {
      type: "logLevelFilter",
      appender: "stdout",
      level: "debug",
      maxLevel: "info",
    },
  },
  categories: {
    default: {
      appenders: ["information", "error"],
      level: "debug",
      enableCallStack: true,
    },
  },
};

log4js.configure(log4jsConfig);

export const logger: Logger = log4js.getLogger();

