/**
 * Shape - Represents a drawing shape in a Word document
 *
 * Shapes use DrawingML (a:) and WordprocessingML Drawing (wp:) namespaces,
 * plus WordprocessingShape (wps:) namespace for Word 2010+ shape features.
 *
 * Per ECMA-376 Part 4 (Transitional) and Office Open XML extensions,
 * shapes in Word documents use the wps:wsp element structure.
 */

import { XMLBuilder, XMLElement } from '../xml/XMLBuilder';
import { inchesToEmus } from '../utils/units';
import { RunFormatting } from './Run';
import {
  ImagePosition,
  ImageAnchor,
  PositionAnchor,
  HorizontalAlignment,
  VerticalAlignment
} from './Image';

/**
 * Preset shape types available in DrawingML
 * Based on ECMA-376 Part 1 §20.1.10.56 ST_ShapeType
 */
export type ShapeType =
  | 'rect'              // Rectangle
  | 'ellipse'           // Circle/Ellipse
  | 'rightArrow'        // Right arrow
  | 'leftArrow'         // Left arrow
  | 'upArrow'           // Up arrow
  | 'downArrow'         // Down arrow
  | 'straightConnector1' // Straight line
  | 'roundRect'         // Rounded rectangle
  | 'triangle'          // Triangle
  | 'diamond';          // Diamond

/**
 * Shape fill configuration
 */
export interface ShapeFill {
  /** Fill color in hex (e.g., 'FF0000' for red) */
  color: string;
  /** Transparency percentage (0-100, where 100 is fully transparent) */
  transparency?: number;
}

/**
 * Shape outline/border configuration
 */
export interface ShapeOutline {
  /** Outline color in hex */
  color: string;
  /** Outline width in EMUs */
  width: number;
  /** Line style ('solid', 'dash', 'dot', etc.) */
  style?: 'solid' | 'dash' | 'dot' | 'dashDot';
}

/**
 * Shape properties
 */
export interface ShapeProperties {
  /** Shape type (preset geometry) */
  shapeType: ShapeType;
  /** Width in EMUs */
  width: number;
  /** Height in EMUs */
  height: number;
  /** Fill color and transparency */
  fill?: ShapeFill;
  /** Outline/border properties */
  outline?: ShapeOutline;
  /** Position configuration (reuses Image position types) */
  position?: ImagePosition;
  /** Anchor configuration (reuses Image anchor types) */
  anchor?: ImageAnchor;
  /** Rotation angle in degrees (0-360) */
  rotation?: number;
  /** Text content within the shape */
  text?: string;
  /** Text formatting */
  textFormatting?: RunFormatting;
  /** Shape name/title */
  name?: string;
  /** Shape description (for accessibility) */
  description?: string;
}

/**
 * Represents a drawing shape
 */
export class Shape {
  private shapeType: ShapeType;
  private width: number;
  private height: number;
  private fill?: ShapeFill;
  private outline?: ShapeOutline;
  private position?: ImagePosition;
  private anchor?: ImageAnchor;
  private rotation: number = 0;
  private text?: string;
  private textFormatting?: RunFormatting;
  private name: string;
  private description: string;
  private docPrId: number = 1;

  /**
   * Creates a new shape
   * @param properties Shape properties
   * @private Use static factory methods instead (create, createRectangle, etc.)
   */
  private constructor(properties: ShapeProperties) {
    this.shapeType = properties.shapeType;
    this.width = properties.width;
    this.height = properties.height;
    this.fill = properties.fill;
    this.outline = properties.outline;
    this.position = properties.position;
    this.anchor = properties.anchor;
    this.rotation = properties.rotation || 0;
    this.text = properties.text;
    this.textFormatting = properties.textFormatting;
    this.name = properties.name || 'Shape';
    this.description = properties.description || '';
  }

  /**
   * Factory method for creating a shape
   * @param shapeType Shape type
   * @param width Width in EMUs (or use inchesToEmus)
   * @param height Height in EMUs (or use inchesToEmus)
   * @returns New Shape instance
   * @example
   * const rect = Shape.create('rect', inchesToEmus(2), inchesToEmus(1));
   */
  static create(shapeType: ShapeType, width: number, height: number): Shape {
    return new Shape({ shapeType, width, height });
  }

  /**
   * Creates a rectangle shape
   * @param width Width in EMUs
   * @param height Height in EMUs
   * @returns New Shape instance
   */
  static createRectangle(width: number, height: number): Shape {
    return Shape.create('rect', width, height);
  }

