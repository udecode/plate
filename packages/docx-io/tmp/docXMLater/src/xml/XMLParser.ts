/**
 * XMLParser - Simple position-based XML parser
 * Avoids regex backtracking issues that can cause ReDoS attacks
 * Completes the DocXML framework (XMLBuilder + XMLParser)
 */

import { getGlobalLogger, createScopedLogger, ILogger } from "../utils/logger";
import { XMLBuilder } from "./XMLBuilder";

// Create scoped logger for XMLParser operations
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'XMLParser');
}

/**
 * Default maximum nesting depth for XML parsing.
 * Prevents stack overflow on deeply nested documents.
 */
export const DEFAULT_MAX_NESTING_DEPTH = 256;

/**
 * Options for XML-to-object parsing
 */
export interface ParseToObjectOptions {
  /** Ignore attributes (default: false) */
  ignoreAttributes?: boolean;

  /** Attribute name prefix (default: '@_') */
  attributeNamePrefix?: string;

  /** Text node property name (default: '#text') */
  textNodeName?: string;

  /** Remove namespace prefixes from element names (default: false) */
  ignoreNamespace?: boolean;

  /** Parse numeric attribute values (default: true) */
  parseAttributeValue?: boolean;

  /** Trim whitespace from text values (default: true) */
  trimValues?: boolean;

  /** Always return arrays for elements (default: false) */
  alwaysArray?: boolean;

  /** Maximum nesting depth (default: 256). Prevents stack overflow on deeply nested documents. */
  maxNestingDepth?: number;
}

/**
 * Parsed XML object structure
 * Can be a string, object, array, or nested structure
 */
export type ParsedXMLValue =
  | string
  | number
  | boolean
  | ParsedXMLObject
  | ParsedXMLObject[]
  | null
  | undefined;

/**
 * Parsed XML object with dynamic keys
 */
export interface ParsedXMLObject {
  [key: string]: ParsedXMLValue;
}

/**
 * Internal structure for tracking parsed elements during parsing
 */
interface ParsedElement {
  name: string;
  value: ParsedXMLValue;
}

/**
 * Simple XML parser using position-based parsing instead of regex
 * Prevents catastrophic backtracking (ReDoS attacks) by avoiding nested regex patterns
 */
export class XMLParser {
  /**
   * Extracts the body content from a Word document XML
   * @param docXml - The complete document.xml content
   * @returns The body content, or empty string if not found
   */
  static extractBody(docXml: string): string {
    const startTag = "<w:body";
    const endTag = "</w:body>";

    const startIdx = docXml.indexOf(startTag);
    if (startIdx === -1) return "";

    // Find the closing > of opening tag
    const openEnd = docXml.indexOf(">", startIdx);
    if (openEnd === -1) return "";

    // Find matching closing tag
    const endIdx = docXml.indexOf(endTag, openEnd);
    if (endIdx === -1) return "";

    return docXml.substring(openEnd + 1, endIdx);
  }

