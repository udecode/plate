/**
 * Plate Bridge - Connects Plate editor to DOCX export functionality
 *
 * This module provides the bridge between Plate editor's plugin system
 * and the docx-io export pipeline.
 *
 * @module plate-bridge
 */

import type { TElement, TNode, TText } from '@platejs/slate';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Plugin interface for components that support DOCX export
 *
 * Plugins implementing this interface can customize how their
 * content is exported to DOCX format.
 */
export interface PlateExportPlugin {
  /** Unique plugin key identifier */
  key: string;

  /**
   * Serializes the plugin's content to HTML
   * Used as an intermediate step before DOCX conversion
   */
  serializeHtml?: (node: TElement) => string | null;

  /**
   * Custom handler for DOCX export
   * Returns DOCX-specific XML or formatting data
   */
  exportDocx?: (
    node: TElement,
    context: PlateExportContext
  ) => ExportResult | null;

  /**
   * Element types this plugin handles
   * Used to map editor element types to handlers
   */
  elementTypes?: string[];

  /**
   * Mark types this plugin handles (for inline formatting)
   */
  markTypes?: string[];
}

/**
 * Context passed to export plugins during DOCX conversion
 */
export interface PlateExportContext {
  /** The full document being exported */
  document?: TNode[];

  /** Current element being processed */
  element: TElement;

  /** Parent elements in the tree */
  ancestors?: TElement[];

  /** Style mappings from the editor */
  styleMap?: Record<string, string>;

  /** Registered export plugins */
  plugins?: Map<string, PlateExportPlugin>;

  /** Custom options passed during export */
  options?: PlateExportOptions;
}

/**
 * Options for Plate export operations
 */
export interface PlateExportOptions {
  /** Include track changes/suggestions */
  trackChanges?: boolean;

  /** Include comments */
  comments?: boolean;

  /** Custom style mappings */
  styles?: Record<string, string>;

  /** Image handling mode */
  images?: 'embed' | 'reference' | 'skip';

  /** Default author for track changes */
  defaultAuthor?: string;
}

/**
 * Result from an export plugin handler
 */
export interface ExportResult {
  /** The exported content (HTML string or DOCX element data) */
  content?: string;

  /** Whether to process children */
  processChildren?: boolean;

  /** Custom data for DOCX generation */
  docxData?: Record<string, unknown>;

  /** Error if export failed */
  error?: string;
}

// ============================================================================
// Plugin Registry
// ============================================================================

/**
 * Registry of export plugins keyed by their element/mark types
 */
const exportPluginRegistry = new Map<string, PlateExportPlugin>();

/**
 * Registers an export plugin
 *
 * @param plugin - The plugin to register
 *
 * @example
 * ```typescript
 * registerExportPlugin({
 *   key: 'my-custom-element',
 *   elementTypes: ['custom-block'],
 *   exportDocx: (node, context) => ({
 *     content: '<p>Custom content</p>'
 *   })
 * });
 * ```
 */
export function registerExportPlugin(plugin: PlateExportPlugin): void {
  if (plugin.elementTypes) {
    for (const type of plugin.elementTypes) {
      exportPluginRegistry.set(type, plugin);
    }
  }
  if (plugin.markTypes) {
    for (const mark of plugin.markTypes) {
      exportPluginRegistry.set(`mark:${mark}`, plugin);
    }
  }
  // Always register by key
  exportPluginRegistry.set(plugin.key, plugin);
}

/**
 * Gets an export plugin for a specific element type
 *
 * @param elementType - The element type to find a plugin for
 * @returns The plugin or undefined if not found
 */
export function getExportPlugin(
  elementType: string
): PlateExportPlugin | undefined {
  return exportPluginRegistry.get(elementType);
}

/**
 * Gets an export plugin for a specific mark type
 *
 * @param markType - The mark type to find a plugin for
 * @returns The plugin or undefined if not found
 */
export function getExportPluginForMark(
  markType: string
): PlateExportPlugin | undefined {
  return exportPluginRegistry.get(`mark:${markType}`);
}

/**
 * Gets all registered export plugins
 *
 * @returns Map of all registered plugins
 */
export function getAllExportPlugins(): Map<string, PlateExportPlugin> {
  return new Map(exportPluginRegistry);
}

/**
 * Clears all registered export plugins
 * Useful for testing or re-initialization
 */
export function clearExportPlugins(): void {
  exportPluginRegistry.clear();
}

// ============================================================================
// HTML Serialization Wrapper
// ============================================================================

/**
 * Serializes Slate nodes to HTML using Plate's serialization
 *
 * This is a wrapper that integrates with Plate's HTML serialization
 * system, falling back to basic serialization if no custom handler exists.
 *
 * @param nodes - The nodes to serialize
 * @param options - Export options
 * @returns Serialized HTML string
 *
 * @example
 * ```typescript
 * const html = serializeHtml(editor.children, { images: 'embed' });
 * ```
 */
