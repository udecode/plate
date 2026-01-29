/**
 * List Handler - HTML list to DOCX list conversion
 *
 * This module provides handlers for converting HTML list elements to
 * docXMLater numbered/bulleted lists using the NumberingManager.
 *
 * Supports:
 * - Ordered lists (<ol>) with numbered formatting
 * - Unordered lists (<ul>) with bullet formatting
 * - Nested lists with proper ilvl (indentation level)
 * - Custom start numbers
 * - List style types (decimal, lower-alpha, etc.)
 * - Task lists with checkbox symbols (checked/unchecked)
 * - Modern Plate list elements with listStyleType
 *
 * @module list-handler
 */

import {
  type NumberingManager,
  AbstractNumbering,
  NumberingInstance,
  NumberingLevel,
  Paragraph,
} from '../docXMLater/src';
import type { NumberFormat } from '../docXMLater/src';
import type {
  ConversionContext,
  ConversionResult,
  ListContext,
} from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Maximum nesting level supported (9 levels, 0-8) */
export const MAX_LIST_LEVEL = 8;

/** Default left indentation per level in twips (360 twips = 0.25 inch) */
export const DEFAULT_INDENT_PER_LEVEL = 720;

/** Default hanging indentation in twips */
export const DEFAULT_HANGING_INDENT = 360;

/** Bullet characters for different levels */
export const BULLET_CHARACTERS = [
  '\u2022', // Level 0: Bullet (•)
  '\u25E6', // Level 1: White Bullet (◦)
  '\u25AA', // Level 2: Black Small Square (▪)
  '\u2022', // Level 3: Bullet (•)
  '\u25E6', // Level 4: White Bullet (◦)
  '\u25AA', // Level 5: Black Small Square (▪)
  '\u2022', // Level 6: Bullet (•)
  '\u25E6', // Level 7: White Bullet (◦)
  '\u25AA', // Level 8: Black Small Square (▪)
];

/** Default bullet font */
export const BULLET_FONT = 'Symbol';

/** Numbering formats for ordered lists */
export const NUMBERING_FORMATS = {
  decimal: 'decimal',
  lowerAlpha: 'lowerLetter',
  upperAlpha: 'upperLetter',
  lowerRoman: 'lowerRoman',
  upperRoman: 'upperRoman',
  none: 'none',
} as const;

// ============================================================================
// Task List Constants
// ============================================================================

/** Unchecked checkbox symbol for task lists */
export const TASK_LIST_UNCHECKED = '\u2610'; // ☐

/** Checked checkbox symbol for task lists */
export const TASK_LIST_CHECKED = '\u2611'; // ☑

/** Crossed checkbox symbol for task lists (cancelled/strikethrough) */
export const TASK_LIST_CANCELLED = '\u2612'; // ☒

/** Default font for task list checkboxes */
export const TASK_LIST_FONT = 'Segoe UI Symbol';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for list conversion
 */
export interface ListConversionOptions {
  /** Indentation per level in twips */
  indentPerLevel?: number;
  /** Hanging indentation in twips */
  hangingIndent?: number;
  /** Custom bullet characters per level */
  bulletCharacters?: string[];
  /** Custom numbering formats per level for ordered lists */
  numberingFormats?: string[];
  /** Whether to use continuous numbering across lists */
  continuousNumbering?: boolean;
}

/**
 * Extended list context with numbering details
 */
export interface ExtendedListContext extends ListContext {
  /** The NumberingManager instance */
  numberingManager: NumberingManager;
  /** Abstract numbering ID being used */
  abstractNumId: number;
  /** Stack of parent list types for nested lists */
  parentTypes: Array<'ordered' | 'unordered'>;
}

/**
 * Result of creating a list numbering definition
 */
