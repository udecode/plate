/**
 * Date Handler - HTML date elements to DOCX formatted text conversion
 *
 * This module provides handlers for converting HTML date elements to
 * docXMLater Run objects with appropriate formatting.
 *
 * Detects:
 * - Elements with data-slate-date attribute
 * - Elements with data-date attribute
 * - <time> elements with datetime attribute
 * - Elements with class containing 'date'
 *
 * @module date-handler
 */

import { Run, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default date text color (gray) */
export const DATE_COLOR = '6B7280';

/** Default date format */
export const DEFAULT_DATE_FORMAT = 'MMMM d, yyyy';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Date format options
 */
export type DateFormatStyle =
  | 'short' // 1/1/24
  | 'medium' // Jan 1, 2024
  | 'long' // January 1, 2024
  | 'full' // Monday, January 1, 2024
  | 'iso' // 2024-01-01
  | 'relative'; // "2 days ago" (if supported)

/**
 * Options for date conversion
 */
export interface DateConversionOptions {
  /** Date format style */
  format?: DateFormatStyle;
  /** Custom date format string */
  formatString?: string;
  /** Custom date color (hex without #) */
  color?: string;
  /** Whether to apply italic formatting (default: false) */
  italic?: boolean;
  /** Locale for date formatting */
  locale?: string;
  /** Include time in output (default: false) */
  includeTime?: boolean;
  /** Time format (12h or 24h) */
  timeFormat?: '12h' | '24h';
}

/**
 * Parsed date data
 */
export interface ParsedDate {
  /** The Date object */
  date: Date | null;
  /** Raw date string from element */
  rawValue: string;
  /** Display text from element */
  displayText: string;
  /** Date format specified in element */
  format?: string;
  /** Whether the date is valid */
  isValid: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if an element is a date element
 *
 * @param element - Element to check
 * @returns True if element is a date
 */
export function isDateElement(element: Element): boolean {
  // Check for data-slate-date attribute
  if (element.hasAttribute('data-slate-date')) {
    return true;
  }

  // Check for data-date attribute
  if (element.hasAttribute('data-date')) {
    return true;
  }

  // Check for <time> element with datetime
  if (
    element.tagName.toLowerCase() === 'time' &&
    element.hasAttribute('datetime')
  ) {
    return true;
  }

  // Check for date class
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    className.toLowerCase().includes('date')
  ) {
    // Exclude common false positives
    if (className.includes('update') || className.includes('mandate')) {
      return false;
    }
    return true;
  }

  // Check for data-slate-type="date"
  const slateType = element.getAttribute('data-slate-type');
  if (slateType === 'date') {
    return true;
  }

  return false;
}

/**
 * Extracts date data from an element
 *
 * @param element - The date element
 * @returns Parsed date data
 */
export function extractDateData(element: Element): ParsedDate {
  const displayText = element.textContent?.trim() || '';

  // Extract raw date value from attributes
  const rawValue =
    element.getAttribute('data-date') ||
    element.getAttribute('data-slate-date') ||
    element.getAttribute('datetime') ||
    element.getAttribute('data-value') ||
    displayText;

  // Extract format hint
  const format =
    element.getAttribute('data-date-format') ||
    element.getAttribute('data-format') ||
    undefined;

  // Parse the date
  let date: Date | null = null;
  let isValid = false;

  if (rawValue) {
    // Try parsing as ISO date first
    date = new Date(rawValue);

    // Check if valid
    isValid = !isNaN(date.getTime());

    // If invalid, try common formats
    if (!isValid) {
      // Try timestamp
      const timestamp = Number.parseInt(rawValue, 10);
      if (!isNaN(timestamp)) {
        // Check if it's seconds or milliseconds
        date = new Date(
          timestamp > 10_000_000_000 ? timestamp : timestamp * 1000
        );
        isValid = !isNaN(date.getTime());
      }
    }
  }

  return {
    date: isValid ? date : null,
    rawValue,
    displayText,
    format,
    isValid,
  };
}

/**
 * Formats a date according to the specified style
 *
 * @param date - Date to format
 * @param style - Format style
 * @param locale - Locale for formatting
 * @param includeTime - Whether to include time
 * @param timeFormat - 12h or 24h format
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  style: DateFormatStyle = 'medium',
  locale = 'en-US',
  includeTime = false,
  timeFormat: '12h' | '24h' = '12h'
): string {
  const dateOptions: Intl.DateTimeFormatOptions = {};

  switch (style) {
    case 'short':
      dateOptions.dateStyle = 'short';
      break;
    case 'medium':
      dateOptions.dateStyle = 'medium';
      break;
    case 'long':
      dateOptions.dateStyle = 'long';
      break;
    case 'full':
      dateOptions.dateStyle = 'full';
      break;
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'relative':
      return formatRelativeDate(date);
    default:
      dateOptions.dateStyle = 'medium';
  }

  if (includeTime) {
    dateOptions.timeStyle = 'short';
    dateOptions.hour12 = timeFormat === '12h';
  }

  try {
    return new Intl.DateTimeFormat(locale, dateOptions).format(date);
  } catch {
    // Fallback for unsupported locales
    return date.toLocaleDateString();
  }
}

/**
 * Formats a date as a relative string (e.g., "2 days ago")
 *
 * @param date - Date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays === -1) {
    return 'Tomorrow';
  }
  if (diffDays > 0 && diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 0 && diffDays > -7) {
    return `in ${Math.abs(diffDays)} days`;
  }
  if (diffDays >= 7 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays <= -7 && diffDays > -30) {
    const weeks = Math.floor(Math.abs(diffDays) / 7);
    return `in ${weeks} week${weeks > 1 ? 's' : ''}`;
  }
  // Fall back to medium format for dates > 30 days
  return formatDate(date, 'medium');
}

// ============================================================================
// Date Handlers
// ============================================================================

/**
 * Handles date elements
 *
 * Creates a styled Run with formatted date text.
 *
 * @param element - The date element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with styled Run
 *
 * @example
 * ```typescript
 * // HTML: <time datetime="2024-01-15">January 15, 2024</time>
 * const result = handleDateElement(element, context);
 * // Creates a gray Run containing "January 15, 2024"
 * ```
 */
export function handleDateElement(
  element: Element,
  context: ConversionContext,
  options: DateConversionOptions = {}
): ConversionResult {
  const {
    format = 'medium',
    color = DATE_COLOR,
    italic = false,
    locale = 'en-US',
    includeTime = false,
    timeFormat = '12h',
  } = options;

  // Extract date data
  const dateData = extractDateData(element);

  // Determine display text
  let text: string;

  if (dateData.isValid && dateData.date) {
    // Format the date according to options
    text = formatDate(dateData.date, format, locale, includeTime, timeFormat);
  } else {
    // Use the original display text if date is invalid
    text = dateData.displayText || dateData.rawValue || 'Invalid Date';
  }

  // Build formatting
  const formatting: RunFormatting = {
    color,
    italic,
    ...(context.inheritedFormatting || {}),
  };

  // Create styled run
  const run = new Run(text, formatting);

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Creates a date Run directly
 *
 * @param date - Date to format
 * @param options - Conversion options
 * @returns Styled Run
 *
 * @example
 * ```typescript
 * const dateRun = createDate(new Date(), { format: 'long' });
 * paragraph.addRun(dateRun);
 * ```
 */
export function createDate(
  date: Date,
  options: DateConversionOptions = {}
): Run {
  const {
    format = 'medium',
    color = DATE_COLOR,
    italic = false,
    locale = 'en-US',
    includeTime = false,
    timeFormat = '12h',
  } = options;

  // Format the date
  const text = formatDate(date, format, locale, includeTime, timeFormat);

  // Build formatting
  const formatting: RunFormatting = {
    color,
    italic,
  };

  return new Run(text, formatting);
}

/**
 * Creates a date Run from a string
 *
 * @param dateString - Date string to parse
 * @param options - Conversion options
 * @returns Styled Run or null if invalid
 */
export function createDateFromString(
  dateString: string,
  options: DateConversionOptions = {}
): Run | null {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return null;
  }

  return createDate(date, options);
}

/**
 * Creates a today's date Run
 *
 * @param options - Conversion options
 * @returns Styled Run with today's date
 */
export function createTodayDate(options: DateConversionOptions = {}): Run {
  return createDate(new Date(), options);
}

/**
 * Creates a date range Run
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @param options - Conversion options
 * @returns Styled Run with date range
 */
export function createDateRange(
  startDate: Date,
  endDate: Date,
  options: DateConversionOptions = {}
): Run {
  const {
    format = 'medium',
    color = DATE_COLOR,
    italic = false,
    locale = 'en-US',
  } = options;

  const startText = formatDate(startDate, format, locale);
  const endText = formatDate(endDate, format, locale);
  const text = `${startText} - ${endText}`;

  const formatting: RunFormatting = {
    color,
    italic,
  };

  return new Run(text, formatting);
}
