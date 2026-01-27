/**
 * XMLBuilder - Utility for building XML content
 * Provides a simple fluent API for generating WordprocessingML XML
 */

import { removeInvalidXmlChars } from "../utils/xmlSanitization";

/**
 * Represents an XML element with attributes and children
 */
export interface XMLElement {
  name: string;
  attributes?: Record<string, string | number | boolean | undefined>;
  children?: (XMLElement | string)[];
  selfClosing?: boolean;
  /** Raw XML content to include without escaping (used for VML passthrough) */
  rawXml?: string;
}

/**
 * XML Builder for creating WordprocessingML XML
 */
export class XMLBuilder {
  private elements: (XMLElement | string)[] = [];

  /**
   * Elements that must NEVER be self-closing in Word XML per ECMA-376.
   * Self-closing these elements causes Word to not parse correctly or lose content.
   */
  private static readonly CANNOT_SELF_CLOSE = [
    "w:t",
    "w:r",
    "w:p",
    "w:tbl",
    "w:tr",
    "w:tc",
    "w:body",
    "w:document",
    "w:hyperlink",
    "w:sdt",
    "w:sdtContent",
    "w:sdtPr",
    "w:pPr",
    "w:rPr",
    "w:sectPr",
    "w:del", // Deletion revisions - container element, must have closing tag
    "w:ins", // Insertion revisions - container element, must have closing tag
    "w:moveFrom", // Move source markers - container element
    "w:moveTo", // Move destination markers - container element
    // Note: w:bookmarkStart and w:bookmarkEnd MUST be self-closing per ECMA-376
  ];

