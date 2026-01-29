/**
 * Emoji Handler - Emoji detection and proper font handling for DOCX export
 *
 * This module provides handlers for detecting emoji characters in text content
 * and applying the appropriate font (Segoe UI Emoji) for proper rendering in DOCX.
 *
 * Emoji characters require special handling in Word documents because the default
 * font may not render them correctly. This handler detects emoji and wraps them
 * in runs with the Segoe UI Emoji font.
 *
 * @module emoji-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Font used for emoji rendering in DOCX */
export const EMOJI_FONT = 'Segoe UI Emoji';

/** Fallback emoji font for Mac/Linux systems */
export const EMOJI_FONT_FALLBACK = 'Apple Color Emoji';

/**
 * Regex pattern for detecting emoji characters
 * Covers most common emoji ranges including:
 * - Basic emoticons (U+1F600-U+1F64F)
 * - Miscellaneous symbols (U+2600-U+26FF)
 * - Dingbats (U+2700-U+27BF)
 * - Transport and map symbols (U+1F680-U+1F6FF)
 * - Supplemental symbols (U+1F900-U+1F9FF)
 * - Symbols and pictographs extended (U+1FA00-U+1FA6F)
 * - Flags (U+1F1E0-U+1F1FF)
 * - Skin tone modifiers (U+1F3FB-U+1F3FF)
 * - ZWJ sequences and variation selectors
 */
export const EMOJI_REGEX =
  /[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|\uD83C[\uDDE6-\uDDFF]\uD83C[\uDDE6-\uDDFF]|[\u200D\uFE0F]/g;

/**
 * Simple regex for basic emoji detection (fallback for older environments)
 */
export const BASIC_EMOJI_REGEX =
  /[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF]/g;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for emoji conversion
 */
export interface EmojiConversionOptions {
  /** Font family for emoji (default: 'Segoe UI Emoji') */
  emojiFont?: string;
  /** Whether to detect and process emoji (default: true) */
  processEmoji?: boolean;
  /** Font size in half-points (inherits from context if not specified) */
  fontSize?: number;
}

/**
 * Segment of text with or without emoji
 */
export interface TextSegment {
  /** The text content */
  text: string;
  /** Whether this segment contains emoji */
  isEmoji: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Checks if a character is an emoji
 *
 * @param char - The character to check
 * @returns True if the character is an emoji
 */
export function isEmoji(char: string): boolean {
  EMOJI_REGEX.lastIndex = 0; // Reset regex state
  return EMOJI_REGEX.test(char);
}

/**
 * Checks if text contains any emoji characters
 *
 * @param text - The text to check
 * @returns True if text contains emoji
 */
export function containsEmoji(text: string): boolean {
  EMOJI_REGEX.lastIndex = 0; // Reset regex state
  return EMOJI_REGEX.test(text);
}

/**
 * Segments text into emoji and non-emoji parts
 *
 * This function splits text into alternating segments of regular text
 * and emoji characters, allowing each to be formatted with the appropriate font.
 *
 * @param text - The text to segment
 * @returns Array of text segments
 *
 * @example
 * ```typescript
 * const segments = segmentTextWithEmoji('Hello 👋 World 🌍!');
 * // Returns:
 * // [
 * //   { text: 'Hello ', isEmoji: false },
 * //   { text: '👋', isEmoji: true },
 * //   { text: ' World ', isEmoji: false },
 * //   { text: '🌍', isEmoji: true },
 * //   { text: '!', isEmoji: false }
 * // ]
 * ```
 */
export function segmentTextWithEmoji(text: string): TextSegment[] {
  const segments: TextSegment[] = [];

  if (!text) {
    return segments;
  }

  // Reset regex state
  EMOJI_REGEX.lastIndex = 0;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = EMOJI_REGEX.exec(text)) !== null) {
    // Add non-emoji text before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isEmoji: false,
      });
    }

    // Add the emoji
    segments.push({
      text: match[0],
      isEmoji: true,
    });

    lastIndex = EMOJI_REGEX.lastIndex;
  }

  // Add remaining non-emoji text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isEmoji: false,
    });
  }

  return segments;
}

// ============================================================================
// Emoji Handlers
// ============================================================================

/**
 * Processes text content and creates runs with appropriate emoji formatting
 *
 * Splits text into emoji and non-emoji segments, applying Segoe UI Emoji
 * font to emoji characters for proper rendering in Word.
 *
 * @param text - The text content to process
 * @param options - Emoji conversion options
 * @param inheritedFormatting - Formatting inherited from parent context
 * @returns Array of Run objects
 *
 * @example
 * ```typescript
 * const runs = processTextWithEmoji('Hello 👋!', {});
 * // Creates two runs: "Hello " with default font, "👋" with Segoe UI Emoji, "!" with default font
 * ```
 */
