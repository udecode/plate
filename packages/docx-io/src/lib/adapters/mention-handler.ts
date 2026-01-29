/**
 * Mention Handler - HTML mention elements to DOCX styled text conversion
 *
 * This module provides handlers for converting HTML mention elements to
 * docXMLater Run objects with appropriate styling (blue color, bold).
 *
 * Detects:
 * - Elements with data-slate-mention attribute
 * - Elements with class containing 'mention'
 * - Elements with data-mention-type attribute
 *
 * @module mention-handler
 */

import { Run, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default mention text color (blue) */
export const MENTION_COLOR = '0563C1';

/** Mention prefix character */
export const MENTION_PREFIX = '@';

/** Regex for removing @ prefix */
const MENTION_PREFIX_REGEX = /^@/;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for mention conversion
 */
export type MentionConversionOptions = {
  /** Custom mention color (hex without #) */
  color?: string;
  /** Whether to apply bold formatting (default: true) */
  bold?: boolean;
  /** Custom prefix (default: @) */
  prefix?: string;
  /** Whether to include prefix in output (default: true) */
  includePrefix?: boolean;
};

/**
 * Parsed mention data
 */
export type ParsedMention = {
  /** The mention value (e.g., username, email) */
  value: string;
  /** Mention type (user, channel, etc.) */
  type?: string;
  /** Original element text */
  displayText: string;
  /** Additional data attributes */
  data?: Record<string, string>;
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if an element is a mention element
 *
 * @param element - Element to check
 * @returns True if element is a mention
 */
export function isMentionElement(element: Element): boolean {
  // Check for data-slate-mention attribute
  if (element.hasAttribute('data-slate-mention')) {
    return true;
  }

  // Check for data-mention-type attribute
  if (element.hasAttribute('data-mention-type')) {
    return true;
  }

  // Check for mention class
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    className.toLowerCase().includes('mention')
  ) {
    return true;
  }

  // Check for data-slate-type="mention"
  const slateType = element.getAttribute('data-slate-type');
  if (slateType === 'mention') {
    return true;
  }

  return false;
}

/**
 * Extracts mention data from an element
 *
 * @param element - The mention element
 * @returns Parsed mention data
 */
export function extractMentionData(element: Element): ParsedMention {
  const displayText = element.textContent?.trim() || '';

  // Extract value from attributes
  const value =
    element.getAttribute('data-mention-value') ||
    element.getAttribute('data-slate-value') ||
    element.getAttribute('data-value') ||
    displayText.replace(MENTION_PREFIX_REGEX, '');

  // Extract mention type
  const type =
    element.getAttribute('data-mention-type') ||
    element.getAttribute('data-slate-mention') ||
    element.getAttribute('data-type') ||
    'user';

  // Collect additional data attributes
  const data: Record<string, string> = {};
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-')) {
      data[attr.name] = attr.value;
    }
  }

  return {
    value,
    type,
    displayText,
    data,
  };
}

// ============================================================================
// Mention Handlers
// ============================================================================

/**
 * Handles mention elements
 *
 * Creates a styled Run with @ prefix and blue color.
 *
 * @param element - The mention element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with styled Run
 *
 * @example
 * ```typescript
 * // HTML: <span data-slate-mention="user" data-mention-value="john">@john</span>
 * const result = handleMentionElement(element, context);
 * // Creates a blue, bold Run with "@john"
 * ```
 */
export function handleMentionElement(
  element: Element,
  context: ConversionContext,
  options: MentionConversionOptions = {}
): ConversionResult {
  const {
    color = MENTION_COLOR,
    bold = true,
    prefix = MENTION_PREFIX,
    includePrefix = true,
  } = options;

  // Extract mention data
  const mentionData = extractMentionData(element);

  // Determine display text
  let text = mentionData.displayText;

  // Add prefix if not already present and includePrefix is true
  if (includePrefix && !text.startsWith(prefix)) {
    text = prefix + text;
  }

  // Build formatting
  const formatting: RunFormatting = {
    color,
    bold,
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
 * Creates a mention Run directly
 *
 * @param value - Mention value (username, etc.)
 * @param options - Conversion options
 * @returns Styled Run
 *
 * @example
 * ```typescript
 * const mentionRun = createMention('john.doe');
 * paragraph.addRun(mentionRun);
 * ```
 */
export function createMention(
  value: string,
  options: MentionConversionOptions = {}
): Run {
  const {
    color = MENTION_COLOR,
    bold = true,
    prefix = MENTION_PREFIX,
    includePrefix = true,
  } = options;

  // Build display text
  const text = includePrefix ? `${prefix}${value}` : value;

  // Build formatting
  const formatting: RunFormatting = {
    color,
    bold,
  };

  return new Run(text, formatting);
}

/**
 * Creates a user mention
 *
 * @param username - Username to mention
 * @param options - Additional options
 * @returns Styled Run
 */
export function createUserMention(
  username: string,
  options?: Omit<MentionConversionOptions, 'prefix'>
): Run {
  return createMention(username, { ...options, prefix: MENTION_PREFIX });
}

/**
 * Creates a channel mention (e.g., Slack-style)
 *
 * @param channel - Channel name to mention
 * @param options - Additional options
 * @returns Styled Run
 */
export function createChannelMention(
  channel: string,
  options?: Omit<MentionConversionOptions, 'prefix'>
): Run {
  return createMention(channel, { ...options, prefix: '#' });
}
