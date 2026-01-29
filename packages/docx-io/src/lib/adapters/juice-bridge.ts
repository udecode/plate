/**
 * Juice Bridge - CSS inlining utilities for DOCX export
 *
 * This module provides utilities for inlining CSS styles into HTML elements,
 * which is a crucial step before converting HTML to DOCX format.
 * It uses the 'juice' library for CSS inlining.
 *
 * @module juice-bridge
 */

// Note: juice is a peer/dev dependency and should be imported dynamically
// to avoid issues when it's not installed
type JuiceFunction = (
  html: string,
  options?: Record<string, unknown>
) => string;
let juiceFunction: JuiceFunction | null = null;

/**
 * Options for CSS inlining with juice
 */
export interface JuiceOptions {
  /**
   * Whether to insert preserved properties in the body
   * @default false
   */
  preserveImportant?: boolean;

  /**
   * Whether to preserve @font-face styles
   * @default false
   */
  preserveFontFaces?: boolean;

  /**
   * Whether to preserve @media queries
   * @default false
   */
  preserveMediaQueries?: boolean;

  /**
   * Whether to preserve keyframe animations
   * @default false
   */
  preserveKeyframes?: boolean;

  /**
   * Whether to apply width/height attributes to tables
   * @default true
   */
  applyWidthAttributes?: boolean;

  /**
   * Whether to apply height attributes
   * @default true
   */
  applyHeightAttributes?: boolean;

  /**
   * Whether to apply attributes to table elements
   * @default true
   */
  applyAttributesTableElements?: boolean;

  /**
   * Whether to remove style tags after inlining
   * @default true
   */
  removeStyleTags?: boolean;

  /**
   * Extra CSS to include in inlining
   */
  extraCss?: string;

  /**
   * Whether to insert preserved CSS in the head
   * @default true
   */
  insertPreservedExtraCss?: boolean;

  /**
   * Web resources options for fetching external CSS
   */
  webResources?: {
    /** Base path for relative URLs */
    relativeTo?: string;
    /** Scripts to execute in the page */
    scripts?: boolean;
  };
}

/**
 * Loads the juice module dynamically
 *
 * @returns Promise resolving to the juice function
 * @throws Error if juice is not installed
 */
async function loadJuice(): Promise<JuiceFunction> {
  if (juiceFunction) {
    return juiceFunction;
  }

  try {
    // Type the import to handle both ESM default export and CommonJS module.exports
    const juiceModule = (await import('juice')) as unknown as
      | { default: JuiceFunction }
      | JuiceFunction;
    // Handle both default and named exports
    juiceFunction =
      typeof juiceModule === 'function'
        ? juiceModule
        : (juiceModule as { default: JuiceFunction }).default;
    return juiceFunction;
  } catch {
    throw new Error(
      'The "juice" package is required for CSS inlining. ' +
        'Please install it with: npm install juice'
    );
  }
}

/**
 * Checks if juice is available
 *
 * @returns True if juice can be imported
 */
export async function isJuiceAvailable(): Promise<boolean> {
  try {
    await loadJuice();
    return true;
  } catch {
    return false;
  }
}

/**
 * Converts juice options to the format expected by the juice library
 */
function convertOptions(options: JuiceOptions): Record<string, unknown> {
  return {
    preserveImportant: options.preserveImportant ?? false,
    preserveFontFaces: options.preserveFontFaces ?? false,
    preserveMediaQueries: options.preserveMediaQueries ?? false,
    preserveKeyFrames: options.preserveKeyframes ?? false, // Note: juice uses 'KeyFrames' not 'keyframes'
    applyWidthAttributes: options.applyWidthAttributes ?? true,
    applyHeightAttributes: options.applyHeightAttributes ?? true,
    applyAttributesTableElements: options.applyAttributesTableElements ?? true,
    removeStyleTags: options.removeStyleTags ?? true,
    extraCss: options.extraCss,
    insertPreservedExtraCss: options.insertPreservedExtraCss ?? true,
    webResources: options.webResources,
  };
}

/**
 * Inlines CSS styles into HTML elements
 *
 * Takes HTML with external or embedded stylesheets and converts all
 * applicable styles to inline style attributes on each element.
 * This is essential for DOCX export since DOCX doesn't support CSS files.
 *
 * @param html - HTML string with CSS (can include <style> tags)
 * @param options - Juice options for inlining
 * @returns HTML string with all styles inlined
 *
 * @example
 * ```typescript
 * const html = `
 *   <style>.bold { font-weight: bold; }</style>
 *   <p class="bold">Hello</p>
 * `;
 * const inlined = await inlineStyles(html);
 * // => '<p class="bold" style="font-weight: bold;">Hello</p>'
 * ```
 */
export async function inlineStyles(
  html: string,
  options: JuiceOptions = {}
): Promise<string> {
  const juice = await loadJuice();

  // Preprocess: Remove problematic comment patterns that juice doesn't handle well
  // juice ignores the first class when there is <!-- just after <style>
  const processedHtml = html.replace(/<style>\s*<!--/g, '<style>');

  // Run juice to inline styles
  const result = juice(processedHtml, convertOptions(options));

  return result;
}