  /**
   * Extracts all elements of a given type using position-based parsing
   * Handles nested tags correctly by tracking depth
   * @param xml - XML content to parse
   * @param tagName - Tag name to extract (e.g., 'w:p', 'w:r')
   * @returns Array of XML strings for each element
   */
  static extractElements(xml: string, tagName: string): string[] {
    const elements: string[] = [];
    const openTag = `<${tagName}`;
    const closeTag = `</${tagName}>`;
    const selfClosingEnd = "/>";

    let pos = 0;
    while (pos < xml.length) {
      const startIdx = xml.indexOf(openTag, pos);
      if (startIdx === -1) break;

      // Verify this is the exact tag (not a prefix match like <w:p matching <w:pPr>)
      // The character after the tag name must be either '>', '/', whitespace, or '=' (for attributes)
      const charAfterTag = xml[startIdx + openTag.length];
      if (
        charAfterTag &&
        charAfterTag !== ">" &&
        charAfterTag !== "/" &&
        charAfterTag !== " " &&
        charAfterTag !== "\t" &&
        charAfterTag !== "\n" &&
        charAfterTag !== "\r" &&
        charAfterTag !== "="
      ) {
        // This is a prefix match (e.g., <w:pPr> when looking for <w:p>), skip it (Issue #5)
        pos = startIdx + openTag.length;
        continue;
      }

      // Find the end of opening tag
      const openEnd = xml.indexOf(">", startIdx);
      if (openEnd === -1) break;

      // Check if self-closing
      if (xml.substring(openEnd - 1, openEnd + 1) === selfClosingEnd) {
        elements.push(xml.substring(startIdx, openEnd + 1));
        pos = openEnd + 1;
        continue;
      }

      // Find matching closing tag (handle nesting)
      let depth = 1;
      let searchPos = openEnd + 1;

      while (depth > 0 && searchPos < xml.length) {
        // Find next potential opening tag
        let nextOpen = -1;
        let openSearchPos = searchPos;
        while (true) {
          const candidateOpen = xml.indexOf(openTag, openSearchPos);
          if (candidateOpen === -1) {
            break;
          }
          // Verify it's an exact match (not a prefix)
          const charAfter = xml[candidateOpen + openTag.length];
          if (
            charAfter &&
            charAfter !== ">" &&
            charAfter !== "/" &&
            charAfter !== " " &&
            charAfter !== "\t" &&
            charAfter !== "\n" &&
            charAfter !== "\r"
          ) {
            // Prefix match, keep searching
            openSearchPos = candidateOpen + openTag.length;
            continue;
          }
          nextOpen = candidateOpen;
          break;
        }

        const nextClose = xml.indexOf(closeTag, searchPos);

        if (nextClose === -1) break;

        if (nextOpen !== -1 && nextOpen < nextClose) {
          depth++;
          searchPos = nextOpen + openTag.length;
        } else {
          depth--;
          if (depth === 0) {
            elements.push(xml.substring(startIdx, nextClose + closeTag.length));
            pos = nextClose + closeTag.length;
          } else {
            searchPos = nextClose + closeTag.length;
          }
        }
      }

      if (depth > 0) {
        // Unclosed tag - skip it
        pos = startIdx + openTag.length;
      }
    }

    return elements;
  }

  /**
   * Extracts attribute value from an XML string
   * @param xml - XML content
   * @param attributeName - Attribute name (e.g., 'w:val')
   * @returns Attribute value or undefined
   */
  static extractAttribute(
    xml: string,
    attributeName: string
  ): string | undefined {
    // Use simple indexOf for bounded string search (safe)
    const attrPattern = `${attributeName}="`;
    const startIdx = xml.indexOf(attrPattern);
    if (startIdx === -1) return undefined;

    const valueStart = startIdx + attrPattern.length;
    const valueEnd = xml.indexOf('"', valueStart);
    if (valueEnd === -1) return undefined;

    const rawValue = xml.substring(valueStart, valueEnd);
    // Unescape XML entities to get the actual value
    // This prevents double-escaping when the value is later re-serialized
    return XMLBuilder.unescapeXml(rawValue);
  }

  /**
   * Checks if an XML string contains a self-closing tag
   * @param xml - XML content
   * @param tagName - Tag name to check
   * @returns True if the tag exists as self-closing
   */
  static hasSelfClosingTag(xml: string, tagName: string): boolean {
    return xml.includes(`<${tagName}/>`) || xml.includes(`<${tagName} `);
  }

  /**
   * Checks if a boolean property tag is enabled (w:val="1" or w:val="true")
   * Per ECMA-376, boolean properties can be:
   * - Present with w:val="1" or w:val="true" (enabled)
   * - Present with w:val="0" or w:val="false" (explicitly disabled)
   * - Absent (disabled by default)
   *
   * @param xml - XML content to search
   * @param tagName - Tag name (e.g., 'w:keepNext')
   * @returns True if tag exists with w:val="1" or w:val="true", false otherwise
   *
   * @example
   * hasBooleanProperty('<w:pPr><w:keepNext w:val="1"/></w:pPr>', 'w:keepNext'); // true
   * hasBooleanProperty('<w:pPr><w:keepNext w:val="0"/></w:pPr>', 'w:keepNext'); // false
   * hasBooleanProperty('<w:pPr><w:spacing/></w:pPr>', 'w:keepNext'); // false
   */
  static hasBooleanProperty(xml: string, tagName: string): boolean {
    // Check for tag with w:val="1" or w:val="true"
    if (
      xml.includes(`<${tagName} w:val="1"`) ||
      xml.includes(`<${tagName} w:val="true"`)
    ) {
      return true;
    }

    // Check for self-closing tag without w:val attribute (means true per ECMA-376)
    // Example: <w:b/> means bold=true
    if (xml.includes(`<${tagName}/>`)) {
      return true;
    }

    return false;
  }

