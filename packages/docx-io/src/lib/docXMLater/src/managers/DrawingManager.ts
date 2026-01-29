/**
 * DrawingManager - Manages all drawing elements in a document
 *
 * Centralizes management of images, shapes, and text boxes.
 * Assigns unique IDs and handles relationship management.
 */

import { Image } from '../elements/Image';
import { Shape } from '../elements/Shape';
import { TextBox } from '../elements/TextBox';

/**
 * Type representing any drawing element
 */
export type DrawingElement = Image | Shape | TextBox;

/**
 * Drawing type discriminator
 */
export type DrawingType = 'image' | 'shape' | 'textbox' | 'preserved';

/**
 * Preserved drawing (SmartArt, Chart, WordArt)
 * These are stored as raw XML for round-trip preservation
 */
export interface PreservedDrawing {
  /** Type of preserved drawing */
  type: 'smartart' | 'chart' | 'wordart';
  /** Raw XML content */
  xml: string;
  /** Relationship IDs referenced by this drawing */
  relationshipIds: string[];
  /** Unique ID for this drawing */
  id: string;
}

/**
 * Manages all drawing elements in a document
 *
 * Performance: Uses type-indexed Sets for O(1) type-specific lookups
 * instead of O(n) linear scans through the main Map.
 */
export class DrawingManager {
  private drawings: Map<string, DrawingElement | PreservedDrawing> = new Map();
  private nextId = 1;

  // Type-indexed Sets for O(1) type-specific lookups
  private imageIds: Set<string> = new Set();
  private shapeIds: Set<string> = new Set();
  private textboxIds: Set<string> = new Set();
  private preservedIds: Set<string> = new Set();

  /**
   * Creates a new DrawingManager
   */
  constructor() {
    // Empty constructor
  }

  /**
   * Adds an image to the manager
   * @param image Image to add
   * @returns Assigned ID
   */
  addImage(image: Image): string {
    const id = this.generateId();
    image.setDocPrId(this.nextId - 1);
    this.drawings.set(id, image);
    this.imageIds.add(id);
    return id;
  }

  /**
   * Adds a shape to the manager
   * @param shape Shape to add
   * @returns Assigned ID
   */
  addShape(shape: Shape): string {
    const id = this.generateId();
    shape.setDocPrId(this.nextId - 1);
    this.drawings.set(id, shape);
    this.shapeIds.add(id);
    return id;
  }

  /**
   * Adds a text box to the manager
   * @param textbox TextBox to add
   * @returns Assigned ID
   */
  addTextBox(textbox: TextBox): string {
    const id = this.generateId();
    textbox.setDocPrId(this.nextId - 1);
    this.drawings.set(id, textbox);
    this.textboxIds.add(id);
    return id;
  }

  /**
   * Adds a preserved drawing (SmartArt, Chart, WordArt)
   * @param drawing Preserved drawing to add
   * @returns Assigned ID
   */
  addPreservedDrawing(drawing: PreservedDrawing): string {
    const id = this.generateId();
    this.drawings.set(id, { ...drawing, id });
    this.preservedIds.add(id);
    return id;
  }

  /**
   * Gets a drawing by ID
   * @param id Drawing ID
   * @returns Drawing element or undefined
   */
  getDrawing(id: string): DrawingElement | PreservedDrawing | undefined {
    return this.drawings.get(id);
  }

  /**
   * Gets all drawings
   * @returns Array of all drawing elements
   */
  getAllDrawings(): (DrawingElement | PreservedDrawing)[] {
    return Array.from(this.drawings.values());
  }

  /**
   * Gets all images
   * Performance: O(k) where k = number of images (uses indexed lookup)
   * @returns Array of images
   */
  getAllImages(): Image[] {
    const images: Image[] = [];
    for (const id of this.imageIds) {
      const drawing = this.drawings.get(id);
      if (drawing instanceof Image) {
        images.push(drawing);
      }
    }
    return images;
  }

  /**
   * Gets all shapes
   * Performance: O(k) where k = number of shapes (uses indexed lookup)
   * @returns Array of shapes
   */
  getAllShapes(): Shape[] {
    const shapes: Shape[] = [];
    for (const id of this.shapeIds) {
      const drawing = this.drawings.get(id);
      if (drawing instanceof Shape) {
        shapes.push(drawing);
      }
    }
    return shapes;
  }