  /**
   * Creates a circle shape
   * @param diameter Diameter in EMUs
   * @returns New Shape instance
   */
  static createCircle(diameter: number): Shape {
    return Shape.create('ellipse', diameter, diameter);
  }

  /**
   * Creates an ellipse shape
   * @param width Width in EMUs
   * @param height Height in EMUs
   * @returns New Shape instance
   */
  static createEllipse(width: number, height: number): Shape {
    return Shape.create('ellipse', width, height);
  }

  /**
   * Creates an arrow shape
   * @param direction Arrow direction
   * @param width Width in EMUs
   * @param height Height in EMUs
   * @returns New Shape instance
   */
  static createArrow(
    direction: 'right' | 'left' | 'up' | 'down',
    width: number,
    height: number
  ): Shape {
    const shapeType = `${direction}Arrow` as ShapeType;
    return Shape.create(shapeType, width, height);
  }

  /**
   * Creates a line shape
   * @param width Line width in EMUs
   * @returns New Shape instance
   */
  static createLine(width: number): Shape {
    // Lines are typically very thin in height
    return Shape.create('straightConnector1', width, 12700); // 12700 EMU ≈ 1pt height
  }

  /**
   * Gets the shape type
   * @returns Shape type
   */
  getShapeType(): ShapeType {
    return this.shapeType;
  }

  /**
   * Gets the shape width in EMUs
   * @returns Width
   */
  getWidth(): number {
    return this.width;
  }

  /**
   * Gets the shape height in EMUs
   * @returns Height
   */
  getHeight(): number {
    return this.height;
  }

  /**
   * Sets the shape fill color
   * @param color Fill color in hex (e.g., 'FF0000')
   * @param transparency Optional transparency percentage (0-100)
   * @returns This shape for chaining
   */
  setFill(color: string, transparency?: number): this {
    this.fill = { color, transparency };
    return this;
  }

  /**
   * Gets the fill configuration
   * @returns Fill or undefined
   */
  getFill(): ShapeFill | undefined {
    return this.fill;
  }

  /**
   * Sets the shape outline
   * @param color Outline color in hex
   * @param width Outline width in EMUs
   * @param style Line style
   * @returns This shape for chaining
   */
  setOutline(color: string, width: number, style?: 'solid' | 'dash' | 'dot' | 'dashDot'): this {
    this.outline = { color, width, style: style || 'solid' };
    return this;
  }

  /**
   * Gets the outline configuration
   * @returns Outline or undefined
   */
  getOutline(): ShapeOutline | undefined {
    return this.outline;
  }

  /**
   * Sets shape position (for floating shapes)
   * @param horizontal Horizontal positioning configuration
   * @param vertical Vertical positioning configuration
   * @returns This shape for chaining
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
   * Sets anchor configuration (converts shape to floating)
   * @param options Anchor configuration
   * @returns This shape for chaining
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
   * Sets the rotation angle
   * @param degrees Rotation in degrees (0-360)
   * @returns This shape for chaining
   */
  setRotation(degrees: number): this {
    this.rotation = ((degrees % 360) + 360) % 360;
    return this;
  }

  /**
   * Gets the rotation angle
   * @returns Rotation in degrees
   */
  getRotation(): number {
    return this.rotation;
  }

  /**
   * Sets text content within the shape
   * @param text Text content
   * @param formatting Optional text formatting
   * @returns This shape for chaining
   */
  setText(text: string, formatting?: RunFormatting): this {
    this.text = text;
    if (formatting) {
      this.textFormatting = formatting;
    }
    return this;
  }

  /**
   * Gets the text content
   * @returns Text or undefined
   */
  getText(): string | undefined {
    return this.text;
  }

  /**
   * Sets the shape name
   * @param name Shape name
   * @returns This shape for chaining
   */
  setName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Gets the shape name
   * @returns Shape name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Sets the shape description (for accessibility)
   * @param description Shape description
   * @returns This shape for chaining
   */
  setDescription(description: string): this {
    this.description = description;
    return this;
  }

  /**
   * Gets the shape description
   * @returns Shape description
   */
  getDescription(): string {
    return this.description;
  }

  /**
   * Sets the docPr ID (drawing object ID)
   * @param id Document property ID
   * @returns This shape for chaining
   */
  setDocPrId(id: number): this {
    this.docPrId = id;
    return this;
  }

  /**
   * Checks if this shape is floating (has anchor or position configuration)
   * @returns True if floating, false if inline
   */
  isFloating(): boolean {
    return this.anchor !== undefined || this.position !== undefined;
  }