  /**
   * Extracts text content from within tags
   * Finds all <w:t>...</w:t> tags and extracts their text
   * @param xml - XML content
   * @returns Combined text content
   */
  static extractText(xml: string): string {
    const texts: string[] = [];
    const openTag = "<w:t";
    const closeTag = "</w:t>";

    let pos = 0;
    while (pos < xml.length) {
      const startIdx = xml.indexOf(openTag, pos);
      if (startIdx === -1) break;

      // Find the end of opening tag
      const openEnd = xml.indexOf(">", startIdx);
      if (openEnd === -1) break;

      // Find closing tag
      const closeIdx = xml.indexOf(closeTag, openEnd);
      if (closeIdx === -1) break;

      // Extract text between tags
      const text = xml.substring(openEnd + 1, closeIdx);
      texts.push(text);

      pos = closeIdx + closeTag.length;
    }

    return texts.join("");
  }

  /**
   * Validates input size to prevent excessive memory usage
   * @param xml - XML content
   * @param maxSize - Maximum size in bytes (default: 10MB)
   * @throws Error if XML exceeds max size
   */
  static validateSize(xml: string, maxSize: number = 10 * 1024 * 1024): void {
    if (xml.length > maxSize) {
      throw new Error(
        `XML content too large for parsing (${(
          xml.length /
          1024 /
          1024
        ).toFixed(1)}MB). ` +
          `Maximum allowed: ${(maxSize / 1024 / 1024).toFixed(0)}MB`
      );
    }
  }

  /**
   * Extracts content between two specific tags
   * More efficient than regex for large documents
   * @param xml - XML content
   * @param startTag - Opening tag (e.g., '<w:pPr')
   * @param endTag - Closing tag (e.g., '</w:pPr>')
   * @returns Content between tags, or undefined if not found
   */
  static extractBetweenTags(
    xml: string,
    startTag: string,
    endTag: string
  ): string | undefined {
    const startIdx = xml.indexOf(startTag);
    if (startIdx === -1) return undefined;

    // Find the end of the opening tag
    const openEnd = xml.indexOf(">", startIdx);
    if (openEnd === -1) return undefined;

    // Find the closing tag
    const endIdx = xml.indexOf(endTag, openEnd);
    if (endIdx === -1) return undefined;

    return xml.substring(openEnd + 1, endIdx);
  }

  /**
   * Extracts a complete self-closing tag with its attributes
   * Handles cases where multiple similar tags exist (e.g., <w:sz.../> and <w:szCs.../>)
   *
   * @param xml - XML string to search
   * @param tagName - Tag name to find (e.g., "w:color", "w:sz")
   * @returns The complete tag content (attributes portion) or undefined if not found
   *
   * @example
   * const xml = '<w:sz w:val="36"/><w:color w:val="FF0000"/>';
   * const colorTag = XMLParser.extractSelfClosingTag(xml, 'w:color');
   * // Returns: ' w:val="FF0000"'
   */
  static extractSelfClosingTag(
    xml: string,
    tagName: string
  ): string | undefined {
    const startPattern = `<${tagName}`;
    let searchPos = 0;

    // Search for the exact tag (not tags that start with this pattern)
    while (true) {
      const startIdx = xml.indexOf(startPattern, searchPos);
      if (startIdx === -1) return undefined;

      // Check what character follows the tag name
      const charAfterTag = xml[startIdx + startPattern.length];

      // Valid separators after tag name: space, '/', or '>'
      if (charAfterTag === ' ' || charAfterTag === '/' || charAfterTag === '>') {
        // Found the exact tag, now find its end
        const endIdx = xml.indexOf('/>', startIdx);
        if (endIdx === -1) {
          // Try finding a closing tag instead (non-self-closing)
          const closeTagStart = xml.indexOf('>', startIdx);
          if (closeTagStart === -1) return undefined;

          // Return attributes portion
          return xml.substring(startIdx + startPattern.length, closeTagStart);
        }

        // Return attributes portion (between tag name and />)
        return xml.substring(startIdx + startPattern.length, endIdx);
      }

      // Not the exact tag (e.g., found "w:sz" when looking for "w:s")
      // Continue searching
      searchPos = startIdx + 1;
    }
  }

