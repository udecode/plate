/**
 * Diagnostic logging utilities for debugging document processing
 * @module diagnostics
 */

export interface DiagnosticConfig {
  enabled: boolean;
  logParsing: boolean;
  logSerialization: boolean;
  logTextDirection: boolean;
  verbose: boolean;
}

const defaultConfig: DiagnosticConfig = {
  enabled: false,
  logParsing: false,
  logSerialization: false,
  logTextDirection: false,
  verbose: false,
};

let config: DiagnosticConfig = { ...defaultConfig };

/**
 * Enable diagnostic logging
 */
export function enableDiagnostics(options: Partial<DiagnosticConfig> = {}): void {
  config = {
    ...defaultConfig,
    enabled: true,
    ...options,
  };
}

/**
 * Disable diagnostic logging
 */
export function disableDiagnostics(): void {
  config = { ...defaultConfig };
}

/**
 * Get current diagnostic configuration
 */
export function getDiagnosticConfig(): DiagnosticConfig {
  return { ...config };
}

/**
 * Log parsing activity
 */
export function logParsing(message: string, data?: any): void {
  if (config.enabled && config.logParsing) {
    console.log(`[PARSE] ${message}`, data !== undefined ? data : '');
  }
}

/**
 * Log serialization activity
 */
export function logSerialization(message: string, data?: any): void {
  if (config.enabled && config.logSerialization) {
    console.log(`[SERIALIZE] ${message}`, data !== undefined ? data : '');
  }
}

/**
 * Log text direction properties
 */
export function logTextDirection(message: string, data?: any): void {
  if (config.enabled && config.logTextDirection) {
    console.log(`[TEXT-DIR] ${message}`, data !== undefined ? data : '');
  }
}

/**
 * Log verbose details
 */
export function logVerbose(message: string, data?: any): void {
  if (config.enabled && config.verbose) {
    console.log(`[VERBOSE] ${message}`, data !== undefined ? data : '');
  }
}

/**
 * Log paragraph content summary
 */
export function logParagraphContent(
  source: 'parsing' | 'serialization',
  paraIndex: number,
  runs: Array<{ text: string; rtl?: boolean }>,
  bidi?: boolean
): void {
  if (!config.enabled) return;

  const logger = source === 'parsing' ? logParsing : logSerialization;

  logger(`Paragraph ${paraIndex}:`);
  logger(`  BiDi: ${bidi !== undefined ? bidi : 'not set'}`);
  logger(`  Runs (${runs.length}):`);

  runs.forEach((run, idx) => {
    const rtlStatus = run.rtl ? ' [RTL]' : '';
    logger(`    ${idx + 1}. "${run.text}"${rtlStatus}`);
  });

  const fullText = runs.map(r => r.text).join('');
  logger(`  Combined text: "${fullText}"`);
}

/**
 * Compare text before and after processing
 */
export function logTextComparison(
  label: string,
  before: string,
  after: string
): void {
  if (!config.enabled) return;

  if (before !== after) {
    console.log(`[TEXT-CHANGE] ${label}:`);
    console.log(`  Before: "${before}"`);
    console.log(`  After:  "${after}"`);
    console.log(`  MISMATCH DETECTED!`);
  } else if (config.verbose) {
    logVerbose(`${label}: Text preserved correctly`);
  }
}