  /**
   * Generates DrawingML XML for the shape
   * Creates either inline or floating (anchor) shape based on configuration
   * @returns XML element representing the shape
   */
  toXML(): XMLElement {
    // Choose between inline and anchor based on configuration
    const shapeElement = this.isFloating() ? this.createAnchor() : this.createInline();

    // Create the drawing structure
    return XMLBuilder.w('drawing', undefined, [shapeElement]);
  }

  /**
   * Creates the wp:inline element for inline shapes
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

    // Effect extent (set to 0 for shapes)
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

    // Graphic data (the actual shape)
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
   * Creates the wp:anchor element for floating shapes
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

    // Wrap square (default for shapes)
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

    // Graphic data (the actual shape)
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
   * Creates the a:graphic element containing the shape
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
   * Creates the wps:wsp element (WordprocessingShape)
   * @private
   */
  private createWps(): XMLElement {
    const children: XMLElement[] = [];

    // Non-visual shape properties
    children.push({
      name: 'wps:cNvSpPr',
      attributes: {
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
      },
      selfClosing: true,
    });

    // Shape properties (geometry, fill, outline)
    children.push(this.createSpPr());

    // Text box (if text is present)
    if (this.text) {
      children.push(this.createTextBox());
    }

    return {
      name: 'wps:wsp',
      attributes: {
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
      },
      children,
    };
  }

  /**
   * Creates the wps:spPr element (shape properties)
   * @private
   */
  private createSpPr(): XMLElement {
    const children: XMLElement[] = [];

    // Transform (position and size)
    const xfrmAttrs = this.rotation > 0 ? { rot: (this.rotation * 60000).toString() } : undefined;
    children.push({
      name: 'a:xfrm',
      attributes: xfrmAttrs,
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

    // Preset geometry (shape type)
    children.push({
      name: 'a:prstGeom',
      attributes: {
        prst: this.shapeType,
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

      // Color
      const colorAttrs: Record<string, string> = {
        val: this.fill.color.toUpperCase(),
      };

      // Transparency (alpha percentage)
      if (this.fill.transparency !== undefined) {
        // Convert 0-100 to 0-100000 (percentage * 1000)
        const alpha = 100 - this.fill.transparency; // Invert (0=transparent, 100=opaque)
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
            attributes: colorAttrs,
            ...(fillChildren.length > 0 ? { children: fillChildren } : { selfClosing: true }),
          },
        ],
      });
    }

    // Outline
    if (this.outline) {
      const lnAttrs: Record<string, string> = {
        w: this.outline.width.toString(),
      };

      const lnChildren: XMLElement[] = [];

      // Outline color
      lnChildren.push({
        name: 'a:solidFill',
        children: [
          {
            name: 'a:srgbClr',
            attributes: {
              val: this.outline.color.toUpperCase(),
            },
            selfClosing: true,
          },
        ],
      });

      // Line style (prstDash)
      if (this.outline.style && this.outline.style !== 'solid') {
        lnChildren.push({
          name: 'a:prstDash',
          attributes: {
            val: this.outline.style,
          },
          selfClosing: true,
        });
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
   * Creates the wps:txbx element (text box within shape)
   * @private
   */
  private createTextBox(): XMLElement {
    if (!this.text) {
      return { name: 'wps:txbx', selfClosing: true };
    }

    // Build run properties
    const rPrChildren: XMLElement[] = [];
    if (this.textFormatting) {
      if (this.textFormatting.bold) {
        rPrChildren.push(XMLBuilder.wSelf('b'));
      }
      if (this.textFormatting.italic) {
        rPrChildren.push(XMLBuilder.wSelf('i'));
      }
      if (this.textFormatting.color) {
        rPrChildren.push(XMLBuilder.wSelf('color', { 'w:val': this.textFormatting.color }));
      }
      if (this.textFormatting.size) {
        const halfPoints = this.textFormatting.size * 2;
        rPrChildren.push(XMLBuilder.wSelf('sz', { 'w:val': halfPoints }));
        rPrChildren.push(XMLBuilder.wSelf('szCs', { 'w:val': halfPoints }));
      }
    }

    // Build paragraph with run
    const runChildren: XMLElement[] = [];
    if (rPrChildren.length > 0) {
      runChildren.push(XMLBuilder.w('rPr', undefined, rPrChildren));
    }
    runChildren.push(XMLBuilder.w('t', { 'xml:space': 'preserve' }, [this.text]));

    const paragraph = XMLBuilder.w('p', undefined, [XMLBuilder.w('r', undefined, runChildren)]);

    return {
      name: 'wps:txbx',
      children: [
        {
          name: 'w:txbxContent',
          children: [paragraph],
        },
      ],
    };
  }
}
