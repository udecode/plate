/**
 * Code Block Handler - HTML <pre>/<code> to DOCX preformatted paragraph conversion
 *
 * This module provides handlers for converting HTML code block elements to
 * docXMLater Paragraphs with monospace font styling.
 *
 * Supports:
 * - <pre> elements with preserved whitespace
 * - <code> blocks inside <pre> elements
 * - Monospace font (Courier New)
 * - Optional gray background shading
 * - Line-by-line paragraph generation for multi-line code
 *
 * @module code-block-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default monospace font for code blocks */
export const CODE_BLOCK_FONT = 'Courier New';

/** Default font size for code in half-points (20 = 10pt) */
export const CODE_BLOCK_FONT_SIZE = 20;

/** Default background color for code blocks (light gray) */
export const CODE_BLOCK_BACKGROUND = 'F5F5F5';

/** Default left indentation for code blocks in twips (360 = 0.25 inch) */
export const CODE_BLOCK_INDENT = 360;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for code block conversion
 */
export interface CodeBlockConversionOptions {
  /** Font family for code text (default: 'Courier New') */
  fontFamily?: string;
  /** Font size in half-points (default: 20 = 10pt) */
  fontSize?: number;
  /** Background color in hex without # (default: 'F5F5F5') */
  backgroundColor?: string;
  /** Whether to apply background shading (default: true) */
  applyShading?: boolean;
  /** Left indentation in twips (default: 360) */
  leftIndent?: number;
  /** Whether to preserve leading/trailing empty lines (default: false) */
  preserveEmptyLines?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes whitespace in code text while preserving structure
 * Converts tabs to spaces and handles different line ending formats
 *
 * @param text - Raw text from code element
 * @returns Normalized text with consistent line endings
 */
export function normalizeCodeText(text: string): string {
  // Normalize line endings to \n
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Convert tabs to 4 spaces (standard for code)
  normalized = normalized.replace(/\t/g, '    ');

  return normalized;
}

/**
 * Splits code text into lines for paragraph generation
 *
 * @param text - Normalized code text
 * @param preserveEmptyLines - Whether to keep empty lines
 * @returns Array of lines
 */
export function splitCodeIntoLines(
  text: string,
  preserveEmptyLines = false
): string[] {
  const lines = normalizeCodeText(text).split('\n');

  if (!preserveEmptyLines) {
    // Remove leading and trailing empty lines
    while (lines.length > 0 && lines[0]?.trim() === '') {
      lines.shift();
    }
    while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') {
      lines.pop();
    }
  }

  return lines;
}

// ============================================================================
// Code Block Handlers
// ============================================================================

/**
 * Handles <pre> elements (preformatted text blocks)
 *
 * Creates paragraphs with monospace font and preserved whitespace.
 * Each line becomes a separate paragraph with appropriate styling.
 *
 * @param element - The <pre> element
 * @param context - Conversion context
 * @param options - Code block conversion options
 * @returns Conversion result with Paragraph(s)
 *
 * @example
 * ```typescript
 * const result = handlePreElement(preElement, context);
 * if (result.elements) {
 *   result.elements.forEach(p => document.addParagraph(p as Paragraph));
 * }
 * ```
 */
export function handlePreElement(
  element: Element,
  context: ConversionContext,
  options: CodeBlockConversionOptions = {}
): ConversionResult {
  const {
    fontFamily = CODE_BLOCK_FONT,
    fontSize = CODE_BLOCK_FONT_SIZE,
    backgroundColor = CODE_BLOCK_BACKGROUND,
    applyShading = true,
    leftIndent = CODE_BLOCK_INDENT,
    preserveEmptyLines = false,
  } = options;

  // Extract text content from the element
  const textContent = element.textContent || '';
  const lines = splitCodeIntoLines(textContent, preserveEmptyLines);

  // If no content, return empty result
  if (lines.length === 0) {
    return {
      element: null,
      processChildren: false,
    };
  }

  // Create paragraphs for each line
  const paragraphs: Paragraph[] = lines.map((line) => {
    const paragraph = new Paragraph();

    // Set left indentation
    paragraph.setLeftIndent(leftIndent);

    // Apply the 'Preformatted' style if available
    paragraph.setStyle('CodeBlock');

    // Create run with code formatting
    const run = new Run(line || ' '); // Use space for empty lines to maintain spacing
    run.setFont(fontFamily);
    run.setSize(fontSize);

    // Apply shading if enabled
    if (applyShading) {
      run.setShading({
        fill: backgroundColor,
        val: 'clear',
      });
    }

    paragraph.addRun(run);

    return paragraph;
  });

  // Return first paragraph as element and rest as additional elements
  if (paragraphs.length === 1) {
    return {
      element: paragraphs[0] as unknown as ConversionResult['element'],
      processChildren: false,
    };
  }

  return {
    element: paragraphs[0] as unknown as ConversionResult['element'],
    elements: paragraphs as unknown as ConversionResult['elements'],
    processChildren: false,
  };
}