export function processTextWithEmoji(
  text: string,
  options: EmojiConversionOptions = {},
  inheritedFormatting?: Record<string, unknown>
): Run[] {
  const { emojiFont = EMOJI_FONT, processEmoji = true, fontSize } = options;

  // If emoji processing is disabled, return single run
  if (!processEmoji || !containsEmoji(text)) {
    const run = new Run(text);
    if (fontSize) {
      run.setSize(fontSize);
    }
    if (inheritedFormatting?.font) {
      run.setFont(inheritedFormatting.font as string);
    }
    return [run];
  }

  const segments = segmentTextWithEmoji(text);
  const runs: Run[] = [];

  for (const segment of segments) {
    if (!segment.text) continue;

    const run = new Run(segment.text);

    // Apply font based on whether segment is emoji
    if (segment.isEmoji) {
      run.setFont(emojiFont);
    } else if (inheritedFormatting?.font) {
      run.setFont(inheritedFormatting.font as string);
    }

    // Apply font size if specified
    if (fontSize) {
      run.setSize(fontSize);
    } else if (inheritedFormatting?.size) {
      run.setSize(inheritedFormatting.size as number);
    }

    // Apply other inherited formatting
    if (inheritedFormatting?.bold) {
      run.setBold(true);
    }
    if (inheritedFormatting?.italic) {
      run.setItalic(true);
    }
    if (inheritedFormatting?.color) {
      run.setColor(inheritedFormatting.color as string);
    }

    runs.push(run);
  }

  return runs;
}

/**
 * Handles elements with emoji content
 *
 * Processes element text content to detect and properly format emoji characters.
 *
 * @param element - The element containing potential emoji
 * @param context - Conversion context
 * @param options - Emoji conversion options
 * @returns Conversion result
 */
export function handleEmojiElement(
  element: Element,
  context: ConversionContext,
  options: EmojiConversionOptions = {}
): ConversionResult {
  const textContent = element.textContent || '';

  // If no emoji, pass through to regular processing
  if (!containsEmoji(textContent)) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Create runs with emoji formatting
  const runs = processTextWithEmoji(
    textContent,
    options,
    context.inheritedFormatting as Record<string, unknown> | undefined
  );

  // If we have a current paragraph, add runs to it
  if (context.currentParagraph) {
    for (const run of runs) {
      context.currentParagraph.addRun(run);
    }

    return {
      element: null,
      processChildren: false, // We've handled the text content
    };
  }

  // Otherwise, create a new paragraph
  const paragraph = new Paragraph();
  for (const run of runs) {
    paragraph.addRun(run);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Creates a run with emoji-safe formatting
 *
 * @param text - Text content (may contain emoji)
 * @param options - Emoji conversion options
 * @returns Array of runs with appropriate formatting
 *
 * @example
 * ```typescript
 * const runs = createEmojiSafeRuns('Great job! 👍');
 * paragraph.addRuns(runs);
 * ```
 */
export function createEmojiSafeRuns(
  text: string,
  options: EmojiConversionOptions = {}
): Run[] {
  return processTextWithEmoji(text, options);
}

/**
 * Creates a paragraph with emoji-safe text
 *
 * @param text - Text content (may contain emoji)
 * @param options - Emoji conversion options
 * @returns Paragraph with properly formatted runs
 *
 * @example
 * ```typescript
 * const paragraph = createEmojiParagraph('Welcome! 🎉');
 * document.addParagraph(paragraph);
 * ```
 */
export function createEmojiParagraph(
  text: string,
  options: EmojiConversionOptions = {}
): Paragraph {
  const paragraph = new Paragraph();
  const runs = processTextWithEmoji(text, options);

  for (const run of runs) {
    paragraph.addRun(run);
  }

  return paragraph;
}

/**
 * Wraps emoji characters with Segoe UI Emoji font spans
 *
 * This is useful for HTML preprocessing before conversion.
 *
 * @param html - HTML string potentially containing emoji
 * @returns HTML with emoji wrapped in font spans
 */
export function wrapEmojiInHtml(html: string): string {
  return html.replace(
    EMOJI_REGEX,
    (match) => `<span style="font-family: '${EMOJI_FONT}'">${match}</span>`
  );
}

/**
 * Extracts all emoji from text
 *
 * @param text - Text to extract emoji from
 * @returns Array of emoji strings found
 *
 * @example
 * ```typescript
 * const emojis = extractEmoji('Hello 👋 World 🌍!');
 * // Returns: ['👋', '🌍']
 * ```
 */
export function extractEmoji(text: string): string[] {
  EMOJI_REGEX.lastIndex = 0;
  return text.match(EMOJI_REGEX) || [];
}

/**
 * Counts emoji in text
 *
 * @param text - Text to count emoji in
 * @returns Number of emoji found
 */
export function countEmoji(text: string): number {
  return extractEmoji(text).length;
}

/**
 * Strips all emoji from text
 *
 * @param text - Text to strip emoji from
 * @returns Text without emoji
 */
export function stripEmoji(text: string): string {
  EMOJI_REGEX.lastIndex = 0;
  return text.replace(EMOJI_REGEX, '').trim();
}
