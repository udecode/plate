/**
 * Logging interface for docXMLater
 * Allows library consumers to control logging behavior
 */

/**
 * Log severity levels
 */
export enum LogLevel {
  /** Debugging information (most verbose) */
  DEBUG = 'debug',
  /** Informational messages */
  INFO = 'info',
  /** Warning messages - potential issues that don't prevent operation */
  WARN = 'warn',
  /** Error messages - serious issues that may cause failures */
  ERROR = 'error',
}

/**
 * Log entry structure
 */
export interface LogEntry {
  /** Timestamp when log was created */
  timestamp: Date;
  /** Severity level */
  level: LogLevel;
  /** Log message */
  message: string;
  /** Optional context data */
  context?: Record<string, any>;
  /** Source component that generated the log */
  source?: string;
}

/**
 * Logger interface that consumers can implement
 * Provides full control over how logs are handled
 */
export interface ILogger {
  /**
   * Log a debug message
   * @param message - Debug message
   * @param context - Optional context data
   */
  debug(message: string, context?: Record<string, any>): void;

  /**
   * Log an informational message
   * @param message - Info message
   * @param context - Optional context data
   */
  info(message: string, context?: Record<string, any>): void;

  /**
   * Log a warning message
   * @param message - Warning message
   * @param context - Optional context data
   */
  warn(message: string, context?: Record<string, any>): void;

  /**
   * Log an error message
   * @param message - Error message
   * @param context - Optional context data
   */
  error(message: string, context?: Record<string, any>): void;
}

/**
 * Console-based logger implementation
 * Uses standard console methods for output with timestamps and source prefixes
 */
export class ConsoleLogger implements ILogger {
  private showTimestamp: boolean;

  constructor(
    private minLevel: LogLevel = LogLevel.WARN,
    options?: { showTimestamp?: boolean }
  ) {
    this.showTimestamp = options?.showTimestamp ?? true;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }
  }

  error(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, context));
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): string {
    const parts: string[] = [];

    // Add timestamp if enabled
    if (this.showTimestamp) {
      const timestamp = new Date().toISOString().slice(11, 23); // HH:mm:ss.SSS
      parts.push(timestamp);
    }

    // Add level tag
    parts.push(`[${level.toUpperCase().padEnd(5)}]`);

    // Add source if present
    if (context?.source) {
      parts.push(`[${context.source}]`);
    }

    // Add message
    parts.push(message);

    // Add context (excluding source which is already shown)
    if (context && Object.keys(context).length > 0) {
      const contextWithoutSource = { ...context };
      delete contextWithoutSource.source;
      if (Object.keys(contextWithoutSource).length > 0) {
        // Format context as key=value pairs for readability
        const contextStr = this.formatContext(contextWithoutSource);
        if (contextStr) {
          parts.push(contextStr);
        }
      }
    }

    return parts.join(' ');
  }

  private formatContext(context: Record<string, any>): string {
    const pairs: string[] = [];
    for (const [key, value] of Object.entries(context)) {
      if (value === undefined || value === null) continue;
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Nested object - use compact JSON
        pairs.push(`${key}=${JSON.stringify(value)}`);
      } else if (Array.isArray(value)) {
        pairs.push(`${key}=[${value.length}]`);
      } else {
        pairs.push(`${key}=${value}`);
      }
    }
    return pairs.length > 0 ? pairs.join(' ') : '';
  }
}

/**
 * Silent logger that discards all log messages
 * Useful for testing or when logging is not desired
 */
export class SilentLogger implements ILogger {
  debug(): void {
    // No-op
  }

  info(): void {
    // No-op
  }

  warn(): void {
    // No-op
  }

  error(): void {
    // No-op
  }
}

/**
 * Collecting logger that stores log entries in memory
 * Useful for testing and diagnostics
 */
export class CollectingLogger implements ILogger {
  private logs: LogEntry[] = [];