/**
 * Synchronous version of inlineStyles
 *
 * Note: This will throw if juice is not already loaded.
 * Use the async version when possible.
 *
 * @param html - HTML string with CSS
 * @param options - Juice options
 * @returns HTML string with inlined styles
 */
export function inlineStylesSync(
  html: string,
  options: JuiceOptions = {}
): string {
  if (!juiceFunction) {
    throw new Error(
      'Juice module not loaded. Call await inlineStyles() first to load the module, ' +
        'or use the async version of this function.'
    );
  }

  // Preprocess
  const processedHtml = html.replace(/<style>\s*<!--/g, '<style>');

  return juiceFunction(processedHtml, convertOptions(options));
}

/**
 * Preloads the juice module for later synchronous use
 *
 * Call this early in your application to enable synchronous inlining.
 *
 * @returns Promise that resolves when juice is loaded
 */
export async function preloadJuice(): Promise<void> {
  await loadJuice();
}

// ============================================================================
// Style Extraction Utilities
// ============================================================================

/**
 * Style properties commonly needed for DOCX conversion
 */
export interface ExtractedStyles {
  // Text formatting
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textDecorationLine?: string;
  color?: string;
  backgroundColor?: string;
  verticalAlign?: string;
  letterSpacing?: string;
  textTransform?: string;

  // Paragraph formatting
  textAlign?: string;
  lineHeight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;

  // Border formatting
  border?: string;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;

  // Table formatting
  width?: string;
  height?: string;
  maxWidth?: string;
  minWidth?: string;

  // All other styles
  [key: string]: string | undefined;
}

/**
 * Parses an inline style string into an object
 *
 * @param styleString - CSS style string from element's style attribute
 * @returns Object with parsed style properties
 *
 * @example
 * ```typescript
 * const styles = parseStyleString('font-weight: bold; color: red;');
 * // => { fontWeight: 'bold', color: 'red' }
 * ```
 */
export function parseStyleString(styleString: string): ExtractedStyles {
  if (!styleString) return {};

  const styles: ExtractedStyles = {};
  const declarations = styleString.split(';');

  for (const declaration of declarations) {
    const [property, value] = declaration.split(':').map((s) => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      styles[camelProperty] = value;
    }
  }

  return styles;
}

/**
 * Converts a styles object back to a CSS string
 *
 * @param styles - Object with style properties
 * @returns CSS style string
 *
 * @example
 * ```typescript
 * const css = stylesToString({ fontWeight: 'bold', color: 'red' });
 * // => 'font-weight: bold; color: red;'
 * ```
 */
export function stylesToString(styles: ExtractedStyles): string {
  return Object.entries(styles)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      // Convert camelCase back to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Merges multiple style objects, with later objects taking precedence
 *
 * @param styles - Style objects to merge
 * @returns Merged styles object
 */
export function mergeStyles(...styles: ExtractedStyles[]): ExtractedStyles {
  return styles.reduce((acc, style) => {
    for (const [key, value] of Object.entries(style)) {
      if (value !== undefined) {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as ExtractedStyles);
}

/**
 * Extracts computed styles from a DOM element (browser only)
 *
 * @param element - DOM element to get styles from
 * @returns Extracted styles object
 */
export function extractStyles(element: Element): ExtractedStyles {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.getComputedStyle) {
    // In Node.js, try to parse the style attribute
    const styleAttr = element.getAttribute?.('style');
    return styleAttr ? parseStyleString(styleAttr) : {};
  }

  const computed = window.getComputedStyle(element);
  const styles: ExtractedStyles = {};

  // Extract commonly needed properties
  const properties = [
    'fontFamily',
    'fontSize',
    'fontWeight',
    'fontStyle',
    'textDecoration',
    'textDecorationLine',
    'color',
    'backgroundColor',
    'verticalAlign',
    'letterSpacing',
    'textTransform',
    'textAlign',
    'lineHeight',
    'marginTop',
    'marginBottom',
    'marginLeft',
    'marginRight',
    'paddingTop',
    'paddingBottom',
    'paddingLeft',
    'paddingRight',
    'border',
    'borderTop',
    'borderBottom',
    'borderLeft',
    'borderRight',
    'width',
    'height',
  ];

  for (const prop of properties) {
    const value = computed.getPropertyValue(
      prop.replace(/([A-Z])/g, '-$1').toLowerCase()
    );
    if (value && value !== 'initial' && value !== 'inherit') {
      styles[prop as keyof ExtractedStyles] = value;
    }
  }

  return styles;
}

/**
 * Extracts inline styles from an HTML element's style attribute
 *
 * Works in both browser and Node.js environments.
 *
 * @param element - Element to extract styles from (DOM Element or object with getAttribute)
 * @returns Extracted styles object
 */
export function extractInlineStyles(element: {
  getAttribute?: (name: string) => string | null;
}): ExtractedStyles {
  const styleAttr = element.getAttribute?.('style');
  return styleAttr ? parseStyleString(styleAttr) : {};
}
