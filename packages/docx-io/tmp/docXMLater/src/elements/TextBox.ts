/**
 * TextBox - Represents a floating text box in a Word document
 *
 * Text boxes use DrawingML (a:) and WordprocessingML Drawing (wp:) namespaces,
 * plus WordprocessingShape (wps:) namespace for Word 2010+ features.
 *
 * Per ECMA-376 Part 4 (Transitional) and Office Open XML extensions,
 * text boxes in Word documents use the wps:wsp element with wps:txbx content.
 */

import { XMLBuilder, XMLElement } from '../xml/XMLBuilder';
import { Paragraph } from './Paragraph';
import {
  ImagePosition,
  ImageAnchor,
  PositionAnchor,
  HorizontalAlignment,
  VerticalAlignment
} from './Image';
import { BorderDefinition } from './Paragraph';

/**
 * TextBox margins configuration
 */
export interface TextBoxMargins {
  /** Top margin in EMUs */
  top: number;
  /** Bottom margin in EMUs */
  bottom: number;
  /** Left margin in EMUs */
  left: number;
  /** Right margin in EMUs */
  right: number;
}

/**
 * TextBox fill configuration
 */
export interface TextBoxFill {
  /** Fill color in hex (e.g., 'F0F0F0') */
  color: string;
  /** Transparency percentage (0-100) */
  transparency?: number;
}

/**
 * TextBox properties
 */
export interface TextBoxProperties {
  /** Width in EMUs */
  width: number;
  /** Height in EMUs */
  height: number;
  /** Paragraphs within the text box */
  paragraphs?: Paragraph[];
  /** Position configuration */
  position?: ImagePosition;
  /** Anchor configuration */
  anchor?: ImageAnchor;
  /** Fill color and transparency */
  fill?: TextBoxFill;
  /** Border configuration */
  borders?: BorderDefinition;
  /** Internal margins */
  margins?: TextBoxMargins;
  /** TextBox name */
  name?: string;
  /** TextBox description (for accessibility) */
  description?: string;
}

/**
 * Represents a floating text box
 */
export class TextBox {
  private width: number;
  private height: number;
  private paragraphs: Paragraph[] = [];
  private position?: ImagePosition;
  private anchor?: ImageAnchor;
  private fill?: TextBoxFill;
  private borders?: BorderDefinition;
  private margins?: TextBoxMargins;
  private name: string;
  private description: string;
  private docPrId: number = 1;

  /**
   * Creates a new text box
   * @param properties TextBox properties
   * @private Use static factory methods instead (create)
   */
  private constructor(properties: TextBoxProperties) {
    this.width = properties.width;
    this.height = properties.height;
    if (properties.paragraphs) {
      this.paragraphs = properties.paragraphs;
    }
    this.position = properties.position;
    this.anchor = properties.anchor;
    this.fill = properties.fill;
    this.borders = properties.borders;
    this.margins = properties.margins;
    this.name = properties.name || 'TextBox';
    this.description = properties.description || '';
  }

  /**
   * Factory method for creating a text box
   * @param width Width in EMUs
   * @param height Height in EMUs
   * @returns New TextBox instance
   * @example
   * const textbox = TextBox.create(inchesToEmus(3), inchesToEmus(2));
   */
  static create(width: number, height: number): TextBox {
    return new TextBox({ width, height });
  }

  /**
   * Gets the width in EMUs
   * @returns Width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Gets the height in EMUs
   * @returns Height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Adds a paragraph to the text box
   * @param paragraph Paragraph to add
   * @returns This text box for chaining
   */
  addParagraph(paragraph: Paragraph): this {
    this.paragraphs.push(paragraph);
    return this;
  }

  /**
   * Gets all paragraphs
   * @returns Array of paragraphs
   */
  getParagraphs(): Paragraph[] {
    return this.paragraphs;
  }

