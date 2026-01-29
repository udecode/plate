/**
 * Link Handler - HTML anchor to DOCX hyperlink conversion
 *
 * This module provides handlers for converting HTML anchor elements to
 * docXMLater Hyperlink objects.
 *
 * Supports:
 * - External links (http://, https://, mailto:, tel:)
 * - Internal links (bookmarks, anchors)
 * - Email links
 * - Relationship ID generation and management
 *
 * @module link-handler
 */

import { Hyperlink, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Default hyperlink text color (blue) */
const DEFAULT_LINK_COLOR = '0000FF';

/** Default hyperlink underline style */
const DEFAULT_LINK_UNDERLINE = 'single';

/** Counter for generating unique relationship IDs */
let relationshipIdCounter = 0;

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Options for link conversion
 */
export interface LinkConversionOptions {
  /** Default link color (hex without #) */
  defaultColor?: string;
  /** Default underline style */
  defaultUnderline?: 'single' | 'double' | 'none';
  /** Whether to apply default hyperlink formatting */
  applyDefaultFormatting?: boolean;
  /** Custom relationship ID generator */
  relationshipIdGenerator?: () => string;
  /** Base URL for resolving relative links */
  baseUrl?: string;
}

/**
 * Parsed link information
 */
export interface ParsedLink {
  /** Link type */
  type: 'external' | 'internal' | 'email' | 'tel';
  /** Target URL or anchor */
  target: string;
  /** Display text */
  text: string;
  /** Tooltip text */
  tooltip?: string;
  /** Whether the link is empty/invisible */
  isEmpty: boolean;
}

/**
 * Link relationship entry
 */
export interface LinkRelationship {
  /** Relationship ID */
  relationshipId: string;
  /** Target URL */
  target: string;
  /** Relationship type */
  type: 'external' | 'internal';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generates a unique relationship ID for external links
 *
 * @param prefix - Prefix for the ID (default: 'rId')
 * @returns Unique relationship ID
 *
 * @example
 * ```typescript
 * const rId = generateRelationshipId();
 * // Returns 'rId1', 'rId2', etc.
 * ```
 */
export function generateRelationshipId(prefix = 'rId'): string {
  return `${prefix}${++relationshipIdCounter}`;
}

/**
 * Resets the relationship ID counter
 *
 * Useful for testing or when starting a new document.
 */
export function resetRelationshipIdCounter(): void {
  relationshipIdCounter = 0;
}

/**
 * Parses an href attribute to determine link type and target
 *
 * @param href - The href attribute value
 * @param baseUrl - Optional base URL for resolving relative links
 * @returns Parsed link information
 */
export function parseHref(
  href: string,
  baseUrl?: string
): { type: ParsedLink['type']; target: string } {
  if (!href) {
    return { type: 'internal', target: '' };
  }

  // Trim whitespace
  href = href.trim();

  // Internal bookmark/anchor link
  if (href.startsWith('#')) {
    return { type: 'internal', target: href.substring(1) };
  }

  // Email link
  if (href.toLowerCase().startsWith('mailto:')) {
    return { type: 'email', target: href };
  }

  // Telephone link
  if (href.toLowerCase().startsWith('tel:')) {
    return { type: 'tel', target: href };
  }

  // External HTTP/HTTPS link
  if (
    href.toLowerCase().startsWith('http://') ||
    href.toLowerCase().startsWith('https://')
  ) {
    return { type: 'external', target: href };
  }

  // Resolve relative URLs if baseUrl provided
  if (baseUrl) {
    try {
      const resolvedUrl = new URL(href, baseUrl);
      return { type: 'external', target: resolvedUrl.href };
    } catch {
      // Invalid URL, treat as internal
      return { type: 'internal', target: href };
    }
  }

  // Treat as relative external link (will need base URL in document)
  if (href.includes('/') || href.includes('.')) {
    return { type: 'external', target: href };
  }

  // Default to internal
  return { type: 'internal', target: href };
}

/**
 * Sanitizes a URL for use in DOCX
 *
 * @param url - The URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeUrl(url: string): string {
  // Remove any javascript: URLs (security)
  if (url.toLowerCase().startsWith('javascript:')) {
    return '';
  }

  // Encode special characters
  try {
    // Parse and re-serialize to ensure proper encoding
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      return parsed.href;
    }
    if (url.startsWith('mailto:')) {
      return url; // mailto: links are typically already properly formatted
    }
  } catch {
    // URL parsing failed, return as-is
  }

  return url;
}

/**
 * Extracts display text from an anchor element
 *
 * @param element - The anchor element
 * @returns Display text
 */
export function extractLinkText(element: Element): string {
  // Use textContent for text
  const text = element.textContent?.trim() || '';

  // If empty, check for alt text on images
  if (!text) {
    const img = element.querySelector('img');
    if (img) {
      return img.getAttribute('alt') || 'Link';
    }
  }

  return text || 'Link';
}

// ============================================================================
// Link Handlers
// ============================================================================

/**
 * Handles anchor elements (<a>)
 *
 * Creates a Hyperlink element with proper type (external/internal).
 *
 * @param element - The <a> element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with Hyperlink
 *
 * @example
 * ```typescript
 * const result = handleAnchorElement(anchorElement, context);
 * if (result.element) {
 *   paragraph.addHyperlink(result.element as Hyperlink);
 * }
 * ```
 */
export function handleAnchorElement(
  element: Element,
  context: ConversionContext,
  options: LinkConversionOptions = {}
): ConversionResult {
  const {
    defaultColor = DEFAULT_LINK_COLOR,
    defaultUnderline = DEFAULT_LINK_UNDERLINE,
    applyDefaultFormatting = true,
    relationshipIdGenerator = generateRelationshipId,
    baseUrl,
  } = options;

  const href = element.getAttribute('href') || '';
  const title = element.getAttribute('title') || undefined;
  const target = element.getAttribute('target') || undefined;

  // Parse the href
  const { type, target: linkTarget } = parseHref(href, baseUrl);

  // Extract display text
  const displayText = extractLinkText(element);

  // Determine if this is an empty/invisible hyperlink
  const isEmpty = !displayText && element.children.length === 0;

  // Sanitize URL for external links
  const sanitizedTarget =
    type === 'external' || type === 'email' || type === 'tel'
      ? sanitizeUrl(linkTarget)
      : linkTarget;

  // Build formatting
  const formatting: RunFormatting = applyDefaultFormatting
    ? {
        color: defaultColor,
        underline: defaultUnderline,
        ...(context.inheritedFormatting || {}),
      }
    : context.inheritedFormatting || {};

  // Create hyperlink based on type
  let hyperlink: Hyperlink;

  switch (type) {
    case 'internal':
      // Internal bookmark link
      hyperlink = Hyperlink.createInternal(
        sanitizedTarget,
        displayText,
        formatting
      );
      break;

    case 'email':
      // Email link
      hyperlink = Hyperlink.createEmail(
        sanitizedTarget.replace(/^mailto:/i, ''),
        displayText,
        formatting
      );
      // Email links need relationship ID
      hyperlink.setRelationshipId(relationshipIdGenerator());
      break;

    case 'tel':
      // Telephone link - treat as external
      hyperlink = Hyperlink.createExternal(
        sanitizedTarget,
        displayText,
        formatting
      );
      hyperlink.setRelationshipId(relationshipIdGenerator());
      break;

    case 'external':
    default:
      // External web link
      hyperlink = Hyperlink.createExternal(
        sanitizedTarget,
        displayText,
        formatting
      );
      // External links require relationship ID
      hyperlink.setRelationshipId(relationshipIdGenerator());
      break;
  }

  // Set tooltip if provided
  if (title) {
    hyperlink.setTooltip(title);
  }

  return {
    element: hyperlink,
    processChildren: false, // Hyperlink handles its own content
  };
}

/**
 * Creates an external hyperlink
 *
 * @param url - External URL
 * @param text - Display text
 * @param options - Additional options
 * @returns Created Hyperlink
 *
 * @example
 * ```typescript
 * const link = createExternalLink('https://example.com', 'Visit Example');
 * paragraph.addHyperlink(link);
 * ```
 */
export function createExternalLink(
  url: string,
  text?: string,
  options: {
    tooltip?: string;
    formatting?: RunFormatting;
    relationshipId?: string;
  } = {}
): Hyperlink {
  const sanitizedUrl = sanitizeUrl(url);
  const displayText = text || url;

  const formatting: RunFormatting = {
    color: DEFAULT_LINK_COLOR,
    underline: DEFAULT_LINK_UNDERLINE,
    ...options.formatting,
  };

  const hyperlink = Hyperlink.createExternal(
    sanitizedUrl,
    displayText,
    formatting
  );

  // Set relationship ID (required for external links)
  hyperlink.setRelationshipId(
    options.relationshipId || generateRelationshipId()
  );

  // Set tooltip if provided
  if (options.tooltip) {
    hyperlink.setTooltip(options.tooltip);
  }

  return hyperlink;
}

/**
 * Creates an internal bookmark link
 *
 * @param anchor - Bookmark/anchor name
 * @param text - Display text
 * @param options - Additional options
 * @returns Created Hyperlink
 *
 * @example
 * ```typescript
 * const link = createInternalLink('section-1', 'Jump to Section 1');
 * paragraph.addHyperlink(link);
 * ```
 */
export function createInternalLink(
  anchor: string,
  text: string,
  options: {
    tooltip?: string;
    formatting?: RunFormatting;
  } = {}
): Hyperlink {
  const formatting: RunFormatting = {
    color: DEFAULT_LINK_COLOR,
    underline: DEFAULT_LINK_UNDERLINE,
    ...options.formatting,
  };

  const hyperlink = Hyperlink.createInternal(anchor, text, formatting);

  // Set tooltip if provided
  if (options.tooltip) {
    hyperlink.setTooltip(options.tooltip);
  }

  return hyperlink;
}

/**
 * Creates an email link
 *
 * @param email - Email address
 * @param text - Display text (defaults to email address)
 * @param options - Additional options
 * @returns Created Hyperlink
 *
 * @example
 * ```typescript
 * const link = createEmailLink('contact@example.com', 'Contact Us');
 * paragraph.addHyperlink(link);
 * ```
 */
export function createEmailLink(
  email: string,
  text?: string,
  options: {
    subject?: string;
    body?: string;
    tooltip?: string;
    formatting?: RunFormatting;
    relationshipId?: string;
  } = {}
): Hyperlink {
  const displayText = text || email;

  // Build mailto URL with optional subject and body
  let mailtoUrl = `mailto:${email}`;
  const params: string[] = [];
  if (options.subject) {
    params.push(`subject=${encodeURIComponent(options.subject)}`);
  }
  if (options.body) {
    params.push(`body=${encodeURIComponent(options.body)}`);
  }
  if (params.length > 0) {
    mailtoUrl += '?' + params.join('&');
  }

  const formatting: RunFormatting = {
    color: DEFAULT_LINK_COLOR,
    underline: DEFAULT_LINK_UNDERLINE,
    ...options.formatting,
  };

  const hyperlink = Hyperlink.createEmail(email, displayText, formatting);

  // Email links need relationship ID
  hyperlink.setRelationshipId(
    options.relationshipId || generateRelationshipId()
  );

  // Set tooltip if provided
  if (options.tooltip) {
    hyperlink.setTooltip(options.tooltip);
  }

  return hyperlink;
}

/**
 * Creates a web link (alias for createExternalLink)
 *
 * @param url - Web URL
 * @param text - Display text
 * @param options - Additional options
 * @returns Created Hyperlink
 */
export function createWebLink(
  url: string,
  text?: string,
  options: {
    tooltip?: string;
    formatting?: RunFormatting;
    relationshipId?: string;
  } = {}
): Hyperlink {
  return createExternalLink(url, text, options);
}

// ============================================================================
// Link Relationship Management
// ============================================================================

/**
 * Collects all hyperlinks from content for relationship registration
 *
 * @param content - Array of paragraphs or other content
 * @returns Array of link relationships to register
 */
export function collectLinkRelationships(
  content: unknown[]
): LinkRelationship[] {
  const relationships: LinkRelationship[] = [];
  const seen = new Set<string>();

  function processItem(item: unknown): void {
    if (!item || typeof item !== 'object') return;

    // Check if this is a Hyperlink
    const itemObj = item as Record<string, unknown>;
    if (
      typeof itemObj.getUrl === 'function' &&
      typeof itemObj.getRelationshipId === 'function'
    ) {
      const hyperlink = item as Hyperlink;
      const url = hyperlink.getUrl();
      const rId = hyperlink.getRelationshipId();

      if (url && rId && !seen.has(rId)) {
        seen.add(rId);
        relationships.push({
          relationshipId: rId,
          target: url,
          type: 'external',
        });
      }
    }

    // Recurse into paragraphs
    if (typeof itemObj.getContent === 'function') {
      const content = (itemObj.getContent as () => unknown[])();
      if (Array.isArray(content)) {
        content.forEach(processItem);
      }
    }

    // Recurse into runs
    if (typeof itemObj.getRuns === 'function') {
      const runs = (itemObj.getRuns as () => unknown[])();
      if (Array.isArray(runs)) {
        runs.forEach(processItem);
      }
    }
  }

  content.forEach(processItem);

  return relationships;
}