export interface ListNumberingResult {
  /** Abstract numbering ID */
  abstractNumId: number;
  /** Numbering instance ID */
  numId: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps HTML list-style-type to DOCX numbering format
 *
 * @param styleType - CSS list-style-type value
 * @returns DOCX numbering format
 */
export function mapListStyleType(styleType: string | null): string {
  if (!styleType) return NUMBERING_FORMATS.decimal;

  switch (styleType.toLowerCase()) {
    case 'decimal':
    case 'decimal-leading-zero':
      return NUMBERING_FORMATS.decimal;
    case 'lower-alpha':
    case 'lower-latin':
      return NUMBERING_FORMATS.lowerAlpha;
    case 'upper-alpha':
    case 'upper-latin':
      return NUMBERING_FORMATS.upperAlpha;
    case 'lower-roman':
      return NUMBERING_FORMATS.lowerRoman;
    case 'upper-roman':
      return NUMBERING_FORMATS.upperRoman;
    case 'none':
      return NUMBERING_FORMATS.none;
    case 'disc':
    case 'circle':
    case 'square':
      // These are bullet types, not numbering formats
      return 'bullet';
    default:
      return NUMBERING_FORMATS.decimal;
  }
}

/**
 * Gets the bullet character for a given level
 *
 * @param level - Nesting level (0-based)
 * @param customBullets - Optional custom bullet characters
 * @returns Bullet character
 */
export function getBulletCharacter(
  level: number,
  customBullets?: string[]
): string {
  const bullets = customBullets || BULLET_CHARACTERS;
  const safeLevel = Math.min(Math.max(level, 0), bullets.length - 1);
  return bullets[safeLevel] || BULLET_CHARACTERS[0] || '\u2022';
}

/**
 * Creates indentation for a list level
 *
 * @param level - Nesting level (0-based)
 * @param indentPerLevel - Indentation per level in twips
 * @param hangingIndent - Hanging indentation in twips
 * @returns Indentation values
 */
export function createLevelIndentation(
  level: number,
  indentPerLevel: number = DEFAULT_INDENT_PER_LEVEL,
  hangingIndent: number = DEFAULT_HANGING_INDENT
): { left: number; hanging: number } {
  return {
    left: (level + 1) * indentPerLevel,
    hanging: hangingIndent,
  };
}

// ============================================================================
// Numbering Definition Creators
// ============================================================================

/**
 * Creates a bullet list abstract numbering definition
 *
 * @param manager - NumberingManager instance
 * @param options - List options
 * @returns Created abstract numbering
 */
export function createBulletListNumbering(
  manager: NumberingManager,
  options: ListConversionOptions = {}
): AbstractNumbering {
  const {
    indentPerLevel = DEFAULT_INDENT_PER_LEVEL,
    hangingIndent = DEFAULT_HANGING_INDENT,
    bulletCharacters = BULLET_CHARACTERS,
  } = options;

  // Create abstract numbering with bullet levels
  const abstractNumbering = AbstractNumbering.createBulletList(
    manager.getAllAbstractNumberings().length
  );

  // Configure each level
  for (let level = 0; level <= MAX_LIST_LEVEL; level++) {
    const bulletChar = getBulletCharacter(level, bulletCharacters);
    const indent = createLevelIndentation(level, indentPerLevel, hangingIndent);

    // Get or create level
    let numberingLevel = abstractNumbering.getLevel(level);
    if (numberingLevel) {
      // Configure existing level
      numberingLevel
        .setFormat('bullet')
        .setText(bulletChar)
        .setFont(BULLET_FONT)
        .setLeftIndent(indent.left)
        .setHangingIndent(indent.hanging);
    } else {
      numberingLevel = new NumberingLevel({
        level,
        format: 'bullet',
        text: bulletChar,
        font: BULLET_FONT,
        leftIndent: indent.left,
        hangingIndent: indent.hanging,
      });
      abstractNumbering.addLevel(numberingLevel);
    }
  }

  // Add to manager
  manager.addAbstractNumbering(abstractNumbering);

  return abstractNumbering;
}

/**
 * Creates a numbered list abstract numbering definition
 *
 * @param manager - NumberingManager instance
 * @param options - List options
 * @returns Created abstract numbering
 */
export function createNumberedListNumbering(
  manager: NumberingManager,
  options: ListConversionOptions = {}
): AbstractNumbering {
  const {
    indentPerLevel = DEFAULT_INDENT_PER_LEVEL,
    hangingIndent = DEFAULT_HANGING_INDENT,
    numberingFormats,
  } = options;

  // Default format progression for nested levels
  const defaultFormats = [
    'decimal', // Level 0: 1, 2, 3
    'lowerLetter', // Level 1: a, b, c
    'lowerRoman', // Level 2: i, ii, iii
    'decimal', // Level 3: 1, 2, 3
    'lowerLetter', // Level 4: a, b, c
    'lowerRoman', // Level 5: i, ii, iii
    'decimal', // Level 6: 1, 2, 3
    'lowerLetter', // Level 7: a, b, c
    'lowerRoman', // Level 8: i, ii, iii
  ];

  const formats = numberingFormats || defaultFormats;

  // Create abstract numbering
  const abstractNumbering = AbstractNumbering.createNumberedList(
    manager.getAllAbstractNumberings().length
  );

  // Configure each level
  for (let level = 0; level <= MAX_LIST_LEVEL; level++) {
    const format = formats[level] || 'decimal';
    const indent = createLevelIndentation(level, indentPerLevel, hangingIndent);

    // Get or create level
    let numberingLevel = abstractNumbering.getLevel(level);
    if (numberingLevel) {
      // Configure existing level with appropriate format
      numberingLevel
        .setFormat(format as NumberFormat)
        .setText(`%${level + 1}.`) // %1., %2., etc.
        .setLeftIndent(indent.left)
        .setHangingIndent(indent.hanging);
    } else {
      numberingLevel = new NumberingLevel({
        level,
        format: format as NumberFormat,
        text: `%${level + 1}.`, // %1., %2., etc.
        leftIndent: indent.left,
        hangingIndent: indent.hanging,
      });
      abstractNumbering.addLevel(numberingLevel);
    }
  }

  // Add to manager
  manager.addAbstractNumbering(abstractNumbering);

  return abstractNumbering;
}

/**
 * Gets or creates a numbering instance for a list
 *
 * @param manager - NumberingManager instance
 * @param type - List type
 * @param options - List options
 * @returns Numbering result with IDs
 */
export function getOrCreateListNumbering(
  manager: NumberingManager,
  type: 'ordered' | 'unordered',
  options: ListConversionOptions = {}
): ListNumberingResult {
  // Check for existing abstract numbering of this type
  const existingAbstract = manager.getAllAbstractNumberings().find((abs) => {
    const level0 = abs.getLevel(0);
    if (!level0) return false;
    const format = level0.getFormat();
    return type === 'unordered' ? format === 'bullet' : format !== 'bullet';
  });

  let abstractNumId: number;

  if (existingAbstract && options.continuousNumbering) {
    abstractNumId = existingAbstract.getAbstractNumId();
  } else {
    // Create new abstract numbering
    const abstractNumbering =
      type === 'unordered'
        ? createBulletListNumbering(manager, options)
        : createNumberedListNumbering(manager, options);
    abstractNumId = abstractNumbering.getAbstractNumId();
  }

  // Create new numbering instance
  const numId = manager.getAllInstances().length + 1;
  const instance = new NumberingInstance(numId, abstractNumId);
  manager.addInstance(instance);

  return { abstractNumId, numId };
}

// ============================================================================
// List Handlers
// ============================================================================

/**
 * Handles unordered list elements (<ul>)
 *
 * Creates bullet list context for child items.
 *
 * @param element - The <ul> element
 * @param context - Conversion context
 * @param options - List options
 * @returns Conversion result with list context
 */
export function handleUnorderedListElement(
  element: Element,
  context: ConversionContext,
  options: ListConversionOptions = {}
): ConversionResult {
  // Determine nesting level
  const currentLevel = context.listContext?.level ?? -1;
  const newLevel = Math.min(currentLevel + 1, MAX_LIST_LEVEL);

  // Get or create numbering manager
  const numberingManager = context.numberingManager;
  if (!numberingManager) {
    return {
      error: 'NumberingManager not available in context',
      processChildren: false,
    };
  }

  // Get or create numbering definition
  let numId = context.listContext?.numId;
  let abstractNumId = context.listContext?.abstractNumId;

  // Create new numbering for top-level list or when switching list types
  if (numId === undefined || context.listContext?.type !== 'unordered') {
    const numbering = getOrCreateListNumbering(
      numberingManager,
      'unordered',
      options
    );
    numId = numbering.numId;
    abstractNumId = numbering.abstractNumId;
  }

  // Create new list context
  const newListContext: ListContext = {
    type: 'unordered',
    level: newLevel,
    numId,
    abstractNumId,
    counters: context.listContext?.counters ?? [],
  };

  return {
    element: null,
    processChildren: true,
    childContext: {
      listContext: newListContext,
    },
  };
}

/**
 * Handles ordered list elements (<ol>)
 *
 * Creates numbered list context for child items.
 *
 * @param element - The <ol> element
 * @param context - Conversion context
 * @param options - List options
 * @returns Conversion result with list context
 */
export function handleOrderedListElement(
  element: Element,
  context: ConversionContext,
  options: ListConversionOptions = {}
): ConversionResult {
  // Determine nesting level
  const currentLevel = context.listContext?.level ?? -1;
  const newLevel = Math.min(currentLevel + 1, MAX_LIST_LEVEL);

  // Get or create numbering manager
  const numberingManager = context.numberingManager;
  if (!numberingManager) {
    return {
      error: 'NumberingManager not available in context',
      processChildren: false,
    };
  }

  // Initialize counters
  const counters = [...(context.listContext?.counters ?? [])];

  // Check for start attribute
  const startAttr = element.getAttribute('start');
  if (startAttr) {
    counters[newLevel] = Number.parseInt(startAttr, 10) - 1;
  } else {
    counters[newLevel] = 0;
  }

  // Get or create numbering definition
  let numId = context.listContext?.numId;
  let abstractNumId = context.listContext?.abstractNumId;

  // Create new numbering for top-level list or when switching list types
  if (numId === undefined || context.listContext?.type !== 'ordered') {
    const numbering = getOrCreateListNumbering(
      numberingManager,
      'ordered',
      options
    );
    numId = numbering.numId;
    abstractNumId = numbering.abstractNumId;
  }

  // Create new list context
  const newListContext: ListContext = {
    type: 'ordered',
    level: newLevel,
    numId,
    abstractNumId,
    counters,
  };

  return {
    element: null,
    processChildren: true,
    childContext: {
      listContext: newListContext,
    },
  };
}

/**
 * Handles list item elements (<li>)
 *
 * Creates a paragraph with numbering properties.
 *
 * @param element - The <li> element
 * @param context - Conversion context
 * @returns Conversion result with list item Paragraph
 */
export function handleListItemElement(
  element: Element,
  context: ConversionContext
): ConversionResult {
  if (!context.listContext) {
    // Not inside a list, treat as regular paragraph
    return {
      element: null,
      processChildren: true,
      childContext: {},
    };
  }

  const { type, level, numId, counters } = context.listContext;

  // Increment counter for ordered lists
  if (type === 'ordered' && counters && level !== undefined) {
    counters[level] = (counters[level] ?? 0) + 1;
  }

  // Create paragraph with numbering
  const paragraph = new Paragraph();

  if (numId !== undefined && level !== undefined) {
    paragraph.setNumbering(numId, level);
  }

  // Extract text content
  const textContent = element.textContent?.trim() || '';
  if (textContent) {
    paragraph.addText(textContent);
  }

  return {
    element: paragraph,
    processChildren: true,
    childContext: {
      currentParagraph: paragraph,
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a simple bulleted list from an array of strings
 *
 * @param items - Array of list item texts
 * @param manager - NumberingManager instance
 * @param options - List options
 * @returns Array of paragraphs with bullet numbering
 *
 * @example
 * ```typescript
 * const paragraphs = createBulletList(['Item 1', 'Item 2', 'Item 3'], manager);
 * paragraphs.forEach(p => document.addParagraph(p));
 * ```
 */
export function createBulletList(
  items: string[],
  manager: NumberingManager,
  options: ListConversionOptions = {}
): Paragraph[] {
  const numbering = getOrCreateListNumbering(manager, 'unordered', options);

  return items.map((item) => {
    const para = new Paragraph();
    para.setNumbering(numbering.numId, 0);
    para.addText(item);
    return para;
  });
}

/**
 * Creates a simple numbered list from an array of strings
 *
 * @param items - Array of list item texts
 * @param manager - NumberingManager instance
 * @param options - List options
 * @returns Array of paragraphs with number numbering
 *
 * @example
 * ```typescript
 * const paragraphs = createNumberedList(['First', 'Second', 'Third'], manager);
 * paragraphs.forEach(p => document.addParagraph(p));
 * ```
 */
export function createNumberedList(
  items: string[],
  manager: NumberingManager,
  options: ListConversionOptions = {}
): Paragraph[] {
  const numbering = getOrCreateListNumbering(manager, 'ordered', options);

  return items.map((item) => {
    const para = new Paragraph();
    para.setNumbering(numbering.numId, 0);
    para.addText(item);
    return para;
  });
}

/**
 * Creates a nested list structure from a hierarchical data structure
 *
 * @param items - Array of items with optional children
 * @param manager - NumberingManager instance
 * @param type - List type ('ordered' or 'unordered')
 * @param level - Current nesting level (default: 0)
 * @returns Array of paragraphs with proper nesting
 *
 * @example
 * ```typescript
 * const items = [
 *   { text: 'Item 1', children: [
 *     { text: 'Sub-item 1.1' },
 *     { text: 'Sub-item 1.2' },
 *   ]},
 *   { text: 'Item 2' },
 * ];
 * const paragraphs = createNestedList(items, manager, 'unordered');
 * ```
 */
export function createNestedList(
  items: Array<{
    text: string;
    children?: Array<{ text: string; children?: any[] }>;
  }>,
  manager: NumberingManager,
  type: 'ordered' | 'unordered' = 'unordered',
  level = 0
): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const numbering = getOrCreateListNumbering(manager, type, {});
  const safeLevel = Math.min(level, MAX_LIST_LEVEL);

  for (const item of items) {
    // Create paragraph for this item
    const para = new Paragraph();
    para.setNumbering(numbering.numId, safeLevel);
    para.addText(item.text);
    paragraphs.push(para);

    // Recursively process children
    if (item.children && item.children.length > 0) {
      const childParagraphs = createNestedList(
        item.children,
        manager,
        type,
        level + 1
      );
      paragraphs.push(...childParagraphs);
    }
  }

  return paragraphs;
}

// ============================================================================
// Task List Handlers
// ============================================================================

/**
 * Options for task list conversion
 */
export interface TaskListConversionOptions extends ListConversionOptions {
  /** Unchecked checkbox symbol (default: '☐') */
  uncheckedSymbol?: string;
  /** Checked checkbox symbol (default: '☑') */
  checkedSymbol?: string;
  /** Cancelled/strikethrough checkbox symbol (default: '☒') */
  cancelledSymbol?: string;
  /** Font for checkbox symbols (default: 'Segoe UI Symbol') */
  checkboxFont?: string;
  /** Whether to apply strikethrough to checked items (default: false) */
  strikethroughChecked?: boolean;
  /** Color for checked items (default: '808080' gray) */
  checkedColor?: string;
}

/**
 * Detects if a list item is a task list item
 *
 * @param element - The <li> element
 * @returns Object with isTask, checked, and cancelled status
 */
export function detectTaskListItem(element: Element): {
  isTask: boolean;
  checked: boolean;
  cancelled: boolean;
} {
  // Check for checkbox input
  const checkbox = element.querySelector(
    'input[type="checkbox"]'
  ) as HTMLInputElement | null;
  if (checkbox) {
    return {
      isTask: true,
      checked: checkbox.checked || checkbox.hasAttribute('checked'),
      cancelled: false,
    };
  }

  // Check for data attributes (Plate/Slate style)
  const dataChecked = element.getAttribute('data-checked');
  if (dataChecked !== null) {
    return {
      isTask: true,
      checked: dataChecked === 'true' || dataChecked === '1',
      cancelled: false,
    };
  }

  // Check parent <ul> for task list indicator
  const parentList = element.closest('ul, ol');
  if (parentList) {
    const isTaskList =
      parentList.hasAttribute('data-task-list') ||
      parentList.classList.contains('task-list') ||
      parentList.classList.contains('contains-task-list');

    if (isTaskList) {
      // Check if this specific item is checked
      const itemChecked =
        element.hasAttribute('data-checked') ||
        element.classList.contains('checked') ||
        element.classList.contains('completed');

      return {
        isTask: true,
        checked: itemChecked,
        cancelled: element.classList.contains('cancelled'),
      };
    }
  }

  return { isTask: false, checked: false, cancelled: false };
}

/**
 * Handles task list item elements
 *
 * Creates a paragraph with a checkbox symbol prefix.
 *
 * @param element - The <li> element
 * @param context - Conversion context
 * @param options - Task list options
 * @returns Conversion result with task item Paragraph
 *
 * @example
 * ```typescript
 * // <li data-checked="true">Completed task</li>
 * const result = handleTaskListItemElement(liElement, context);
 * ```
 */
export function handleTaskListItemElement(
  element: Element,
  context: ConversionContext,
  options: TaskListConversionOptions = {}
): ConversionResult {
  const {
    uncheckedSymbol = TASK_LIST_UNCHECKED,
    checkedSymbol = TASK_LIST_CHECKED,
    cancelledSymbol = TASK_LIST_CANCELLED,
    checkboxFont = TASK_LIST_FONT,
    strikethroughChecked = false,
    checkedColor = '808080',
  } = options;

  const taskInfo = detectTaskListItem(element);

  // Determine checkbox symbol
  let checkboxSymbol = uncheckedSymbol;
  if (taskInfo.cancelled) {
    checkboxSymbol = cancelledSymbol;
  } else if (taskInfo.checked) {
    checkboxSymbol = checkedSymbol;
  }

  // Create paragraph
  const paragraph = new Paragraph();

  // Apply list indentation if in list context
  if (context.listContext) {
    const { level, numId } = context.listContext;
    const indent = createLevelIndentation(level ?? 0);
    paragraph.setLeftIndent(indent.left);
  }

  // Import Run locally to avoid circular dependency issues
  const { Run } = require('../docXMLater/src');

  // Add checkbox symbol as a run
  const checkboxRun = new Run(checkboxSymbol + ' ');
  checkboxRun.setFont(checkboxFont);
  paragraph.addRun(checkboxRun);

  // Get text content (excluding checkbox input if present)
  let textContent = '';
  const childNodes = element.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i];
    if (node.nodeType === 3) {
      // Text node
      textContent += node.textContent || '';
    } else if (node.nodeType === 1) {
      // Element node
      const childElement = node as Element;
      if (childElement.tagName.toLowerCase() !== 'input') {
        textContent += childElement.textContent || '';
      }
    }
  }
  textContent = textContent.trim();

  if (textContent) {
    const textRun = new Run(textContent);

    // Apply checked styling
    if (taskInfo.checked || taskInfo.cancelled) {
      textRun.setColor(checkedColor);
      if (strikethroughChecked) {
        textRun.setStrikethrough(true);
      }
    }

    paragraph.addRun(textRun);
  }

  return {
    element: paragraph,
    processChildren: false,
  };
}

/**
 * Creates a task list from an array of items
 *
 * @param items - Array of task items with text and checked status
 * @param options - Task list options
 * @returns Array of paragraphs representing the task list
 *
 * @example
 * ```typescript
 * const tasks = createTaskList([
 *   { text: 'Buy groceries', checked: true },
 *   { text: 'Walk the dog', checked: false },
 *   { text: 'Write code', checked: true },
 * ]);
 * tasks.forEach(p => document.addParagraph(p));
 * ```
 */
export function createTaskList(
  items: Array<{ text: string; checked?: boolean; cancelled?: boolean }>,
  options: TaskListConversionOptions = {}
): Paragraph[] {
  const {
    uncheckedSymbol = TASK_LIST_UNCHECKED,
    checkedSymbol = TASK_LIST_CHECKED,
    cancelledSymbol = TASK_LIST_CANCELLED,
    checkboxFont = TASK_LIST_FONT,
    strikethroughChecked = false,
    checkedColor = '808080',
    indentPerLevel = DEFAULT_INDENT_PER_LEVEL,
  } = options;

  // Import Run locally
  const { Run } = require('../docXMLater/src');

  return items.map((item) => {
    const paragraph = new Paragraph();
    paragraph.setLeftIndent(indentPerLevel);

    // Determine checkbox symbol
    let checkboxSymbol = uncheckedSymbol;
    if (item.cancelled) {
      checkboxSymbol = cancelledSymbol;
    } else if (item.checked) {
      checkboxSymbol = checkedSymbol;
    }

    // Add checkbox
    const checkboxRun = new Run(checkboxSymbol + ' ');
    checkboxRun.setFont(checkboxFont);
    paragraph.addRun(checkboxRun);

    // Add text
    const textRun = new Run(item.text);
    if (item.checked || item.cancelled) {
      textRun.setColor(checkedColor);
      if (strikethroughChecked) {
        textRun.setStrikethrough(true);
      }
    }
    paragraph.addRun(textRun);

    return paragraph;
  });
}

// ============================================================================
// Modern List Handlers (Plate listStyleType)
// ============================================================================

/**
 * Extracts modern list style type from element
 *
 * Looks for Plate-style listStyleType in data attributes or style
 *
 * @param element - The list element
 * @returns List style type or null
 */
export function extractListStyleType(element: Element): string | null {
  // Check data attribute
  const dataListStyleType = element.getAttribute('data-list-style-type');
  if (dataListStyleType) {
    return dataListStyleType;
  }

  // Check style attribute
  const style = (element as HTMLElement).style;
  if (style?.listStyleType) {
    return style.listStyleType;
  }

  // Check CSS listStyleType
  const listStyleType = element.getAttribute('listStyleType');
  if (listStyleType) {
    return listStyleType;
  }

  return null;
}

/**
 * Handles modern list elements with listStyleType
 *
 * Supports Plate's modern list format with listStyleType attribute.
 *
 * @param element - The list element (ul/ol with listStyleType)
 * @param context - Conversion context
 * @param options - List options
 * @returns Conversion result
 */
export function handleModernListElement(
  element: Element,
  context: ConversionContext,
  options: ListConversionOptions = {}
): ConversionResult {
  const listStyleType = extractListStyleType(element);
  const tagName = element.tagName.toLowerCase();

  // Determine list type from listStyleType or tag
  let listType: 'ordered' | 'unordered' =
    tagName === 'ol' ? 'ordered' : 'unordered';

  // Override based on listStyleType
  if (listStyleType) {
    const format = mapListStyleType(listStyleType);
    if (format === 'bullet') {
      listType = 'unordered';
    } else if (format !== 'none') {
      listType = 'ordered';
    }

    // Update options with the detected format
    if (format !== 'bullet' && format !== 'none') {
      options = {
        ...options,
        numberingFormats: [format],
      };
    }
  }

  // Delegate to appropriate handler
  if (listType === 'ordered') {
    return handleOrderedListElement(element, context, options);
  }
  return handleUnorderedListElement(element, context, options);
}

/**
 * Handles list item with indent level detection
 *
 * Detects indent level from data attributes or computed style.
 *
 * @param element - The <li> element
 * @param context - Conversion context
 * @returns Conversion result
 */
export function handleListItemWithIndent(
  element: Element,
  context: ConversionContext
): ConversionResult {
  // Check for indent level in data attribute
  const dataIndent = element.getAttribute('data-indent');
  const indentLevel = dataIndent ? Number.parseInt(dataIndent, 10) : undefined;

  // Detect task list item first
  const taskInfo = detectTaskListItem(element);
  if (taskInfo.isTask) {
    return handleTaskListItemElement(element, context);
  }

  // Get current level from context or use detected indent
  const currentLevel =
    indentLevel !== undefined
      ? Math.min(indentLevel, MAX_LIST_LEVEL)
      : (context.listContext?.level ?? 0);

  // Create updated context with proper level
  const updatedContext: ConversionContext = {
    ...context,
    listContext: context.listContext
      ? {
          ...context.listContext,
          level: currentLevel,
        }
      : undefined,
  };

  return handleListItemElement(element, updatedContext);
}