  /**
   * Parse XML string to JavaScript object
   * Compatible with fast-xml-parser output format
   *
   * @param xml - XML string to parse
   * @param options - Parsing options
   * @returns Parsed JavaScript object
   *
   * @example
   * const xml = '<Relationships><Relationship Id="rId1" Target="https://example.com"/></Relationships>';
   * const obj = XMLParser.parseToObject(xml);
   * // Returns: { Relationships: { Relationship: { '@_Id': 'rId1', '@_Target': 'https://example.com' } } }
   *
   * @example
   * // Multiple elements become arrays
   * const xml = '<Items><Item id="1"/><Item id="2"/></Items>';
   * const obj = XMLParser.parseToObject(xml);
   * // Returns: { Items: { Item: [{ '@_id': '1' }, { '@_id': '2' }] } }
   */
  static parseToObject(
    xml: string,
    options?: ParseToObjectOptions
  ): ParsedXMLObject {
    const logger = getLogger();
    logger.debug('Parsing XML to object', { xmlSize: xml.length });

    // Default options
    const opts: Required<ParseToObjectOptions> = {
      ignoreAttributes: options?.ignoreAttributes ?? false,
      attributeNamePrefix: options?.attributeNamePrefix ?? "@_",
      textNodeName: options?.textNodeName ?? "#text",
      ignoreNamespace: options?.ignoreNamespace ?? false,
      parseAttributeValue: options?.parseAttributeValue ?? true,
      trimValues: options?.trimValues ?? true,
      alwaysArray: options?.alwaysArray ?? false,
      maxNestingDepth: options?.maxNestingDepth ?? DEFAULT_MAX_NESTING_DEPTH,
    };

    // Validate input size
    XMLParser.validateSize(xml);

    // Remove XML declaration and trim
    xml = xml.replace(/<\?xml[^>]*\?>\s*/g, "").trim();

    if (!xml) {
      return {};
    }

    // Parse root element (start at depth 0)
    const result = XMLParser.parseElementToObject(xml, 0, opts, 0);
    logger.debug('XML parsed to object');
    return result.value as ParsedXMLObject;
  }