  /**
   * Sets text box position (for floating text boxes)
   * @param horizontal Horizontal positioning configuration
   * @param vertical Vertical positioning configuration
   * @returns This text box for chaining
   */
  setPosition(
    horizontal: { anchor: PositionAnchor; offset?: number; alignment?: HorizontalAlignment },
    vertical: { anchor: PositionAnchor; offset?: number; alignment?: VerticalAlignment }
  ): this {
    this.position = { horizontal, vertical };
    return this;
  }

  /**
   * Gets the position configuration
   * @returns Position or undefined
   */
  getPosition(): ImagePosition | undefined {
    return this.position;
  }

  /**
   * Sets anchor configuration
   * @param options Anchor configuration
   * @returns This text box for chaining
   */
  setAnchor(options: ImageAnchor): this {
    this.anchor = options;
    return this;
  }

  /**
   * Gets the anchor configuration
   * @returns Anchor configuration or undefined
   */
  getAnchor(): ImageAnchor | undefined {
    return this.anchor;
  }

  /**
   * Sets the fill color
   * @param color Fill color in hex
   * @param transparency Optional transparency percentage (0-100)
   * @returns This text box for chaining
   */
  setFill(color: string, transparency?: number): this {
    this.fill = { color, transparency };
    return this;
  }

  /**
   * Gets the fill configuration
   * @returns Fill or undefined
   */
  getFill(): TextBoxFill | undefined {
    return this.fill;
  }

  /**
   * Sets the borders
   * @param borders Border configuration
   * @returns This text box for chaining
   */
  setBorders(borders: BorderDefinition): this {
    this.borders = borders;
    return this;
  }

  /**
   * Gets the borders configuration
   * @returns Borders or undefined
   */
  getBorders(): BorderDefinition | undefined {
    return this.borders;
  }

  /**
   * Sets internal margins
   * @param margins Margin configuration
   * @returns This text box for chaining
   */
  setMargins(margins: TextBoxMargins): this {
    this.margins = margins;
    return this;
  }

  /**
   * Gets the margins configuration
   * @returns Margins or undefined
   */
  getMargins(): TextBoxMargins | undefined {
    return this.margins;
  }

  /**
   * Sets the text box name
   * @param name TextBox name
   * @returns This text box for chaining
   */
  setName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Gets the text box name
   * @returns TextBox name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Sets the text box description (for accessibility)
   * @param description TextBox description
   * @returns This text box for chaining
   */
  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Gets the text box description
   * @returns TextBox description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Sets the docPr ID (drawing object ID)
   * @param id Document property ID
   * @returns This text box for chaining
   */
  setDocPrId(id: number): this {
    this.docPrId = id;
    return this;
  }

  /**
   * Checks if this text box is floating (has anchor or position configuration)
   * @returns True if floating, false if inline
   */
  isFloating(): boolean {
    return this.anchor !== undefined || this.position !== undefined;
  }

  /**
   * Generates DrawingML XML for the text box
   * Creates either inline or floating (anchor) text box based on configuration
   * @returns XML element representing the text box
   */
  toXML(): XMLElement {
    // Text boxes are typically floating, but support inline as well
    const textboxElement = this.isFloating() ? this.createAnchor() : this.createInline();

    // Create the drawing structure
    return XMLBuilder.w('drawing', undefined, [textboxElement]);
  }

  /**
   * Creates the wp:inline element for inline text boxes
   * @private
   */
  private createInline(): XMLElement {
    const children: XMLElement[] = [];

    // Extent (size)
    children.push({
      name: 'wp:extent',
      attributes: {
        cx: this.width.toString(),
        cy: this.height.toString(),
      },
      selfClosing: true,
    });

    // Effect extent
    children.push({
      name: 'wp:effectExtent',
      attributes: {
        l: '0',
        t: '0',
        r: '0',
        b: '0',
      },
      selfClosing: true,
    });

    // Document properties
    children.push({
      name: 'wp:docPr',
      attributes: {
        id: this.docPrId.toString(),
        name: this.name,
        descr: this.description,
      },
      selfClosing: true,
    });

    // Non-visual graphic frame properties
    children.push({
      name: 'wp:cNvGraphicFramePr',
      selfClosing: true,
    });

    // Graphic data (the text box)
    children.push(this.createGraphic());

    return {
      name: 'wp:inline',
      attributes: {
        distT: '0',
        distB: '0',
        distL: '0',
        distR: '0',
      },
      children,
    };
  }