  debug(message: string, context?: Record<string, any>): void {
    this.addLog(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.addLog(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.addLog(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.addLog(LogLevel.ERROR, message, context);
  }

  private addLog(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): void {
    this.logs.push({
      timestamp: new Date(),
      level,
      message,
      context,
    });
  }

  /**
   * Get all collected log entries
   */
  getLogs(): ReadonlyArray<LogEntry> {
    return [...this.logs];
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): ReadonlyArray<LogEntry> {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all collected logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Get count of logs by level
   */
  getCount(level?: LogLevel): number {
    if (level) {
      return this.logs.filter((log) => log.level === level).length;
    }
    return this.logs.length;
  }
}

/**
 * Default logger instance
 * Delegates to the global logger, respecting setGlobalLogger() and environment variables
 */
export const defaultLogger: ILogger = {
  debug(message: string, context?: Record<string, any>): void {
    getGlobalLogger().debug(message, context);
  },
  info(message: string, context?: Record<string, any>): void {
    getGlobalLogger().info(message, context);
  },
  warn(message: string, context?: Record<string, any>): void {
    getGlobalLogger().warn(message, context);
  },
  error(message: string, context?: Record<string, any>): void {
    getGlobalLogger().error(message, context);
  },
};

/**
 * Creates a scoped logger that adds source information
 * @param logger - Base logger
 * @param source - Source component name
 * @returns Scoped logger with source context
 */
export function createScopedLogger(logger: ILogger, source: string): ILogger {
  return {
    debug(message: string, context?: Record<string, any>): void {
      logger.debug(message, { ...context, source });
    },
    info(message: string, context?: Record<string, any>): void {
      logger.info(message, { ...context, source });
    },
    warn(message: string, context?: Record<string, any>): void {
      logger.warn(message, { ...context, source });
    },
    error(message: string, context?: Record<string, any>): void {
      logger.error(message, { ...context, source });
    },
  };
}

/**
 * Parse log level from string
 * @param level - Log level string (case-insensitive)
 * @returns LogLevel or undefined if invalid
 */
export function parseLogLevel(level: string | undefined): LogLevel | undefined {
  if (!level) return;
  const normalized = level.toLowerCase();
  switch (normalized) {
    case 'debug':
      return LogLevel.DEBUG;
    case 'info':
      return LogLevel.INFO;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    default:
      return;
  }
}

/**
 * Create a logger based on environment variables
 *
 * Environment variables (in order of precedence):
 * - DEBUG=docxmlater or DEBUG=docxmlater:* - Enables DEBUG level
 * - DOCXMLATER_LOG_LEVEL=debug|info|warn|error|silent - Sets specific level
 *
 * @returns Logger configured from environment, or SilentLogger if not configured
 */
export function createLoggerFromEnv(): ILogger {
  // Check DEBUG environment variable first (highest precedence for debug mode)
  const debugEnv = process.env.DEBUG || '';
  if (debugEnv.includes('docxmlater')) {
    return new ConsoleLogger(LogLevel.DEBUG);
  }

  // Check DOCXMLATER_LOG_LEVEL environment variable
  const envLevel = process.env.DOCXMLATER_LOG_LEVEL?.toLowerCase();
  if (envLevel === 'silent') {
    return new SilentLogger();
  }

  const parsedLevel = parseLogLevel(envLevel);
  if (parsedLevel) {
    return new ConsoleLogger(parsedLevel);
  }

  // Default: silent (no logging unless explicitly enabled)
  return new SilentLogger();
}

// Global logger instance - initialized from environment
let globalLogger: ILogger = createLoggerFromEnv();

/**
 * Set the global logger instance
 * Use this to configure logging programmatically
 *
 * @example
 * ```typescript
 * import { setGlobalLogger, ConsoleLogger, LogLevel } from 'docxmlater';
 *
 * // Enable info-level logging
 * setGlobalLogger(new ConsoleLogger(LogLevel.INFO));
 * ```
 *
 * @param logger - Logger instance to use globally
 */
export function setGlobalLogger(logger: ILogger): void {
  globalLogger = logger;
}

/**
 * Get the global logger instance
 * Used internally by framework components
 *
 * @returns Current global logger
 */
export function getGlobalLogger(): ILogger {
  return globalLogger;
}

/**
 * Reset the global logger to its default (environment-based) configuration
 * Useful for testing cleanup
 */
export function resetGlobalLogger(): void {
  globalLogger = createLoggerFromEnv();
}

/**
 * Creates a component-scoped logger using the global logger.
 * This is a convenience function that combines getGlobalLogger() and createScopedLogger()
 * into a single call, reducing boilerplate in component files.
 *
 * @param componentName - Name of the component (appears in log output)
 * @returns Scoped logger instance
 *
 * @example
 * ```typescript
 * // Instead of:
 * function getLogger(): ILogger {
 *   return createScopedLogger(getGlobalLogger(), 'MyComponent');
 * }
 *
 * // You can use:
 * const logger = createComponentLogger('MyComponent');
 *
 * // Or for lazy initialization:
 * const getLogger = () => createComponentLogger('MyComponent');
 * ```
 */
export function createComponentLogger(componentName: string): ILogger {
  return createScopedLogger(getGlobalLogger(), componentName);
}