  /**
   * Gets all text boxes
   * Performance: O(k) where k = number of text boxes (uses indexed lookup)
   * @returns Array of text boxes
   */
  getAllTextBoxes(): TextBox[] {
    const textboxes: TextBox[] = [];
    for (const id of this.textboxIds) {
      const drawing = this.drawings.get(id);
      if (drawing instanceof TextBox) {
        textboxes.push(drawing);
      }
    }
    return textboxes;
  }

  /**
   * Gets all preserved drawings
   * Performance: O(k) where k = number of preserved drawings (uses indexed lookup)
   * @returns Array of preserved drawings
   */
  getAllPreservedDrawings(): PreservedDrawing[] {
    const preserved: PreservedDrawing[] = [];
    for (const id of this.preservedIds) {
      const drawing = this.drawings.get(id);
      if (drawing && this.isPreservedDrawing(drawing)) {
        preserved.push(drawing);
      }
    }
    return preserved;
  }

  /**
   * Removes a drawing by ID
   * @param id Drawing ID
   * @returns True if removed, false if not found
   */
  removeDrawing(id: string): boolean {
    const deleted = this.drawings.delete(id);
    if (deleted) {
      // Remove from type-specific indices
      this.imageIds.delete(id);
      this.shapeIds.delete(id);
      this.textboxIds.delete(id);
      this.preservedIds.delete(id);
    }
    return deleted;
  }

  /**
   * Gets the total number of drawings
   * @returns Number of drawings
   */
  getCount(): number {
    return this.drawings.size;
  }

  /**
   * Checks if the manager has any drawings
   * @returns True if empty, false otherwise
   */
  isEmpty(): boolean {
    return this.drawings.size === 0;
  }

  /**
   * Clears all drawings
   */
  clear(): void {
    this.drawings.clear();
    this.imageIds.clear();
    this.shapeIds.clear();
    this.textboxIds.clear();
    this.preservedIds.clear();
    this.nextId = 1;
  }

  /**
   * Gets the drawing type
   * @param drawing Drawing element
   * @returns Drawing type
   */
  getDrawingType(drawing: DrawingElement | PreservedDrawing): DrawingType {
    if (drawing instanceof Image) {
      return 'image';
    }
    if (drawing instanceof Shape) {
      return 'shape';
    }
    if (drawing instanceof TextBox) {
      return 'textbox';
    }
    return 'preserved';
  }

  /**
   * Type guard for PreservedDrawing
   * @param drawing Drawing to check
   * @returns True if PreservedDrawing
   */
  private isPreservedDrawing(drawing: any): drawing is PreservedDrawing {
    return (
      drawing &&
      typeof drawing === 'object' &&
      'type' in drawing &&
      'xml' in drawing &&
      'relationshipIds' in drawing &&
      (drawing.type === 'smartart' ||
        drawing.type === 'chart' ||
        drawing.type === 'wordart')
    );
  }

  /**
   * Generates a unique ID for a drawing
   * @private
   * @returns Unique ID string
   */
  private generateId(): string {
    const id = `drawing_${this.nextId}`;
    this.nextId++;
    return id;
  }

  /**
   * Assigns sequential docPr IDs to all drawings
   * Call this before generating the document to ensure unique IDs
   */
  assignIds(): void {
    let docPrId = 1;
    for (const drawing of this.drawings.values()) {
      if (drawing instanceof Image) {
        drawing.setDocPrId(docPrId++);
      } else if (drawing instanceof Shape) {
        drawing.setDocPrId(docPrId++);
      } else if (drawing instanceof TextBox) {
        drawing.setDocPrId(docPrId++);
      }
      // PreservedDrawings don't need docPrId assignment (already in XML)
    }
  }

  /**
   * Gets statistics about the drawings
   * Performance: O(1) using indexed Set sizes
   * @returns Statistics object
   */
  getStats(): {
    total: number;
    images: number;
    shapes: number;
    textboxes: number;
    preserved: number;
  } {
    return {
      total: this.drawings.size,
      images: this.imageIds.size,
      shapes: this.shapeIds.size,
      textboxes: this.textboxIds.size,
      preserved: this.preservedIds.size,
    };
  }
}