  /**
   * Creates the wp:anchor element for floating text boxes
   * @private
   */
  private createAnchor(): XMLElement {
    const children: XMLElement[] = [];

    const anchorConfig = this.anchor || {
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: false,
      relativeHeight: 251658240,
    };

    // Position H (horizontal)
    if (this.position) {
      const posH = this.position.horizontal;
      const posHChildren: XMLElement[] = [];

      if (posH.offset !== undefined) {
        posHChildren.push({
          name: 'wp:posOffset',
          children: [posH.offset.toString()],
        });
      } else if (posH.alignment) {
        posHChildren.push({
          name: 'wp:align',
          children: [posH.alignment],
        });
      }

      children.push({
        name: 'wp:positionH',
        attributes: {
          relativeFrom: posH.anchor,
        },
        children: posHChildren,
      });
    }

    // Position V (vertical)
    if (this.position) {
      const posV = this.position.vertical;
      const posVChildren: XMLElement[] = [];

      if (posV.offset !== undefined) {
        posVChildren.push({
          name: 'wp:posOffset',
          children: [posV.offset.toString()],
        });
      } else if (posV.alignment) {
        posVChildren.push({
          name: 'wp:align',
          children: [posV.alignment],
        });
      }

      children.push({
        name: 'wp:positionV',
        attributes: {
          relativeFrom: posV.anchor,
        },
        children: posVChildren,
      });
    }

    // Extent (size)
    children.push({
      name: 'wp:extent',
      attributes: {
        cx: this.width.toString(),
        cy: this.height.toString(),
      },
      selfClosing: true,
    });

    // Effect extent
    children.push({
      name: 'wp:effectExtent',
      attributes: {
        l: '0',
        t: '0',
        r: '0',
        b: '0',
      },
      selfClosing: true,
    });

    // Wrap square (default for text boxes)
    children.push({
      name: 'wp:wrapSquare',
      attributes: {
        wrapText: 'bothSides',
      },
      selfClosing: true,
    });

    // Document properties
    children.push({
      name: 'wp:docPr',
      attributes: {
        id: this.docPrId.toString(),
        name: this.name,
        descr: this.description,
      },
      selfClosing: true,
    });

    // Non-visual graphic frame properties
    children.push({
      name: 'wp:cNvGraphicFramePr',
      selfClosing: true,
    });

    // Graphic data (the text box)
    children.push(this.createGraphic());

    return {
      name: 'wp:anchor',
      attributes: {
        distT: '0',
        distB: '0',
        distL: '0',
        distR: '0',
        simplePos: '0',
        relativeHeight: anchorConfig.relativeHeight.toString(),
        behindDoc: anchorConfig.behindDoc ? '1' : '0',
        locked: anchorConfig.locked ? '1' : '0',
        layoutInCell: anchorConfig.layoutInCell ? '1' : '0',
        allowOverlap: anchorConfig.allowOverlap ? '1' : '0',
      },
      children,
    };
  }

  /**
   * Creates the a:graphic element containing the text box
   * @private
   */
  private createGraphic(): XMLElement {
    return {
      name: 'a:graphic',
      attributes: {
        'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
      },
      children: [
        {
          name: 'a:graphicData',
          attributes: {
            uri: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
          },
          children: [this.createWps()],
        },
      ],
    };
  }