  /**
   * Parses a single XML element into an object
   * @private
   */
  private static parseElementToObject(
    xml: string,
    startPos: number,
    options: Required<ParseToObjectOptions>,
    depth: number
  ): { value: ParsedXMLValue; endPos: number } {
    // Check nesting depth to prevent stack overflow
    if (depth > options.maxNestingDepth) {
      throw new Error(
        `XML nesting depth exceeds maximum of ${options.maxNestingDepth}. ` +
        `This may indicate malformed XML or an attack attempt. ` +
        `Use the maxNestingDepth option to increase the limit if needed.`
      );
    }

    // Find opening tag
    const openTagStart = xml.indexOf("<", startPos);
    if (openTagStart === -1) {
      return { value: {}, endPos: xml.length };
    }

    // Skip comments
    if (xml.substring(openTagStart, openTagStart + 4) === "<!--") {
      const commentEnd = xml.indexOf("-->", openTagStart + 4);
      if (commentEnd !== -1) {
        return XMLParser.parseElementToObject(xml, commentEnd + 3, options, depth);
      }
      return { value: {}, endPos: xml.length };
    }

    // Extract element name
    const nameMatch = xml
      .substring(openTagStart + 1)
      .match(/^([a-zA-Z0-9:_-]+)/);
    if (!nameMatch) {
      return { value: {}, endPos: openTagStart + 1 };
    }

    const originalElementName: string = nameMatch[1] || "";
    let elementName: string = originalElementName;
    const tagHeaderEnd = xml.indexOf(">", openTagStart);
    if (tagHeaderEnd === -1) {
      return { value: {}, endPos: xml.length };
    }

    // Remove namespace if requested (but keep original for offset calculations)
    if (options.ignoreNamespace && elementName.includes(":")) {
      elementName = elementName.split(":")[1] || elementName;
    }

    // Extract attributes using ORIGINAL element name length for correct offset
    const tagHeader = xml.substring(
      openTagStart + 1 + originalElementName.length,
      tagHeaderEnd
    );
    const attributes = XMLParser.extractAttributesFromTag(tagHeader, options);

    // Check if self-closing
    const isSelfClosing =
      tagHeader.trim().endsWith("/") || xml[tagHeaderEnd - 1] === "/";

    if (isSelfClosing) {
      // Self-closing tag - return object with attributes only
      const elementValue: ParsedXMLObject = { ...attributes };
      return {
        value: { [elementName]: elementValue },
        endPos: tagHeaderEnd + 1,
      };
    }

    // Find closing tag (use original name with namespace for correct matching)
    const closingTag = `</${originalElementName}>`;
    const contentStart = tagHeaderEnd + 1;
    const closingTagPos = XMLParser.findClosingTag(
      xml,
      originalElementName,
      contentStart
    );

    if (closingTagPos === -1) {
      // No closing tag found - treat as self-closing
      return {
        value: { [elementName]: { ...attributes } },
        endPos: tagHeaderEnd + 1,
      };
    }

    // Extract content between tags
    const content = xml.substring(contentStart, closingTagPos);

    // Parse content (children or text)
    const children: ParsedElement[] = [];
    let textContent = "";
    let pos = 0;

    while (pos < content.length) {
      const nextTag = content.indexOf("<", pos);

      if (nextTag === -1) {
        // No more tags - rest is text
        const text = content.substring(pos);
        // When trimValues is false, preserve whitespace-only text
        // When trimValues is true, only include text that has non-whitespace content
        if (text.length > 0 && (!options.trimValues || text.trim())) {
          // Unescape XML entities in text content (e.g., &lt; -> <)
          textContent += XMLBuilder.unescapeXml(text);
        }
        break;
      }

      // Collect text before next tag
      if (nextTag > pos) {
        const text = content.substring(pos, nextTag);
        // When trimValues is false, preserve whitespace-only text
        // When trimValues is true, only include text that has non-whitespace content
        if (text.length > 0 && (!options.trimValues || text.trim())) {
          // Unescape XML entities in text content (e.g., &lt; -> <)
          textContent += XMLBuilder.unescapeXml(text);
        }
      }

      // Parse child element (increment depth for children)
      const childResult = XMLParser.parseElementToObject(
        content,
        nextTag,
        options,
        depth + 1
      );
      const childObj = childResult.value as ParsedXMLObject;

      // Extract child name and value
      const childKeys = Object.keys(childObj);
      if (childKeys.length > 0) {
        const childName = childKeys[0];
        if (childName) {
          const childValue = childObj[childName];
          children.push({ name: childName, value: childValue });
        }
      }

      pos = childResult.endPos;
    }

    // Build element value
    let elementValue: ParsedXMLValue = {};

    // Add attributes
    if (!options.ignoreAttributes && Object.keys(attributes).length > 0) {
      elementValue = { ...attributes };
    }

    // Add text content
    // When trimValues is false, include whitespace-only text
    // When trimValues is true, only include text with non-whitespace content
    if (textContent.length > 0 && (!options.trimValues || textContent.trim())) {
      const text = options.trimValues ? textContent.trim() : textContent;
      if (typeof elementValue === "object" && !Array.isArray(elementValue)) {
        if (Object.keys(elementValue).length === 0) {
          // Only text, no attributes - return as direct value if simple
          elementValue = text;
        } else {
          // Text with attributes
          (elementValue as ParsedXMLObject)[options.textNodeName] = text;
        }
      }
    }

    // Add children
    if (children.length > 0) {
      const coalescedChildren = XMLParser.coalesceChildren(children, options);
      if (typeof elementValue === "object" && !Array.isArray(elementValue)) {
        elementValue = { ...elementValue, ...coalescedChildren };
      } else {
        elementValue = coalescedChildren;
      }
    }

    // If element has no content, attributes, or children - return empty object
    if (
      typeof elementValue === "object" &&
      !Array.isArray(elementValue) &&
      Object.keys(elementValue).length === 0
    ) {
      elementValue = {};
    }

    return {
      value: { [elementName]: elementValue },
      endPos: closingTagPos + closingTag.length,
    };
  }