export function serializeHtml(
  nodes: TNode[],
  options: PlateExportOptions = {}
): string {
  // TODO: Integrate with Plate's actual HTML serialization
  // For now, provide a basic implementation
  return nodes.map((node) => serializeNodeToHtml(node, options)).join('');
}

/**
 * Serializes a single node to HTML
 *
 * @param node - The node to serialize
 * @param options - Export options
 * @returns HTML string
 */
function serializeNodeToHtml(node: TNode, options: PlateExportOptions): string {
  // Check for text nodes
  if ('text' in node) {
    return serializeTextToHtml(node as TText, options);
  }

  // Element nodes
  const element = node as TElement;
  const plugin = getExportPlugin(element.type);

  // Use plugin's custom HTML serialization if available
  if (plugin?.serializeHtml) {
    const html = plugin.serializeHtml(element);
    if (html !== null) {
      return html;
    }
  }

  // Default serialization based on element type
  return serializeElementToHtml(element, options);
}

/**
 * Serializes a text node to HTML with formatting
 *
 * @param text - The text node to serialize
 * @param options - Export options
 * @returns HTML string with inline formatting
 */
function serializeTextToHtml(text: TText, options: PlateExportOptions): string {
  let html = escapeHtml(text.text);

  // Apply common marks as HTML tags
  // Note: This is a simplified implementation
  // Real implementation should check for all registered marks
  const node = text as Record<string, unknown>;

  if (node.bold) {
    html = `<strong>${html}</strong>`;
  }
  if (node.italic) {
    html = `<em>${html}</em>`;
  }
  if (node.underline) {
    html = `<u>${html}</u>`;
  }
  if (node.strikethrough) {
    html = `<s>${html}</s>`;
  }
  if (node.code) {
    html = `<code>${html}</code>`;
  }
  if (node.subscript) {
    html = `<sub>${html}</sub>`;
  }
  if (node.superscript) {
    html = `<sup>${html}</sup>`;
  }

  return html;
}

/**
 * Serializes an element node to HTML
 *
 * @param element - The element to serialize
 * @param options - Export options
 * @returns HTML string
 */
function serializeElementToHtml(
  element: TElement,
  options: PlateExportOptions
): string {
  const children = element.children
    .map((child) => serializeNodeToHtml(child, options))
    .join('');

  // Map common Plate element types to HTML
  switch (element.type) {
    case 'p':
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'h1':
    case 'heading-one':
      return `<h1>${children}</h1>`;
    case 'h2':
    case 'heading-two':
      return `<h2>${children}</h2>`;
    case 'h3':
    case 'heading-three':
      return `<h3>${children}</h3>`;
    case 'h4':
    case 'heading-four':
      return `<h4>${children}</h4>`;
    case 'h5':
    case 'heading-five':
      return `<h5>${children}</h5>`;
    case 'h6':
    case 'heading-six':
      return `<h6>${children}</h6>`;
    case 'blockquote':
      return `<blockquote>${children}</blockquote>`;
    case 'code_block':
    case 'code-block':
      return `<pre><code>${children}</code></pre>`;
    case 'ul':
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'ol':
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'li':
    case 'list-item':
      return `<li>${children}</li>`;
    case 'link':
    case 'a': {
      const url = (element as unknown as { url?: string }).url || '';
      return `<a href="${escapeHtml(url)}">${children}</a>`;
    }
    case 'img':
    case 'image': {
      const img = element as unknown as { url?: string; alt?: string };
      if (options.images === 'skip') return '';
      return `<img src="${escapeHtml(img.url || '')}" alt="${escapeHtml(img.alt || '')}" />`;
    }
    case 'table':
      return `<table>${children}</table>`;
    case 'tr':
    case 'table-row':
      return `<tr>${children}</tr>`;
    case 'td':
    case 'table-cell':
      return `<td>${children}</td>`;
    case 'th':
    case 'table-header':
      return `<th>${children}</th>`;
    case 'hr':
    case 'horizontal-rule':
      return '<hr />';
    default:
      // Unknown element type, wrap in div
      return `<div data-type="${element.type}">${children}</div>`;
  }
}

/**
 * Escapes HTML special characters
 *
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================================
// Export Context Builder
// ============================================================================

/**
 * Creates an export context for processing a document
 *
 * @param document - The document nodes
 * @param options - Export options
 * @returns Export context
 */
export function createExportContext(
  document: TNode[],
  options: PlateExportOptions = {}
): Omit<PlateExportContext, 'element'> {
  return {
    document,
    ancestors: [],
    styleMap: options.styles || {},
    plugins: getAllExportPlugins(),
    options,
  };
}

/**
 * Builds a full export context for a specific element
 *
 * @param element - The element being processed
 * @param baseContext - The base context from createExportContext
 * @param ancestors - Parent elements in the tree
 * @returns Complete export context
 */
export function buildElementContext(
  element: TElement,
  baseContext: Omit<PlateExportContext, 'element'>,
  ancestors: TElement[] = []
): PlateExportContext {
  return {
    ...baseContext,
    element,
    ancestors,
  };
}