  /**
   * Creates the wps:wsp element (WordprocessingShape for text box)
   * @private
   */
  private createWps(): XMLElement {
    const children: XMLElement[] = [];

    // Non-visual shape properties
    children.push({
      name: 'wps:cNvSpPr',
      attributes: {
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        txBox: '1', // Indicates this is a text box
      },
      selfClosing: true,
    });

    // Shape properties (size, fill, borders)
    children.push(this.createSpPr());

    // Text box content
    children.push(this.createTextBoxContent());

    return {
      name: 'wps:wsp',
      attributes: {
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
      },
      children,
    };
  }

  /**
   * Creates the wps:spPr element (shape properties for text box)
   * @private
   */
  private createSpPr(): XMLElement {
    const children: XMLElement[] = [];

    // Transform (position and size)
    children.push({
      name: 'a:xfrm',
      children: [
        {
          name: 'a:off',
          attributes: { x: '0', y: '0' },
          selfClosing: true,
        },
        {
          name: 'a:ext',
          attributes: {
            cx: this.width.toString(),
            cy: this.height.toString(),
          },
          selfClosing: true,
        },
      ],
    });

    // Preset geometry (rectangle for text box)
    children.push({
      name: 'a:prstGeom',
      attributes: {
        prst: 'rect',
      },
      children: [
        {
          name: 'a:avLst',
          selfClosing: true,
        },
      ],
    });

    // Fill
    if (this.fill) {
      const fillChildren: XMLElement[] = [];

      // Transparency
      if (this.fill.transparency !== undefined) {
        const alpha = 100 - this.fill.transparency;
        fillChildren.push({
          name: 'a:alpha',
          attributes: {
            val: Math.round(alpha * 1000).toString(),
          },
          selfClosing: true,
        });
      }

      children.push({
        name: 'a:solidFill',
        children: [
          {
            name: 'a:srgbClr',
            attributes: {
              val: this.fill.color.toUpperCase(),
            },
            ...(fillChildren.length > 0 ? { children: fillChildren } : { selfClosing: true }),
          },
        ],
      });
    } else {
      // No fill (transparent background)
      children.push({
        name: 'a:noFill',
        selfClosing: true,
      });
    }

    // Borders
    if (this.borders && this.borders.size !== undefined) {
      const lnAttrs: Record<string, string> = {
        w: (this.borders.size * 12700).toString(), // Convert points to EMUs
      };

      const lnChildren: XMLElement[] = [];

      // Border color
      lnChildren.push({
        name: 'a:solidFill',
        children: [
          {
            name: 'a:srgbClr',
            attributes: {
              val: (this.borders.color || '000000').toUpperCase(),
            },
            selfClosing: true,
          },
        ],
      });

      // Border style
      if (this.borders.style && this.borders.style !== 'single') {
        const dashMap: Record<string, string> = {
          dash: 'dash',
          dot: 'dot',
          dashDot: 'dashDot',
          dashDotDot: 'lgDashDotDot',
        };
        const dashStyle = dashMap[this.borders.style] || 'solid';
        if (dashStyle !== 'solid') {
          lnChildren.push({
            name: 'a:prstDash',
            attributes: {
              val: dashStyle,
            },
            selfClosing: true,
          });
        }
      }

      children.push({
        name: 'a:ln',
        attributes: lnAttrs,
        children: lnChildren,
      });
    }

    return {
      name: 'wps:spPr',
      children,
    };
  }

  /**
   * Creates the wps:txbx element (text box content)
   * @private
   */
  private createTextBoxContent(): XMLElement {
    if (this.paragraphs.length === 0) {
      // Empty text box - create empty paragraph
      return {
        name: 'wps:txbx',
        children: [
          {
            name: 'w:txbxContent',
            children: [
              XMLBuilder.w('p', undefined, [
                XMLBuilder.w('r', undefined, [
                  XMLBuilder.w('t', undefined, [''])
                ])
              ])
            ],
          },
        ],
      };
    }

    // Convert paragraphs to XML
    const paragraphXml = this.paragraphs.map(p => p.toXML());

    return {
      name: 'wps:txbx',
      children: [
        {
          name: 'w:txbxContent',
          children: paragraphXml,
        },
      ],
    };
  }
}
