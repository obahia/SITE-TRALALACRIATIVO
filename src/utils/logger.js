// Logger utility for error tracking and monitoring
const isDev = import.meta.env.DEV;

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const logToConsole = (level, message, data = null) => {
  if (isDev) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
};

const sendToMonitoring = (level, message, errorData = null) => {
  // In production, send to error tracking service (e.g., Sentry, LogRocket)
  // For now, we'll just log to console in dev mode
  if (!isDev && level === LogLevel.ERROR) {
    // Example: Send to Sentry
    // Sentry.captureException(new Error(message), { tags: { level }, extra: errorData });
  }
};

export const logger = {
  error: (message, data = null) => {
    logToConsole(LogLevel.ERROR, message, data);
    sendToMonitoring(LogLevel.ERROR, message, data);
  },
  warn: (message, data = null) => {
    logToConsole(LogLevel.WARN, message, data);
  },
  info: (message, data = null) => {
    logToConsole(LogLevel.INFO, message, data);
  },
  debug: (message, data = null) => {
    if (isDev) {
      logToConsole(LogLevel.DEBUG, message, data);
    }
  }
};