  /**
   * Adds an element to the builder
   * @param name - Element name (with namespace prefix if needed)
   * @param attributes - Element attributes
   * @param children - Child elements or text
   * @returns This builder for chaining
   */
  element(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLBuilder {
    this.elements.push({
      name,
      attributes,
      children,
    });
    return this;
  }

  /**
   * Adds a self-closing element
   * @param name - Element name
   * @param attributes - Element attributes
   * @returns This builder for chaining
   * @throws {Error} If attempting to create self-closing w:t element (not allowed per ECMA-376)
   */
  selfClosingElement(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLBuilder {
    // Validation: Text elements (<w:t>) cannot be self-closing per ECMA-376
    // Self-closing <w:t/> elements cause Word to fail opening the document
    if (name === 'w:t' || name === 't') {
      throw new Error(
        'Text elements (<w:t>) cannot be self-closing per ECMA-376. ' +
        'Use element() with empty text content instead: XMLBuilder.w("t", attrs, [""])'
      );
    }

    this.elements.push({
      name,
      attributes,
      selfClosing: true,
    });
    return this;
  }

  /**
   * Adds text content
   * @param text - Text to add
   * @returns This builder for chaining
   */
  text(text: string): XMLBuilder {
    this.elements.push(text);
    return this;
  }

  /**
   * Builds the XML string
   * @param includeDeclaration - Whether to include XML declaration
   * @returns Generated XML string
   */
  build(includeDeclaration = false): string {
    let xml = "";

    if (includeDeclaration) {
      xml += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    }

    xml += this.elementsToString(this.elements);
    return xml;
  }

  /**
   * Converts elements to XML string
   */
  private elementsToString(elements: (XMLElement | string)[]): string {
    let xml = "";

    for (const element of elements) {
      if (typeof element === "string") {
        xml += this.escapeXml(element);
      } else {
        xml += this.elementToString(element);
      }
    }

    return xml;
  }

  /**
   * Converts a single element to XML string
   */
  private elementToString(element: XMLElement): string {
    // Special case: raw XML passthrough (no wrapper element)
    // Used for VML and other legacy content that must be preserved exactly
    if (element.name === "__rawXml" && element.rawXml) {
      return element.rawXml;
    }

    let xml = `<${element.name}`;

    // Add attributes
    if (element.attributes) {
      for (const [key, value] of Object.entries(element.attributes)) {
        if (value !== undefined && value !== null && value !== false) {
          // Handle boolean attributes
          const attrValue = value === true ? key : String(value);
          // Use escapeXmlAttribute for attribute values (Issue #8)
          xml += ` ${key}="${XMLBuilder.escapeXmlAttribute(attrValue)}"`;
        }
      }
    }

    // Self-closing element validation
    if (element.selfClosing) {
      if (XMLBuilder.CANNOT_SELF_CLOSE.includes(element.name)) {
        // Instead of throwing, force open/close tags for safety
        xml += "></" + element.name + ">";
        return xml;
      }
      xml += "/>";
      return xml;
    }

    xml += ">";

    // Add raw XML content if present (for VML passthrough)
    if (element.rawXml) {
      xml += element.rawXml;
    }

    // Add children
    if (element.children && element.children.length > 0) {
      xml += this.elementsToString(element.children);
    }

    xml += `</${element.name}>`;
    return xml;
  }

  /**
   * Escapes special XML characters for text content
   * (Issue #8 fix: Use escapeXmlText for element text, escapeXmlAttribute called directly for attrs)
   */
  private escapeXml(text: string): string {
    // This method is now only used for text content in elementsToString()
    // Attributes call escapeXmlAttribute() directly in elementToString()
    // Text content should NOT escape quotes (only & < >)
    return XMLBuilder.escapeXmlText(text);
  }

  /**
   * Escapes XML text content (element text nodes)
   * Removes invalid XML 1.0 control characters and escapes: & < >
   *
   * Per XML 1.0 spec, control chars 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F are invalid.
   * Tab (0x09), newline (0x0A), and CR (0x0D) are preserved.
   *
   * @param text Text to escape
   * @returns Escaped text safe for XML content
   */
  static escapeXmlText(text: string): string {
    return removeInvalidXmlChars(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /**
   * Escapes XML attribute values
   * Removes invalid XML 1.0 control characters and escapes: & < > " '
   *
   * Per XML 1.0 spec, control chars 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F are invalid.
   * Tab (0x09), newline (0x0A), and CR (0x0D) are preserved.
   *
   * @param value Attribute value to escape
   * @returns Escaped value safe for XML attributes
   */
  static escapeXmlAttribute(value: string): string {
    return removeInvalidXmlChars(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Unescapes XML entities back to original characters
   * @param text Text with XML entities
   * @returns Unescaped text
   */
  static unescapeXml(text: string): string {
    return text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&"); // Must be last to avoid double-unescaping
  }

  /**
   * Sanitizes and escapes XML content for safe inclusion in XML documents
   * Removes control characters, null bytes, and escapes special XML characters
   * Use this for user-provided content that may contain unsafe characters
   *
   * Per XML 1.0 spec, control chars 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F are invalid.
   * Tab (0x09), newline (0x0A), and CR (0x0D) are preserved.
   *
   * @param text Text to sanitize and escape
   * @returns Sanitized text safe for XML content
   *
   * **Issue #11 fix:** Prevents malformed XML from CDATA markers, control chars, etc.
   */
  static sanitizeXmlContent(text: string): string {
    return (
      removeInvalidXmlChars(text)
        // Escape CDATA end marker to prevent CDATA injection
        .replace(/\]\]>/g, "]]&gt;")
        // Standard XML escaping (& must be first to avoid double-escaping)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    );
  }

  /**
   * Creates a WordprocessingML namespace attribute object
   */
  static createNamespaces(): Record<string, string> {
    return {
      "xmlns:w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      "xmlns:r":
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "xmlns:wp":
        "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
      "xmlns:a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "xmlns:pic": "http://schemas.openxmlformats.org/drawingml/2006/picture",
      "xmlns:w14": "http://schemas.microsoft.com/office/word/2010/wordml",
      "xmlns:wpc":
        "http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas",
      "xmlns:mc": "http://schemas.openxmlformats.org/markup-compatibility/2006",
      "xmlns:o": "urn:schemas-microsoft-com:office:office",
      "xmlns:v": "urn:schemas-microsoft-com:vml",
      "xmlns:wp14":
        "http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing",
      "xmlns:w10": "urn:schemas-microsoft-com:office:word",
      "xmlns:w15": "http://schemas.microsoft.com/office/word/2012/wordml",
      "xmlns:wpg":
        "http://schemas.microsoft.com/office/word/2010/wordprocessingGroup",
      "xmlns:wpi":
        "http://schemas.microsoft.com/office/word/2010/wordprocessingInk",
      "xmlns:wne": "http://schemas.microsoft.com/office/word/2006/wordml",
      "xmlns:wps":
        "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",
    };
  }

  /**
   * Converts a single XMLElement to its XML string representation
   * Useful for merging elements into existing XML
   *
   * @param element - The XMLElement to convert
   * @returns XML string representation of the element
   */
  static elementToString(element: XMLElement): string {
    const builder = new XMLBuilder();
    // Use the private elementToString via the elements array + build
    (builder as any).elements.push(element);
    return builder.build();
  }

  /**
   * Helper method to create a WordprocessingML element
   * @param name - Element name (without 'w:' prefix)
   * @param attributes - Element attributes
   * @param children - Child elements
   * @returns XMLElement
   */
  static w(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLElement {
    return {
      name: `w:${name}`,
      attributes,
      children,
    };
  }

  /**
   * Helper method to create a self-closing WordprocessingML element
   * @param name - Element name (without 'w:' prefix)
   * @param attributes - Element attributes
   * @returns XMLElement
   */
  static wSelf(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLElement {
    return {
      name: `w:${name}`,
      attributes,
      selfClosing: true,
    };
  }

  /**
   * Helper method to create a w14 element (Word 2010+ features)
   * @param name - Element name (without 'w14:' prefix)
   * @param attributes - Element attributes
   * @param children - Child elements
   * @returns XMLElement
   */
  static w14(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLElement {
    return {
      name: `w14:${name}`,
      attributes,
      children,
    };
  }

  /**
   * Helper method to create a self-closing w14 element
   * @param name - Element name (without 'w14:' prefix)
   * @param attributes - Element attributes
   * @returns XMLElement
   */
  static w14Self(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLElement {
    return {
      name: `w14:${name}`,
      attributes,
      selfClosing: true,
    };
  }

  /**
   * Helper method to create a DrawingML element (a: namespace)
   * @param name - Element name (without 'a:' prefix)
   * @param attributes - Element attributes
   * @param children - Child elements
   * @returns XMLElement
   */
  static a(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLElement {
    return {
      name: `a:${name}`,
      attributes,
      children,
    };
  }

  /**
   * Helper method to create a self-closing DrawingML element
   * @param name - Element name (without 'a:' prefix)
   * @param attributes - Element attributes
   * @returns XMLElement
   */
  static aSelf(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLElement {
    return {
      name: `a:${name}`,
      attributes,
      selfClosing: true,
    };
  }

  /**
   * Helper method to create a Picture element (pic: namespace)
   * @param name - Element name (without 'pic:' prefix)
   * @param attributes - Element attributes
   * @param children - Child elements
   * @returns XMLElement
   */
  static pic(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLElement {
    return {
      name: `pic:${name}`,
      attributes,
      children,
    };
  }

  /**
   * Helper method to create a self-closing Picture element
   * @param name - Element name (without 'pic:' prefix)
   * @param attributes - Element attributes
   * @returns XMLElement
   */
  static picSelf(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLElement {
    return {
      name: `pic:${name}`,
      attributes,
      selfClosing: true,
    };
  }

  /**
   * Helper method to create a Wordprocessing Drawing element (wp: namespace)
   * @param name - Element name (without 'wp:' prefix)
   * @param attributes - Element attributes
   * @param children - Child elements
   * @returns XMLElement
   */
  static wp(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>,
    children?: (XMLElement | string)[]
  ): XMLElement {
    return {
      name: `wp:${name}`,
      attributes,
      children,
    };
  }

  /**
   * Helper method to create a self-closing Wordprocessing Drawing element
   * @param name - Element name (without 'wp:' prefix)
   * @param attributes - Element attributes
   * @returns XMLElement
   */
  static wpSelf(
    name: string,
    attributes?: Record<string, string | number | boolean | undefined>
  ): XMLElement {
    return {
      name: `wp:${name}`,
      attributes,
      selfClosing: true,
    };
  }

  /**
   * Helper to create cx/cy extent attributes (for a:ext, wp:extent, etc.)
   * @param name - Element name (e.g., 'ext')
   * @param cx - Width in EMUs
   * @param cy - Height in EMUs
   * @returns Self-closing XMLElement
   */
  static cxCy(
    name: string,
    cx: number,
    cy: number
  ): XMLElement {
    return {
      name,
      attributes: { cx, cy },
      selfClosing: true
    };
  }

  /**
   * Creates an SDT (Structured Document Tag) wrapper for content
   * @param content - Content to wrap (paragraphs, tables, etc.)
   * @param options - SDT options
   * @returns XMLElement representing the SDT wrapper
   */
  static createSDT(
    content: XMLElement[],
    options?: {
      id?: number;
      docPartGallery?: string;
      docPartUnique?: boolean;
    }
  ): XMLElement {
    const sdtId = options?.id ?? Math.floor(Math.random() * 2000000000) - 1000000000;

    // Build SDT properties
    const sdtPrChildren: XMLElement[] = [
      XMLBuilder.wSelf('id', { 'w:val': sdtId })
    ];

    // Add docPartObj if docPartGallery is specified
    if (options?.docPartGallery) {
      sdtPrChildren.push(
        XMLBuilder.w('docPartObj', undefined, [
          XMLBuilder.wSelf('docPartGallery', { 'w:val': options.docPartGallery }),
          XMLBuilder.wSelf('docPartUnique', {
            'w:val': options?.docPartUnique !== false ? '1' : '0'
          })
        ])
      );
    }

    // Create complete SDT structure
    return XMLBuilder.w('sdt', undefined, [
      XMLBuilder.w('sdtPr', undefined, sdtPrChildren),
      XMLBuilder.w('sdtContent', undefined, content)
    ]);
  }

  /**
   * Creates a complete WordprocessingML document structure
   * @param bodyContent - Content for the document body
   * @returns XML string for word/document.xml
   */
  static createDocument(
    bodyContent: XMLElement[],
    namespaces: Record<string, string> = {}
  ): string {
    const builder = new XMLBuilder();

    const allNamespaces = { ...XMLBuilder.createNamespaces(), ...namespaces };

    builder.element("w:document", allNamespaces, [
      XMLBuilder.w("body", undefined, bodyContent),
    ]);

    return builder.build(true);
  }

  /**
   * Builds an XML string from a JavaScript object.
   * This is the reverse of XMLParser.parseToObject
   */
  static buildObject(obj: any, rootName: string): string {
    const builder = new XMLBuilder();
    const element = XMLBuilder.objectToElement(obj, rootName);
    if (element) {
      if (typeof element === "string") {
        builder.text(element);
      } else {
        builder.elements.push(element);
      }
    }
    return builder.build();
  }

  /**
   * Converts a JavaScript object to an XMLElement.
   * @private
   */
  private static objectToElement(
    obj: any,
    name: string
  ): XMLElement | string | null {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (typeof obj !== "object" || obj === null) {
      return String(obj);
    }

    const attributes: Record<string, any> = {};
    const children: (XMLElement | string)[] = [];

    if (obj["#text"] && Object.keys(obj).length === 1) {
      return String(obj["#text"]);
    }

    for (const key in obj) {
      if (key.startsWith("@_")) {
        const attrName = key.substring(2);
        // Validate attribute name is not empty after prefix removal
        if (attrName.length > 0) {
          attributes[attrName] = obj[key];
        }
      } else if (key === "#text") {
        children.push(String(obj[key]));
      } else {
        const childObj = obj[key];
        if (Array.isArray(childObj)) {
          childObj.forEach((item) => {
            const childElement = XMLBuilder.objectToElement(item, key);
            if (childElement) {
              children.push(childElement);
            }
          });
        } else {
          const childElement = XMLBuilder.objectToElement(childObj, key);
          if (childElement) {
            children.push(childElement);
          }
        }
      }
    }

    const element: XMLElement = {
      name,
      attributes,
      children: children.length > 0 ? children : undefined,
    };

    if (!element.children || element.children.length === 0) {
      if (!XMLBuilder.CANNOT_SELF_CLOSE.includes(name)) {
        element.selfClosing = true;
      }
    }

    return element;
  }

  /**
   * Helper method to build attributes object, filtering out undefined/null values
   * This simplifies the common pattern of conditionally adding attributes
   *
   * @param mapping - Map of attribute names to values
   * @returns Filtered attributes object with only defined values
   *
   * @example
   * ```typescript
   * const attrs = XMLBuilder.buildAttributes({
   *   'w:before': spacing?.before,
   *   'w:after': spacing?.after,
   *   'w:line': spacing?.line
   * });
   * // Returns only attributes with defined values
   * ```
   */
  static buildAttributes(mapping: Record<string, any>): Record<string, string | number> {
    const attrs: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(mapping)) {
      if (value !== undefined && value !== null) {
        attrs[key] = value;
      }
    }
    return attrs;
  }

  /**
   * Creates a border element for WordprocessingML
   * Used for table borders, cell borders, and paragraph borders
   *
   * @param side - Border side (e.g., 'top', 'left', 'bottom', 'right', 'insideH', 'insideV')
   * @param border - Border definition
   * @returns XML element for border
   *
   * @example
   * ```typescript
   * const border = XMLBuilder.createBorder('top', {
   *   style: 'single',
   *   size: 4,
   *   color: 'FF0000',
   *   space: 0
   * });
   * ```
   */
  static createBorder(
    side: string,
    border: {
      style?: string;
      size?: number;
      color?: string;
      space?: number;
    }
  ): XMLElement {
    const attrs = XMLBuilder.buildAttributes({
      'w:val': border.style || 'single',
      'w:sz': border.size,
      'w:color': border.color,
      'w:space': border.space
    });

    return XMLBuilder.wSelf(side, attrs);
  }

  /**
   * Creates a shading element for WordprocessingML
   * Used for paragraph shading, table shading, and cell shading
   *
   * @param shading - Shading definition
   * @returns XML element for shading, or null if no shading properties
   *
   * @example
   * ```typescript
   * const shading = XMLBuilder.createShading({
   *   fill: 'FFFF00',
   *   val: 'clear',
   *   color: '000000'
   * });
   * ```
   */
  static createShading(shading: {
    fill?: string;
    val?: string;
    color?: string;
  }): XMLElement | null {
    const attrs = XMLBuilder.buildAttributes({
      'w:val': shading.val || 'clear',
      'w:fill': shading.fill,
      'w:color': shading.color
    });

    if (Object.keys(attrs).length > 0) {
      return XMLBuilder.wSelf('shd', attrs);
    }
    return null;
  }

  /**
   * Creates a margins element (tcMar, pgMar, etc.)
   * Used for cell margins, page margins, etc.
   *
   * @param type - Margin type element name (e.g., 'tcMar', 'pgMar')
   * @param margins - Margin values in twips
   * @returns XML element for margins, or null if no margins defined
   *
   * @example
   * ```typescript
   * const margins = XMLBuilder.createMargins('tcMar', {
   *   top: 100,
   *   bottom: 100,
   *   left: 100,
   *   right: 100
   * });
   * ```
   */
  static createMargins(
    type: string,
    margins: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
      start?: number;
      end?: number;
    }
  ): XMLElement | null {
    const children: XMLElement[] = [];

    if (margins.top !== undefined) {
      children.push(XMLBuilder.wSelf('top', { 'w:w': margins.top, 'w:type': 'dxa' }));
    }
    if (margins.bottom !== undefined) {
      children.push(XMLBuilder.wSelf('bottom', { 'w:w': margins.bottom, 'w:type': 'dxa' }));
    }
    if (margins.left !== undefined) {
      children.push(XMLBuilder.wSelf('left', { 'w:w': margins.left, 'w:type': 'dxa' }));
    }
    if (margins.right !== undefined) {
      children.push(XMLBuilder.wSelf('right', { 'w:w': margins.right, 'w:type': 'dxa' }));
    }
    if (margins.start !== undefined) {
      children.push(XMLBuilder.wSelf('start', { 'w:w': margins.start, 'w:type': 'dxa' }));
    }
    if (margins.end !== undefined) {
      children.push(XMLBuilder.wSelf('end', { 'w:w': margins.end, 'w:type': 'dxa' }));
    }

    if (children.length > 0) {
      return XMLBuilder.w(type, undefined, children);
    }
    return null;
  }
}