/**
 * Handles <code> elements inside <pre> (code blocks)
 *
 * When inside a <pre>, this handler inherits the code block styling.
 * When standalone (inline code), it applies monospace font.
 *
 * @param element - The <code> element
 * @param context - Conversion context
 * @param options - Code block conversion options
 * @returns Conversion result
 */
export function handleCodeElement(
  element: Element,
  context: ConversionContext,
  options: CodeBlockConversionOptions = {}
): ConversionResult {
  const {
    fontFamily = CODE_BLOCK_FONT,
    fontSize = CODE_BLOCK_FONT_SIZE,
    backgroundColor = CODE_BLOCK_BACKGROUND,
    applyShading = true,
  } = options;

  // Check if inside a <pre> element
  const isInsidePre = element.parentElement?.tagName.toLowerCase() === 'pre';

  if (isInsidePre) {
    // Let the parent <pre> handle the conversion
    return {
      element: null,
      processChildren: true,
      childContext: {
        inheritedFormatting: {
          ...(context.inheritedFormatting || {}),
          font: fontFamily,
          size: fontSize,
        },
      },
    };
  }

  // For inline code, apply monospace formatting
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        font: fontFamily,
        size: fontSize,
        ...(applyShading
          ? { shading: { fill: backgroundColor, val: 'clear' } }
          : {}),
      },
    },
  };
}

/**
 * Creates a code block from text content
 *
 * Utility function to create a code block from a string.
 *
 * @param code - The code text
 * @param options - Code block conversion options
 * @returns Array of paragraphs representing the code block
 *
 * @example
 * ```typescript
 * const paragraphs = createCodeBlock('const x = 1;\nconst y = 2;');
 * paragraphs.forEach(p => document.addParagraph(p));
 * ```
 */
export function createCodeBlock(
  code: string,
  options: CodeBlockConversionOptions = {}
): Paragraph[] {
  const {
    fontFamily = CODE_BLOCK_FONT,
    fontSize = CODE_BLOCK_FONT_SIZE,
    backgroundColor = CODE_BLOCK_BACKGROUND,
    applyShading = true,
    leftIndent = CODE_BLOCK_INDENT,
    preserveEmptyLines = false,
  } = options;

  const lines = splitCodeIntoLines(code, preserveEmptyLines);

  return lines.map((line) => {
    const paragraph = new Paragraph();
    paragraph.setLeftIndent(leftIndent);
    paragraph.setStyle('CodeBlock');

    const run = new Run(line || ' ');
    run.setFont(fontFamily);
    run.setSize(fontSize);

    if (applyShading) {
      run.setShading({
        fill: backgroundColor,
        val: 'clear',
      });
    }

    paragraph.addRun(run);
    return paragraph;
  });
}

/**
 * Creates an inline code run
 *
 * @param text - The code text
 * @param options - Formatting options
 * @returns Run with code formatting
 *
 * @example
 * ```typescript
 * const paragraph = new Paragraph();
 * paragraph.addRun(new Run('The '));
 * paragraph.addRun(createInlineCodeRun('console.log()'));
 * paragraph.addRun(new Run(' function'));
 * ```
 */
export function createInlineCodeRun(
  text: string,
  options: CodeBlockConversionOptions = {}
): Run {
  const {
    fontFamily = CODE_BLOCK_FONT,
    fontSize = CODE_BLOCK_FONT_SIZE,
    backgroundColor = CODE_BLOCK_BACKGROUND,
    applyShading = true,
  } = options;

  const run = new Run(text);
  run.setFont(fontFamily);
  run.setSize(fontSize);

  if (applyShading) {
    run.setShading({
      fill: backgroundColor,
      val: 'clear',
    });
  }

  return run;
}
