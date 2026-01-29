/**
 * Math Handler - LaTeX equation to DOCX OMML conversion
 *
 * This module provides handlers for converting mathematical equations from
 * LaTeX notation to Office Math Markup Language (OMML) for DOCX export.
 *
 * Supports:
 * - Block equations (display math)
 * - Inline equations (inline math)
 * - LaTeX to OMML conversion (with fallback to placeholder)
 * - MathML detection and conversion
 *
 * Note: Full LaTeX to OMML conversion requires a separate library.
 * This handler provides the framework and basic conversions, with fallback
 * to placeholder text for complex equations.
 *
 * @module math-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Font used for math rendering (Cambria Math is the standard Office math font) */
export const MATH_FONT = 'Cambria Math';

/** Data attribute for LaTeX content */
export const LATEX_DATA_ATTR = 'data-latex';

/** Data attribute for MathML content */
export const MATHML_DATA_ATTR = 'data-mathml';

/** Class patterns for equation elements */
export const EQUATION_CLASS_PATTERNS = [
  'math',
  'equation',
  'katex',
  'mathjax',
  'latex',
  'math-display',
  'math-inline',
];

/** Default placeholder prefix for block equations */
export const BLOCK_EQUATION_PLACEHOLDER = '[Equation: ';

/** Default placeholder prefix for inline equations */
export const INLINE_EQUATION_PLACEHOLDER = '[';

/** Default placeholder suffix */
export const EQUATION_PLACEHOLDER_SUFFIX = ']';

/** Placeholder text color (gray) */
export const EQUATION_PLACEHOLDER_COLOR = '666666';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for math conversion
 */
export interface MathConversionOptions {
  /** Whether to attempt LaTeX to OMML conversion (default: true) */
  convertLatex?: boolean;
  /** Whether to show placeholder for unsupported equations (default: true) */
  showPlaceholder?: boolean;
  /** Custom LaTeX to OMML converter function */
  latexToOmmlConverter?: LatexToOmmlConverter;
  /** Font for math rendering (default: 'Cambria Math') */
  mathFont?: string;
  /** Font size in half-points (inherits from context if not specified) */
  fontSize?: number;
  /** Placeholder color in hex (default: '666666') */
  placeholderColor?: string;
}

/**
 * Function signature for LaTeX to OMML conversion
 */
export type LatexToOmmlConverter = (latex: string) => string | null;

/**
 * Type of equation (display or inline)
 */
export type EquationType = 'display' | 'inline';

/**
 * Extracted equation metadata
 */