  /**
   * Extracts attributes from a tag header
   * @private
   */
  private static extractAttributesFromTag(
    tagHeader: string,
    options: Required<ParseToObjectOptions>
  ): Record<string, string | number | boolean> {
    const attributes: Record<string, string | number | boolean> = {};

    if (options.ignoreAttributes) {
      return attributes;
    }

    // Simple attribute extraction using position-based parsing
    let pos = 0;
    while (pos < tagHeader.length) {
      // Skip whitespace
      while (pos < tagHeader.length) {
        const char = tagHeader[pos];
        if (char && /\s/.test(char)) {
          pos++;
        } else {
          break;
        }
      }

      if (pos >= tagHeader.length || tagHeader[pos] === "/") {
        break;
      }

      // Extract attribute name
      const nameStart = pos;
      while (pos < tagHeader.length) {
        const char = tagHeader[pos];
        if (char && /[a-zA-Z0-9:_-]/.test(char)) {
          pos++;
        } else {
          break;
        }
      }

      if (pos === nameStart) {
        break;
      }

      let attrName = tagHeader.substring(nameStart, pos);

      // Skip whitespace and '='
      while (pos < tagHeader.length) {
        const char = tagHeader[pos];
        if (char && /[\s=]/.test(char)) {
          pos++;
        } else {
          break;
        }
      }

      // Extract attribute value
      let attrValue = "";
      if (
        pos < tagHeader.length &&
        (tagHeader[pos] === '"' || tagHeader[pos] === "'")
      ) {
        const quote = tagHeader[pos];
        pos++; // Skip opening quote
        const valueStart = pos;

        while (pos < tagHeader.length && tagHeader[pos] !== quote) {
          pos++;
        }

        attrValue = tagHeader.substring(valueStart, pos);
        pos++; // Skip closing quote
      }

      // Remove namespace from attribute name if requested
      if (options.ignoreNamespace && attrName.includes(":")) {
        attrName = attrName.split(":")[1] || attrName;
      }

      // Add prefix to attribute name
      const prefixedName = options.attributeNamePrefix + attrName;

      // Parse attribute value
      attributes[prefixedName] = options.parseAttributeValue
        ? XMLParser.parseValue(attrValue)
        : attrValue;
    }

    return attributes;
  }

