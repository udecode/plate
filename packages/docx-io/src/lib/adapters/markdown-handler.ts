/**
 * Markdown Handler - Markdown element rules to DOCX handlers
 *
 * This module provides handlers for converting Markdown-specific elements
 * to DOCX format. It handles inline code, fenced code blocks, and GFM
 * (GitHub Flavored Markdown) extensions.
 *
 * Supports:
 * - Inline code (backticks)
 * - Fenced code blocks with language specifiers
 * - GFM strikethrough (~~text~~)
 * - GFM task lists
 * - GFM tables
 * - Autolinks
 *
 * @module markdown-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';
import {
  CODE_BLOCK_FONT,
  CODE_BLOCK_FONT_SIZE,
  CODE_BLOCK_BACKGROUND,
  CODE_BLOCK_INDENT,
  splitCodeIntoLines,
} from './code-block-handler';

// ============================================================================
// Constants
// ============================================================================

/** Default font for inline code */
export const INLINE_CODE_FONT = CODE_BLOCK_FONT;

/** Default font size for inline code in half-points */
export const INLINE_CODE_FONT_SIZE = CODE_BLOCK_FONT_SIZE;

/** Default background for inline code */
export const INLINE_CODE_BACKGROUND = CODE_BLOCK_BACKGROUND;

/** Strikethrough color (for GFM ~~text~~) */
export const STRIKETHROUGH_COLOR = '666666';

/** Task list checkbox characters */
export const TASK_UNCHECKED = '\u2610'; // Ballot box
export const TASK_CHECKED = '\u2611'; // Ballot box with check

/** Class patterns for Markdown elements */
export const MARKDOWN_CLASS_PATTERNS = {
  inlineCode: ['inline-code', 'code-inline', 'md-code'],
  fencedCode: ['fenced-code', 'code-block', 'hljs', 'prism'],
  strikethrough: ['strikethrough', 'line-through', 'del'],
  taskList: ['task-list', 'todo-list', 'checklist'],
  autolink: ['autolink', 'md-link'],
};

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for markdown conversion
 */
export interface MarkdownConversionOptions {
  /** Font for code elements (default: 'Courier New') */
  codeFont?: string;
  /** Font size for code in half-points (default: 20) */
  codeFontSize?: number;
  /** Background color for code (default: 'F5F5F5') */
  codeBackground?: string;
  /** Whether to apply background shading to inline code (default: true) */
  applyCodeShading?: boolean;
  /** Left indent for code blocks in twips (default: 360) */
  codeBlockIndent?: number;
  /** Whether to include task list checkboxes (default: true) */
  includeTaskCheckboxes?: boolean;
  /** Whether to make autolinks clickable (default: true) */
  makeAutolinksClickable?: boolean;
}

/**
 * Detected code block language
 */