export interface EquationMetadata {
  /** Whether element contains an equation */
  isEquation: boolean;
  /** Type of equation */
  type: EquationType;
  /** LaTeX source if available */
  latex?: string;
  /** MathML source if available */
  mathml?: string;
  /** Plain text representation */
  plainText?: string;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Checks if an element is an equation element
 *
 * @param element - The element to check
 * @returns True if the element contains math content
 */
export function isEquationElement(element: Element): boolean {
  // Check for math-related data attributes
  if (
    element.hasAttribute(LATEX_DATA_ATTR) ||
    element.hasAttribute(MATHML_DATA_ATTR) ||
    element.hasAttribute('data-equation')
  ) {
    return true;
  }

  // Check for MathML elements
  if (
    element.tagName.toLowerCase() === 'math' ||
    element.querySelector('math')
  ) {
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of EQUATION_CLASS_PATTERNS) {
    if (className.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check for KaTeX or MathJax specific elements
  if (element.querySelector('.katex, .MathJax, .mjx-math')) {
    return true;
  }

  return false;
}

/**
 * Detects the type of equation (display or inline)
 *
 * @param element - The equation element
 * @returns Equation type
 */
export function detectEquationType(element: Element): EquationType {
  // Check for explicit type attributes
  const displayAttr = element.getAttribute('data-display');
  if (displayAttr === 'true' || displayAttr === 'block') {
    return 'display';
  }
  if (displayAttr === 'false' || displayAttr === 'inline') {
    return 'inline';
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  if (
    className.includes('display') ||
    className.includes('block') ||
    className.includes('math-display')
  ) {
    return 'display';
  }
  if (className.includes('inline') || className.includes('math-inline')) {
    return 'inline';
  }

  // Check MathML display attribute
  const mathElement =
    element.tagName.toLowerCase() === 'math'
      ? element
      : element.querySelector('math');
  if (mathElement) {
    const mathDisplay = mathElement.getAttribute('display');
    if (mathDisplay === 'block') return 'display';
    if (mathDisplay === 'inline') return 'inline';
  }

  // Check if element is block-level
  const htmlElement = element as HTMLElement;
  const computedStyle = htmlElement.style;
  if (computedStyle?.display === 'block' || computedStyle?.display === 'flex') {
    return 'display';
  }

  // Check parent context
  if (
    element.parentElement?.tagName.toLowerCase() === 'p' ||
    element.parentElement?.tagName.toLowerCase() === 'span'
  ) {
    return 'inline';
  }

  // Default to display for standalone elements
  return 'display';
}

/**
 * Extracts equation metadata from an element
 *
 * @param element - The equation element
 * @returns Extracted metadata
 */
export function extractEquationMetadata(element: Element): EquationMetadata {
  const metadata: EquationMetadata = {
    isEquation: isEquationElement(element),
    type: 'inline',
  };

  if (!metadata.isEquation) {
    return metadata;
  }

  metadata.type = detectEquationType(element);

  // Extract LaTeX
  const latex =
    element.getAttribute(LATEX_DATA_ATTR) ||
    element.getAttribute('data-equation') ||
    element.getAttribute('data-formula');
  if (latex) {
    metadata.latex = latex;
  }

  // Extract MathML
  const mathml = element.getAttribute(MATHML_DATA_ATTR);
  if (mathml) {
    metadata.mathml = mathml;
  }

  // Get MathML from child element
  const mathElement = element.querySelector('math');
  if (mathElement && !metadata.mathml) {
    metadata.mathml = mathElement.outerHTML;
  }

  // Extract plain text (fallback)
  const textContent = element.textContent?.trim();
  if (textContent) {
    metadata.plainText = textContent;
  }

  return metadata;
}

// ============================================================================
// Basic LaTeX Conversions
// ============================================================================

/**
 * Simple LaTeX escape sequences to Unicode mapping
 */
const LATEX_TO_UNICODE: Record<string, string> = {
  '\\alpha': '\u03B1',
  '\\beta': '\u03B2',
  '\\gamma': '\u03B3',
  '\\delta': '\u03B4',
  '\\epsilon': '\u03B5',
  '\\zeta': '\u03B6',
  '\\eta': '\u03B7',
  '\\theta': '\u03B8',
  '\\iota': '\u03B9',
  '\\kappa': '\u03BA',
  '\\lambda': '\u03BB',
  '\\mu': '\u03BC',
  '\\nu': '\u03BD',
  '\\xi': '\u03BE',
  '\\pi': '\u03C0',
  '\\rho': '\u03C1',
  '\\sigma': '\u03C3',
  '\\tau': '\u03C4',
  '\\upsilon': '\u03C5',
  '\\phi': '\u03C6',
  '\\chi': '\u03C7',
  '\\psi': '\u03C8',
  '\\omega': '\u03C9',
  '\\Alpha': '\u0391',
  '\\Beta': '\u0392',
  '\\Gamma': '\u0393',
  '\\Delta': '\u0394',
  '\\Theta': '\u0398',
  '\\Lambda': '\u039B',
  '\\Pi': '\u03A0',
  '\\Sigma': '\u03A3',
  '\\Phi': '\u03A6',
  '\\Psi': '\u03A8',
  '\\Omega': '\u03A9',
  '\\infty': '\u221E',
  '\\pm': '\u00B1',
  '\\times': '\u00D7',
  '\\div': '\u00F7',
  '\\leq': '\u2264',
  '\\geq': '\u2265',
  '\\neq': '\u2260',
  '\\approx': '\u2248',
  '\\sum': '\u2211',
  '\\prod': '\u220F',
  '\\int': '\u222B',
  '\\partial': '\u2202',
  '\\nabla': '\u2207',
  '\\sqrt': '\u221A',
  '\\rightarrow': '\u2192',
  '\\leftarrow': '\u2190',
  '\\Rightarrow': '\u21D2',
  '\\Leftarrow': '\u21D0',
  '\\forall': '\u2200',
  '\\exists': '\u2203',
  '\\in': '\u2208',
  '\\notin': '\u2209',
  '\\subset': '\u2282',
  '\\supset': '\u2283',
  '\\cup': '\u222A',
  '\\cap': '\u2229',
  '\\emptyset': '\u2205',
  '\\cdot': '\u00B7',
  '\\ldots': '\u2026',
  '\\cdots': '\u22EF',
};

/**
 * Converts simple LaTeX to Unicode text
 *
 * This is a basic converter for common symbols. Complex expressions
 * should use a full LaTeX parser.
 *
 * @param latex - LaTeX string
 * @returns Unicode string
 */
export function simpleLatexToUnicode(latex: string): string {
  let result = latex;

  // Remove delimiters
  result = result.replace(/^\$+|\$+$/g, '').trim();
  result = result.replace(/^\\[[(]|\\[\])]$/g, '').trim();

  // Replace known commands
  for (const [command, unicode] of Object.entries(LATEX_TO_UNICODE)) {
    result = result.replace(new RegExp(escapeRegex(command), 'g'), unicode);
  }

  // Handle superscripts and subscripts (basic)
  result = result.replace(/\^{([^}]+)}/g, (_, content) =>
    content.split('').map(superscriptChar).join('')
  );
  result = result.replace(/_{([^}]+)}/g, (_, content) =>
    content.split('').map(subscriptChar).join('')
  );
  result = result.replace(/\^(.)/g, (_, char) => superscriptChar(char));
  result = result.replace(/_(.)/g, (_, char) => subscriptChar(char));

  // Handle fractions (simplified display)
  result = result.replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1)/($2)');

  // Clean up remaining commands
  result = result.replace(/\\[a-zA-Z]+/g, '');
  result = result.replace(/[{}]/g, '');

  return result.trim();
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convert character to superscript Unicode
 */
function superscriptChar(char: string): string {
  const map: Record<string, string> = {
    '0': '\u2070',
    '1': '\u00B9',
    '2': '\u00B2',
    '3': '\u00B3',
    '4': '\u2074',
    '5': '\u2075',
    '6': '\u2076',
    '7': '\u2077',
    '8': '\u2078',
    '9': '\u2079',
    '+': '\u207A',
    '-': '\u207B',
    '=': '\u207C',
    '(': '\u207D',
    ')': '\u207E',
    n: '\u207F',
    i: '\u2071',
  };
  return map[char] || char;
}

/**
 * Convert character to subscript Unicode
 */
function subscriptChar(char: string): string {
  const map: Record<string, string> = {
    '0': '\u2080',
    '1': '\u2081',
    '2': '\u2082',
    '3': '\u2083',
    '4': '\u2084',
    '5': '\u2085',
    '6': '\u2086',
    '7': '\u2087',
    '8': '\u2088',
    '9': '\u2089',
    '+': '\u208A',
    '-': '\u208B',
    '=': '\u208C',
    '(': '\u208D',
    ')': '\u208E',
    a: '\u2090',
    e: '\u2091',
    o: '\u2092',
    x: '\u2093',
  };
  return map[char] || char;
}

// ============================================================================
// Placeholder Creation
// ============================================================================

/**
 * Creates a placeholder for an equation
 *
 * @param metadata - Equation metadata
 * @param options - Conversion options
 * @returns Text representation of the equation
 */
export function createEquationPlaceholder(
  metadata: EquationMetadata,
  options: MathConversionOptions = {}
): string {
  const { showPlaceholder = true } = options;

  if (!showPlaceholder) {
    return '';
  }

  // Try to convert LaTeX to readable text
  if (metadata.latex) {
    const converted = simpleLatexToUnicode(metadata.latex);
    if (metadata.type === 'display') {
      return `${BLOCK_EQUATION_PLACEHOLDER}${converted}${EQUATION_PLACEHOLDER_SUFFIX}`;
    }
    return `${INLINE_EQUATION_PLACEHOLDER}${converted}${EQUATION_PLACEHOLDER_SUFFIX}`;
  }

  // Use plain text if available
  if (metadata.plainText) {
    if (metadata.type === 'display') {
      return `${BLOCK_EQUATION_PLACEHOLDER}${metadata.plainText}${EQUATION_PLACEHOLDER_SUFFIX}`;
    }
    return metadata.plainText;
  }

  // Generic placeholder
  return metadata.type === 'display' ? '[Equation]' : '[formula]';
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles block equation elements (display math)
 *
 * Creates a centered paragraph with the equation content.
 *
 * @param element - The equation element
 * @param context - Conversion context
 * @param options - Math conversion options
 * @returns Conversion result
 */
export function handleBlockEquation(
  element: Element,
  context: ConversionContext,
  options: MathConversionOptions = {}
): ConversionResult {
  const {
    mathFont = MATH_FONT,
    placeholderColor = EQUATION_PLACEHOLDER_COLOR,
    fontSize,
  } = options;

  const metadata = extractEquationMetadata(element);

  if (!metadata.isEquation) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Create centered paragraph for block equation
  const paragraph = new Paragraph();
  paragraph.setAlignment('center');
  paragraph.setSpaceBefore(120); // 6pt
  paragraph.setSpaceAfter(120); // 6pt

  // Create run with equation content
  const placeholderText = createEquationPlaceholder(metadata, options);
  const run = new Run(placeholderText);
  run.setFont(mathFont);
  run.setColor(placeholderColor);

  if (fontSize) {
    run.setSize(fontSize);
  }

  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles inline equation elements
 *
 * Creates a run with the equation content to be added to the current paragraph.
 *
 * @param element - The equation element
 * @param context - Conversion context
 * @param options - Math conversion options
 * @returns Conversion result
 */
export function handleInlineEquation(
  element: Element,
  context: ConversionContext,
  options: MathConversionOptions = {}
): ConversionResult {
  const {
    mathFont = MATH_FONT,
    placeholderColor = EQUATION_PLACEHOLDER_COLOR,
    fontSize,
  } = options;

  const metadata = extractEquationMetadata(element);

  if (!metadata.isEquation) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // For inline equations, add run to current paragraph
  const placeholderText = createEquationPlaceholder(
    { ...metadata, type: 'inline' },
    options
  );
  const run = new Run(placeholderText);
  run.setFont(mathFont);
  run.setItalic(true); // Math is typically italic

  if (fontSize) {
    run.setSize(fontSize);
  } else if (context.inheritedFormatting?.size) {
    run.setSize(context.inheritedFormatting.size as number);
  }

  // If we have a current paragraph, add the run
  if (context.currentParagraph) {
    context.currentParagraph.addRun(run);
    return {
      element: null,
      processChildren: false,
    };
  }

  // Otherwise, create a new paragraph
  const paragraph = new Paragraph();
  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * General equation handler that detects type and delegates
 *
 * @param element - The equation element
 * @param context - Conversion context
 * @param options - Math conversion options
 * @returns Conversion result
 */
export function handleEquationElement(
  element: Element,
  context: ConversionContext,
  options: MathConversionOptions = {}
): ConversionResult {
  const metadata = extractEquationMetadata(element);

  if (!metadata.isEquation) {
    return {
      element: null,
      processChildren: true,
    };
  }

  if (metadata.type === 'display') {
    return handleBlockEquation(element, context, options);
  }

  return handleInlineEquation(element, context, options);
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a block equation from LaTeX
 *
 * @param latex - LaTeX equation string
 * @param options - Conversion options
 * @returns Paragraph with equation
 *
 * @example
 * ```typescript
 * const equation = createBlockEquation('E = mc^2');
 * document.addParagraph(equation);
 * ```
 */
export function createBlockEquation(
  latex: string,
  options: MathConversionOptions = {}
): Paragraph {
  const {
    mathFont = MATH_FONT,
    placeholderColor = EQUATION_PLACEHOLDER_COLOR,
  } = options;

  const paragraph = new Paragraph();
  paragraph.setAlignment('center');
  paragraph.setSpaceBefore(120);
  paragraph.setSpaceAfter(120);

  const converted = simpleLatexToUnicode(latex);
  const run = new Run(converted);
  run.setFont(mathFont);
  run.setItalic(true);

  paragraph.addRun(run);

  return paragraph;
}

/**
 * Creates an inline equation run from LaTeX
 *
 * @param latex - LaTeX equation string
 * @param options - Conversion options
 * @returns Run with equation
 *
 * @example
 * ```typescript
 * const paragraph = new Paragraph();
 * paragraph.addRun(new Run('The formula '));
 * paragraph.addRun(createInlineEquationRun('x^2 + y^2 = z^2'));
 * paragraph.addRun(new Run(' is the Pythagorean theorem.'));
 * ```
 */
export function createInlineEquationRun(
  latex: string,
  options: MathConversionOptions = {}
): Run {
  const { mathFont = MATH_FONT, fontSize } = options;

  const converted = simpleLatexToUnicode(latex);
  const run = new Run(converted);
  run.setFont(mathFont);
  run.setItalic(true);

  if (fontSize) {
    run.setSize(fontSize);
  }

  return run;
}