  /**
   * Finds the closing tag for an element, handling nesting
   * @private
   */
  private static findClosingTag(
    xml: string,
    elementName: string,
    startPos: number
  ): number {
    const openTag = `<${elementName}`;
    const closeTag = `</${elementName}>`;
    let depth = 1;
    let pos = startPos;

    while (depth > 0 && pos < xml.length) {
      const nextClose = xml.indexOf(closeTag, pos);

      if (nextClose === -1) {
        return -1; // No closing tag found
      }

      // Find the next REAL opening tag (not a prefix match like <w:pPrChange for <w:pPr)
      // Must search for all potential matches and verify each one
      let realOpenPos = -1;
      let searchPos = pos;
      while (searchPos < nextClose) {
        const candidateOpen = xml.indexOf(openTag, searchPos);
        if (candidateOpen === -1 || candidateOpen >= nextClose) {
          break; // No more candidates before the closing tag
        }

        const charAfter = xml[candidateOpen + openTag.length];
        if (
          charAfter === ">" ||
          charAfter === " " ||
          charAfter === "/" ||
          charAfter === "\t" ||
          charAfter === "\n" ||
          charAfter === "\r"
        ) {
          // This looks like a real opening tag - but check if it's self-closing
          // Self-closing tags like <w:rPr/> should NOT increase depth
          const tagEnd = xml.indexOf(">", candidateOpen);
          if (tagEnd !== -1 && xml[tagEnd - 1] === "/") {
            // Self-closing tag - skip it (don't affect depth)
            searchPos = tagEnd + 1;
            continue;
          }
          // This is a real opening tag (not self-closing)
          realOpenPos = candidateOpen;
          break;
        }

        // False positive (e.g., <w:pPrChange when looking for <w:pPr)
        // Keep searching from after this position
        searchPos = candidateOpen + openTag.length;
      }

      if (realOpenPos !== -1) {
        // Found a real opening tag before the closing tag - increase depth
        depth++;
        pos = realOpenPos + openTag.length;
      } else {
        // No real opening tag before this closing tag - decrease depth
        depth--;
        if (depth === 0) {
          return nextClose;
        }
        pos = nextClose + closeTag.length;
      }
    }

    return -1;
  }

  /**
   * Coalesces children with duplicate names into arrays
   * @private
   */
  private static coalesceChildren(
    children: ParsedElement[],
    options: Required<ParseToObjectOptions>
  ): ParsedXMLObject {
    const result: ParsedXMLObject = {};
    const nameCounts: Record<string, number> = {};
    const nameIndices: Record<string, number> = {};

    // Track element order for correct run content parsing (tabs, breaks, text)
    // This is critical for preserving the order of mixed content like: text -> tab -> text
    const orderedChildren: Array<{ type: string; index: number }> = [];

    // Count occurrences of each child name
    for (const child of children) {
      nameCounts[child.name] = (nameCounts[child.name] || 0) + 1;
    }

    // Build result object while tracking order
    for (const child of children) {
      const shouldBeArray =
        options.alwaysArray || (nameCounts[child.name] || 0) > 1;

      // Track element order with its index in the array
      const currentIndex = nameIndices[child.name] || 0;
      orderedChildren.push({ type: child.name, index: currentIndex });
      nameIndices[child.name] = currentIndex + 1;

      if (shouldBeArray) {
        if (!result[child.name]) {
          result[child.name] = [];
        }
        (result[child.name] as ParsedXMLValue[]).push(child.value);
      } else {
        result[child.name] = child.value;
      }
    }

    // Add _orderedChildren to track element order (used by DocumentParser for runs)
    if (orderedChildren.length > 0) {
      result["_orderedChildren"] = orderedChildren;
    }

    return result;
  }

  /**
   * Parses a string value to number or boolean if applicable
   * @private
   */
  private static parseValue(value: string): string | number | boolean {
    if (value === "true") return true;
    if (value === "false") return false;

    // Preserve 6-character hex color codes (OpenXML standard for colors)
    // This includes "000000" (black) which should stay as a string
    if (/^[0-9A-Fa-f]{6}$/.test(value)) {
      return value.toUpperCase(); // Normalize to uppercase per Microsoft convention
    }

    // Preserve long digit-only strings (e.g., cnfStyle binary strings like "100000000000")
    // These should not be converted to numbers to avoid losing leading zeros
    if (/^\d{7,}$/.test(value)) {
      return value; // Keep as string for values with 7+ digits
    }

    // Try parsing as number
    // 3-character values like "240" will be parsed as numbers
    // 6-character hex values are already handled above
    if (/^-?\d+$/.test(value)) {
      const num = parseInt(value, 10);
      if (!isNaN(num)) return num;
    }

    if (/^-?\d+\.\d+$/.test(value)) {
      const num = parseFloat(value);
      if (!isNaN(num)) return num;
    }

    // Preserve 3-character hex codes (like "F0A") that have letters
    // Pure numeric 3-char values (like "240") are already parsed as numbers above
    if (/^[0-9A-Fa-f]{3}$/.test(value) && /[A-Fa-f]/.test(value)) {
      return value.toUpperCase();
    }

    return value;
  }
}