export interface CodeBlockInfo {
  /** Programming language (if specified) */
  language?: string;
  /** Whether this is a fenced code block */
  isFenced: boolean;
  /** Line numbers if present */
  lineNumbers?: boolean;
  /** Filename if specified */
  filename?: string;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Checks if an element is an inline code element
 *
 * @param element - The element to check
 * @returns True if the element is inline code
 */
export function isInlineCodeElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Check tag name
  if (tagName === 'code') {
    // Make sure it's not inside a <pre> (which would make it a code block)
    const parent = element.parentElement;
    if (parent?.tagName.toLowerCase() === 'pre') {
      return false;
    }
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of MARKDOWN_CLASS_PATTERNS.inlineCode) {
    if (className.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if an element is a fenced code block
 *
 * @param element - The element to check
 * @returns True if the element is a fenced code block
 */
export function isFencedCodeBlock(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Check for <pre><code> structure
  if (tagName === 'pre') {
    const codeChild = element.querySelector('code');
    if (codeChild) {
      return true;
    }
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of MARKDOWN_CLASS_PATTERNS.fencedCode) {
    if (className.includes(pattern)) {
      return true;
    }
  }

  // Check data attributes
  if (
    element.hasAttribute('data-language') ||
    element.hasAttribute('data-lang')
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts code block information from an element
 *
 * @param element - The code block element
 * @returns Code block information
 */
export function extractCodeBlockInfo(element: Element): CodeBlockInfo {
  const info: CodeBlockInfo = {
    isFenced: isFencedCodeBlock(element),
  };

  // Try to extract language from various sources
  const codeElement =
    element.tagName.toLowerCase() === 'code'
      ? element
      : element.querySelector('code');

  if (codeElement) {
    // Check class name for language (common pattern: language-javascript, lang-js)
    const className = codeElement.className || '';
    const langMatch = className.match(/(?:language|lang)-([a-z0-9]+)/i);
    if (langMatch) {
      info.language = langMatch[1];
    }
  }

  // Check data attributes
  info.language =
    info.language ||
    element.getAttribute('data-language') ||
    element.getAttribute('data-lang') ||
    undefined;

  // Check for line numbers
  if (
    element.hasAttribute('data-line-numbers') ||
    element.className?.includes('line-numbers')
  ) {
    info.lineNumbers = true;
  }

  // Check for filename
  info.filename =
    element.getAttribute('data-filename') ||
    element.getAttribute('title') ||
    undefined;

  return info;
}

/**
 * Checks if an element is a GFM strikethrough
 *
 * @param element - The element to check
 * @returns True if the element is strikethrough
 */
export function isStrikethroughElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  // Check tag names
  if (['s', 'strike', 'del'].includes(tagName)) {
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of MARKDOWN_CLASS_PATTERNS.strikethrough) {
    if (className.includes(pattern)) {
      return true;
    }
  }

  // Check style
  const htmlElement = element as HTMLElement;
  if (htmlElement.style?.textDecoration?.includes('line-through')) {
    return true;
  }

  return false;
}

/**
 * Checks if an element is a task list item
 *
 * @param element - The element to check
 * @returns Checked state or null if not a task list item
 */
export function getTaskListState(element: Element): boolean | null {
  // Check for data-checked attribute
  const checkedAttr = element.getAttribute('data-checked');
  if (checkedAttr !== null) {
    return checkedAttr === 'true';
  }

  // Check for aria-checked attribute
  const ariaChecked = element.getAttribute('aria-checked');
  if (ariaChecked !== null) {
    return ariaChecked === 'true';
  }

  // Check for checkbox input inside
  const checkbox = element.querySelector('input[type="checkbox"]');
  if (checkbox) {
    return (checkbox as HTMLInputElement).checked;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  if (className.includes('checked') || className.includes('completed')) {
    return true;
  }
  if (className.includes('unchecked') || className.includes('pending')) {
    return false;
  }

  return null;
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles inline code elements
 *
 * Creates a Run with monospace font and optional background shading.
 *
 * @param element - The inline code element
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleInlineCode(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  const {
    codeFont = INLINE_CODE_FONT,
    codeFontSize = INLINE_CODE_FONT_SIZE,
    codeBackground = INLINE_CODE_BACKGROUND,
    applyCodeShading = true,
  } = options;

  const textContent = element.textContent || '';

  // Create run with code formatting
  const run = new Run(textContent);
  run.setFont(codeFont);
  run.setSize(codeFontSize);

  if (applyCodeShading) {
    run.setShading({
      fill: codeBackground,
      val: 'clear',
    });
  }

  // Add to current paragraph if available
  if (context.currentParagraph) {
    context.currentParagraph.addRun(run);
    return {
      element: null,
      processChildren: false,
    };
  }

  // Otherwise create a new paragraph
  const paragraph = new Paragraph();
  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles fenced code blocks
 *
 * Creates one or more Paragraphs with code block styling.
 *
 * @param element - The fenced code block element
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleFencedCodeBlock(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  const {
    codeFont = CODE_BLOCK_FONT,
    codeFontSize = CODE_BLOCK_FONT_SIZE,
    codeBackground = CODE_BLOCK_BACKGROUND,
    applyCodeShading = true,
    codeBlockIndent = CODE_BLOCK_INDENT,
  } = options;

  // Extract code block info
  const info = extractCodeBlockInfo(element);

  // Get text content
  const codeElement = element.querySelector('code') || element;
  const textContent = codeElement.textContent || '';
  const lines = splitCodeIntoLines(textContent, false);

  if (lines.length === 0) {
    return {
      element: null,
      processChildren: false,
    };
  }

  // Create paragraphs for each line
  const paragraphs: Paragraph[] = [];

  // Add language header if present
  if (info.language || info.filename) {
    const headerPara = new Paragraph();
    headerPara.setLeftIndent(codeBlockIndent);

    const headerText = info.filename || info.language || '';
    const headerRun = new Run(headerText);
    headerRun.setFont(codeFont);
    headerRun.setSize(codeFontSize - 2); // Slightly smaller
    headerRun.setColor('888888');
    headerRun.setItalic(true);

    headerPara.addRun(headerRun);
    paragraphs.push(headerPara);
  }

  // Create paragraphs for code lines
  for (const line of lines) {
    const paragraph = new Paragraph();
    paragraph.setLeftIndent(codeBlockIndent);
    paragraph.setStyle('CodeBlock');

    const run = new Run(line || ' ');
    run.setFont(codeFont);
    run.setSize(codeFontSize);

    if (applyCodeShading) {
      run.setShading({
        fill: codeBackground,
        val: 'clear',
      });
    }

    paragraph.addRun(run);
    paragraphs.push(paragraph);
  }

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
 * Handles GFM strikethrough elements
 *
 * Applies strikethrough formatting to child content.
 *
 * @param element - The strikethrough element
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleStrikethrough(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  return {
    element: null,
    processChildren: true,
    childContext: {
      inheritedFormatting: {
        ...(context.inheritedFormatting || {}),
        strike: true,
      },
    },
  };
}

/**
 * Handles GFM task list items
 *
 * Creates a paragraph with checkbox character prefix.
 *
 * @param element - The task list item element
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleTaskListItem(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  const { includeTaskCheckboxes = true } = options;

  const isChecked = getTaskListState(element);

  // If not a task list item, pass through
  if (isChecked === null) {
    return {
      element: null,
      processChildren: true,
    };
  }

  const paragraph = new Paragraph();

  // Add checkbox if enabled
  if (includeTaskCheckboxes) {
    const checkboxChar = isChecked ? TASK_CHECKED : TASK_UNCHECKED;
    const checkboxRun = new Run(checkboxChar + ' ');
    paragraph.addRun(checkboxRun);
  }

  // Get text content (excluding checkbox)
  let textContent = element.textContent || '';
  // Remove checkbox characters if present
  textContent = textContent.replace(/^\s*[[\]x\u2610\u2611\u2612]\s*/i, '');

  if (textContent) {
    const textRun = new Run(textContent);

    // Apply strikethrough to checked items
    if (isChecked) {
      textRun.setStrike(true);
      textRun.setColor('888888');
    }

    paragraph.addRun(textRun);
  }

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles autolink elements
 *
 * @param element - The autolink element
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleAutolink(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  const { makeAutolinksClickable = true } = options;

  const href =
    element.getAttribute('href') ||
    element.getAttribute('data-url') ||
    element.textContent ||
    '';

  const displayText = element.textContent || href;

  // Create a run with link styling
  const run = new Run(displayText);
  run.setColor('0000FF');
  run.setUnderline('single');

  // Add to current paragraph if available
  if (context.currentParagraph) {
    context.currentParagraph.addRun(run);
    return {
      element: null,
      processChildren: false,
    };
  }

  // Otherwise create a new paragraph
  const paragraph = new Paragraph();
  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * General markdown element handler that detects type and delegates
 *
 * @param element - The element to process
 * @param context - Conversion context
 * @param options - Markdown conversion options
 * @returns Conversion result
 */
export function handleMarkdownElement(
  element: Element,
  context: ConversionContext,
  options: MarkdownConversionOptions = {}
): ConversionResult {
  // Check for inline code
  if (isInlineCodeElement(element)) {
    return handleInlineCode(element, context, options);
  }

  // Check for fenced code block
  if (isFencedCodeBlock(element)) {
    return handleFencedCodeBlock(element, context, options);
  }

  // Check for strikethrough
  if (isStrikethroughElement(element)) {
    return handleStrikethrough(element, context, options);
  }

  // Check for task list item
  if (getTaskListState(element) !== null) {
    return handleTaskListItem(element, context, options);
  }

  // Pass through for unrecognized elements
  return {
    element: null,
    processChildren: true,
  };
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates an inline code run
 *
 * @param text - The code text
 * @param options - Markdown conversion options
 * @returns Run with inline code formatting
 */
export function createInlineCodeRun(
  text: string,
  options: MarkdownConversionOptions = {}
): Run {
  const {
    codeFont = INLINE_CODE_FONT,
    codeFontSize = INLINE_CODE_FONT_SIZE,
    codeBackground = INLINE_CODE_BACKGROUND,
    applyCodeShading = true,
  } = options;

  const run = new Run(text);
  run.setFont(codeFont);
  run.setSize(codeFontSize);

  if (applyCodeShading) {
    run.setShading({
      fill: codeBackground,
      val: 'clear',
    });
  }

  return run;
}

/**
 * Creates a fenced code block from text
 *
 * @param code - The code content
 * @param language - Optional language identifier
 * @param options - Markdown conversion options
 * @returns Array of paragraphs representing the code block
 */
export function createFencedCodeBlock(
  code: string,
  language?: string,
  options: MarkdownConversionOptions = {}
): Paragraph[] {
  const {
    codeFont = CODE_BLOCK_FONT,
    codeFontSize = CODE_BLOCK_FONT_SIZE,
    codeBackground = CODE_BLOCK_BACKGROUND,
    applyCodeShading = true,
    codeBlockIndent = CODE_BLOCK_INDENT,
  } = options;

  const lines = splitCodeIntoLines(code, false);
  const paragraphs: Paragraph[] = [];

  // Add language header if present
  if (language) {
    const headerPara = new Paragraph();
    headerPara.setLeftIndent(codeBlockIndent);

    const headerRun = new Run(language);
    headerRun.setFont(codeFont);
    headerRun.setSize(codeFontSize - 2);
    headerRun.setColor('888888');
    headerRun.setItalic(true);

    headerPara.addRun(headerRun);
    paragraphs.push(headerPara);
  }

  // Create paragraphs for code lines
  for (const line of lines) {
    const paragraph = new Paragraph();
    paragraph.setLeftIndent(codeBlockIndent);
    paragraph.setStyle('CodeBlock');

    const run = new Run(line || ' ');
    run.setFont(codeFont);
    run.setSize(codeFontSize);

    if (applyCodeShading) {
      run.setShading({
        fill: codeBackground,
        val: 'clear',
      });
    }

    paragraph.addRun(run);
    paragraphs.push(paragraph);
  }

  return paragraphs;
}

/**
 * Creates a task list item paragraph
 *
 * @param text - The task text
 * @param checked - Whether the task is checked
 * @param options - Markdown conversion options
 * @returns Paragraph with task formatting
 */
export function createTaskListItem(
  text: string,
  checked = false,
  options: MarkdownConversionOptions = {}
): Paragraph {
  const { includeTaskCheckboxes = true } = options;

  const paragraph = new Paragraph();

  // Add checkbox
  if (includeTaskCheckboxes) {
    const checkboxChar = checked ? TASK_CHECKED : TASK_UNCHECKED;
    const checkboxRun = new Run(checkboxChar + ' ');
    paragraph.addRun(checkboxRun);
  }

  // Add text
  const textRun = new Run(text);
  if (checked) {
    textRun.setStrike(true);
    textRun.setColor('888888');
  }
  paragraph.addRun(textRun);

  return paragraph;
}
