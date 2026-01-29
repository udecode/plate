/**
 * Image - Represents an embedded image in a Word document
 *
 * Images use DrawingML (a:) and WordprocessingML Drawing (wp:) namespaces
 * for proper positioning and formatting in Word documents.
 */

import { promises as fs } from 'fs';
import { defaultLogger } from '../utils/logger';
import { inchesToEmus } from '../utils/units';
import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';

/**
 * Supported image formats
 */
export type ImageFormat = 'png' | 'jpeg' | 'jpg' | 'gif' | 'bmp' | 'tiff';

/**
 * Image extent (dimensions)
 */
export interface ImageExtent {
  /** Width in EMUs */
  width: number;
  /** Height in EMUs */
  height: number;
}

/**
 * Effect extent (additional space for shadows, reflections, glows)
 * Specifies additional space to add to each edge to prevent clipping of effects
 */
export interface EffectExtent {
  /** Left extent in EMUs */
  left: number;
  /** Top extent in EMUs */
  top: number;
  /** Right extent in EMUs */
  right: number;
  /** Bottom extent in EMUs */
  bottom: number;
}

/**
 * Text wrapping type
 */
export type WrapType = 'square' | 'tight' | 'through' | 'topAndBottom' | 'none';

/**
 * Text wrapping side
 */
export type WrapSide = 'bothSides' | 'left' | 'right' | 'largest';

/**
 * Text wrap settings
 */
export interface TextWrapSettings {
  /** Wrap type */
  type: WrapType;
  /** Which side(s) to wrap text */
  side?: WrapSide;
  /** Distance from top in EMUs */
  distanceTop?: number;
  /** Distance from bottom in EMUs */
  distanceBottom?: number;
  /** Distance from left in EMUs */
  distanceLeft?: number;
  /** Distance from right in EMUs */
  distanceRight?: number;
}

/**
 * Position anchor type (what to position relative to)
 */
export type PositionAnchor =
  | 'page'
  | 'margin'
  | 'column'
  | 'character'
  | 'paragraph';

/**
 * Horizontal alignment options
 */
export type HorizontalAlignment =
  | 'left'
  | 'center'
  | 'right'
  | 'inside'
  | 'outside';

/**
 * Vertical alignment options
 */
export type VerticalAlignment =
  | 'top'
  | 'center'
  | 'bottom'
  | 'inside'
  | 'outside';

/**
 * Image position configuration
 */
export interface ImagePosition {
  /** Horizontal positioning */
  horizontal: {
    /** Anchor point */
    anchor: PositionAnchor;
    /** Offset in EMUs (absolute positioning) */
    offset?: number;
    /** Alignment (relative positioning) */
    alignment?: HorizontalAlignment;
  };
  /** Vertical positioning */
  vertical: {
    /** Anchor point */
    anchor: PositionAnchor;
    /** Offset in EMUs (absolute positioning) */
    offset?: number;
    /** Alignment (relative positioning) */
    alignment?: VerticalAlignment;
  };
}

/**
 * Image anchor configuration (floating images)
 */
export interface ImageAnchor {
  /** Position behind text */
  behindDoc: boolean;
  /** Lock anchor (prevent movement) */
  locked: boolean;
  /** Layout in table cell */
  layoutInCell: boolean;
  /** Allow overlap with other objects */
  allowOverlap: boolean;
  /** Z-order (higher = in front) */
  relativeHeight: number;
}

/**
 * Image crop settings (percentage-based)
 */
export interface ImageCrop {
  /** Left crop percentage (0-100) */
  left: number;
  /** Top crop percentage (0-100) */
  top: number;
  /** Right crop percentage (0-100) */
  right: number;
  /** Bottom crop percentage (0-100) */
  bottom: number;
}

/**
 * Image visual effects
 */
export interface ImageEffects {
  /** Brightness adjustment (-100 to +100) */
  brightness?: number;
  /** Contrast adjustment (-100 to +100) */
  contrast?: number;
  /** Convert to grayscale */
  grayscale?: boolean;
}

/**
 * Image properties
 */
export interface ImageProperties {
  /** Image source (file path or buffer) */
  source: string | Buffer;
  /** Image width in EMUs (optional - will auto-detect) */
  width?: number;
  /** Image height in EMUs (optional - will auto-detect) */
  height?: number;
  /** Maintain aspect ratio when resizing */
  maintainAspectRatio?: boolean;
  /** Alt text / description */
  description?: string;
  /** Image name/title */
  name?: string;
  /** Relationship ID (will be set by ImageManager) */
  relationshipId?: string;
  /** Effect extent (space for shadows/glows) */
  effectExtent?: EffectExtent;
  /** Text wrapping configuration */
  wrap?: TextWrapSettings;
  /** Position configuration (floating images) */
  position?: ImagePosition;
  /** Anchor configuration (floating images) */
  anchor?: ImageAnchor;
  /** Crop settings */
  crop?: ImageCrop;
  /** Visual effects */
  effects?: ImageEffects;
  /** Border settings (width in points) */
  border?: { width: number };
  /** Rotation angle in degrees (0-360) */
  rotation?: number;
}

/**
 * Image validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class Image {
  private source: string | Buffer;
  private width: number;
  private height: number;
  private description: string;
  private name: string;
  private relationshipId?: string;
  private imageData?: Buffer;
  private extension: string;
  private docPrId = 1;
  private dpi = 96; // Default DPI

  // Advanced image properties
  private effectExtent?: EffectExtent;
  private wrap?: TextWrapSettings;
  private position?: ImagePosition;
  private anchor?: ImageAnchor;
  private crop?: ImageCrop;
  private effects?: ImageEffects;
  private rotation = 0;
  private border?: { width: number }; // Width in points, color always black

  /**
   * Creates a new image from file path (async factory)
   * @param path File path
   * @param properties Additional properties
   * @returns Promise<Image>
   */
  static async fromFile(
    path: string,
    properties: Partial<ImageProperties> = {}
  ): Promise<Image> {
    const image = new Image({ source: path, ...properties });
    await image.loadImageDataForDimensions();
    return image;
  }

  /**
   * Creates a new image from buffer (async factory)
   * Supports both modern and legacy API signatures
   *
   * @param buffer Image buffer
   * @param mimeTypeOrProperties MIME type string ('png', 'jpeg', etc.) or properties object
   * @param width Optional width in EMUs (legacy API)
   * @param height Optional height in EMUs (legacy API)
   * @returns Promise<Image>
   *
   * @example
   * // Modern API (recommended)
   * const img = await Image.fromBuffer(buffer, { mimeType: 'png', width: 914400, height: 914400 });
   *
   * // Legacy API (still supported)
   * const img = await Image.fromBuffer(buffer, 'png', 914400, 914400);
   */
  static async fromBuffer(
    buffer: Buffer,
    mimeTypeOrProperties?: string | Partial<ImageProperties>,
    width?: number,
    height?: number
  ): Promise<Image> {
    let properties: Partial<ImageProperties>;

    // Detect API signature
    if (typeof mimeTypeOrProperties === 'string') {
      // Legacy 4-parameter signature: fromBuffer(buffer, 'png', 914400, 914400)
      // Note: mimeType is ignored - extension is auto-detected from buffer
      properties = {
        width,
        height,
      };
    } else {
      // Modern API: fromBuffer(buffer, { width: 914400, height: 914400 })
      properties = mimeTypeOrProperties || {};
    }

    const image = new Image({ source: buffer, ...properties });
    await image.loadImageDataForDimensions();
    return image;
  }

  /**
   * Unified create method for images (async factory)
   * @param properties Image properties including source (path or buffer)
   * @returns Promise<Image>
   */
  static async create(properties: ImageProperties): Promise<Image> {
    if (Buffer.isBuffer(properties.source)) {
      return Image.fromBuffer(properties.source, properties);
    }
    if (typeof properties.source === 'string') {
      return Image.fromFile(properties.source, properties);
    }
    throw new Error('Invalid source: must be file path or Buffer');
  }

  /**
   * Private constructor
   * @param properties Image properties
   */
  private constructor(properties: ImageProperties) {
    this.source = properties.source;
    this.description = properties.description || 'Image';
    this.name = properties.name || 'image';
    this.relationshipId = properties.relationshipId;

    // Detect image extension
    this.extension = this.detectExtension();

    // Set default dimensions (6 inches x 4 inches) if not provided
    this.width = properties.width || inchesToEmus(6);
    this.height = properties.height || inchesToEmus(4);

    // Initialize advanced properties
    this.effectExtent = properties.effectExtent;
    this.wrap = properties.wrap;
    this.position = properties.position;
    this.anchor = properties.anchor;
    this.crop = properties.crop;
    this.effects = properties.effects;
    this.border = properties.border;
    // Apply rotation if provided (normalize to 0-360)
    if (properties.rotation !== undefined && properties.rotation !== 0) {
      this.rotation = ((properties.rotation % 360) + 360) % 360;
    }

    // Set default DPI
    this.dpi = 96;
  }

  /**
   * Loads image data temporarily for dimension detection only
   * Data is released after detection to save memory
   * @private
   */
  private async loadImageDataForDimensions(): Promise<void> {
    let tempData: Buffer | undefined;

    try {
      if (Buffer.isBuffer(this.source)) {
        tempData = this.source;
      } else if (typeof this.source === 'string') {
        await fs.access(this.source);
        tempData = await fs.readFile(this.source);
      }

      if (tempData) {
        this.imageData = tempData; // Temporarily store

        // Only auto-detect dimensions if they weren't explicitly provided
        // This preserves wp:extent values from parsed documents
        const defaultWidth = inchesToEmus(6);
        const defaultHeight = inchesToEmus(4);
        const hasExplicitDimensions =
          this.width !== defaultWidth || this.height !== defaultHeight;

        if (!hasExplicitDimensions) {
          const dimensions = this.detectDimensions();
          if (dimensions) {
            this.dpi = this.detectDPI() || 96;
            const emuPerInch = 914_400;
            const pixelsPerInch = this.dpi;
            this.width = Math.round(
              (dimensions.width / pixelsPerInch) * emuPerInch
            );
            this.height = Math.round(
              (dimensions.height / pixelsPerInch) * emuPerInch
            );
          }
        }

        if (typeof this.source === 'string') {
          this.imageData = undefined; // Release
        }
      }
    } catch (error) {
      defaultLogger.error(
        `Failed to load image for dimensions: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Image loading failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Ensures image data is loaded (lazy loading)
   */
  async ensureDataLoaded(): Promise<void> {
    if (this.imageData) return;

    try {
      if (Buffer.isBuffer(this.source)) {
        this.imageData = this.source;
      } else if (typeof this.source === 'string') {
        await fs.access(this.source);
        this.imageData = await fs.readFile(this.source);
      } else {
        throw new Error('Invalid image source');
      }
    } catch (error) {
      defaultLogger.error(
        `Failed to load image data: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Image data loading failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Releases image data from memory
   */
  releaseData(): void {
    if (typeof this.source === 'string') {
      this.imageData = undefined;
    }
  }

  /**
   * Validates the image data integrity
   */
  validateImageData(): ValidationResult {
    if (!this.imageData || this.imageData.length === 0) {
      return { valid: false, error: 'Empty image data' };
    }

    const signatures: Record<string, number[]> = {
      png: [0x89, 0x50, 0x4e, 0x47],
      jpg: [0xff, 0xd8],
      jpeg: [0xff, 0xd8],
      gif: [0x47, 0x49, 0x46],
      bmp: [0x42, 0x4d],
      tiff: [0x49, 0x49, 0x2a, 0x00],
      tif: [0x49, 0x49, 0x2a, 0x00],
    };

    const sig = signatures[this.extension];
    if (sig) {
      for (let i = 0; i < sig.length; i++) {
        if (this.imageData[i] !== sig[i]) {
          return {
            valid: false,
            error: `Invalid ${this.extension.toUpperCase()} signature`,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Detects image extension from source
   */
  private detectExtension(): string {
    if (typeof this.source === 'string') {
      const match = this.source.match(/\.([a-z]+)$/i);
      if (match && match[1]) {
        return match[1].toLowerCase();
      }
    }
    return 'png';
  }

  /**
   * Attempts to detect image dimensions from buffer
   */
  private detectDimensions(): { width: number; height: number } | null {
    if (!this.imageData || this.imageData.length < 24) return null;

    if (
      this.imageData[0] === 0x89 &&
      this.imageData[1] === 0x50 &&
      this.imageData[2] === 0x4e &&
      this.imageData[3] === 0x47
    ) {
      return this.detectPngDimensions();
    }
    if (this.imageData[0] === 0xff && this.imageData[1] === 0xd8) {
      return this.detectJpegDimensions();
    }
    if (
      this.imageData[0] === 0x47 &&
      this.imageData[1] === 0x49 &&
      this.imageData[2] === 0x46
    ) {
      return this.detectGifDimensions();
    }
    if (this.imageData[0] === 0x42 && this.imageData[1] === 0x4d) {
      return this.detectBmpDimensions();
    }
    if (
      (this.imageData[0] === 0x49 &&
        this.imageData[1] === 0x49 &&
        this.imageData[2] === 0x2a) ||
      (this.imageData[0] === 0x4d &&
        this.imageData[1] === 0x4d &&
        this.imageData[2] === 0x00)
    ) {
      return this.detectTiffDimensions();
    }
    return null;
  }

  // Dimension detection helpers (as before, keeping them the same)

  private detectPngDimensions(): { width: number; height: number } | null {
    if (!this.imageData || this.imageData.length < 24) return null;
    const width = this.imageData.readUInt32BE(16);
    const height = this.imageData.readUInt32BE(20);
    return { width, height };
  }

  private detectGifDimensions(): { width: number; height: number } | null {
    if (!this.imageData || this.imageData.length < 10) return null;
    const width = this.imageData.readUInt16LE(6);
    const height = this.imageData.readUInt16LE(8);
    if (width > 0 && height > 0) return { width, height };
    return null;
  }

  private detectBmpDimensions(): { width: number; height: number } | null {
    if (!this.imageData || this.imageData.length < 26) return null;
    const width = this.imageData.readInt32LE(18);
    const height = Math.abs(this.imageData.readInt32LE(22));
    if (width > 0 && height > 0) return { width, height };
    return null;
  }

  private detectTiffDimensions(): { width: number; height: number } | null {
    // Implementation as before
    if (!this.imageData || this.imageData.length < 14) return null;
    const isLittleEndian = this.imageData[0] === 0x49;
    const ifdOffset = isLittleEndian
      ? this.imageData.readUInt32LE(4)
      : this.imageData.readUInt32BE(4);
    if (ifdOffset + 14 > this.imageData.length) return null;
    const numEntries = isLittleEndian
      ? this.imageData.readUInt16LE(ifdOffset)
      : this.imageData.readUInt16BE(ifdOffset);
    let width = 0;
    let height = 0;
    for (let i = 0; i < numEntries; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      if (entryOffset + 12 > this.imageData.length) break;
      const tag = isLittleEndian
        ? this.imageData.readUInt16LE(entryOffset)
        : this.imageData.readUInt16BE(entryOffset);
      const value = isLittleEndian
        ? this.imageData.readUInt32LE(entryOffset + 8)
        : this.imageData.readUInt32BE(entryOffset + 8);
      if (tag === 256) width = value;
      if (tag === 257) height = value;
      if (width > 0 && height > 0) break;
    }
    if (width > 0 && height > 0) return { width, height };
    return null;
  }

  private detectJpegDimensions(): { width: number; height: number } | null {
    // Implementation as before
    if (!this.imageData || this.imageData.length < 12) return null;
    let offset = 2;
    while (offset < this.imageData.length - 1) {
      if (this.imageData[offset] !== 0xff) break;
      const marker = this.imageData[offset + 1];
      if (marker === undefined) break;
      if (marker === 0x00 || marker === 0xff) {
        offset++;
        continue;
      }
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        if (offset + 9 > this.imageData.length) break;
        const height = this.imageData.readUInt16BE(offset + 5);
        const width = this.imageData.readUInt16BE(offset + 7);
        if (width > 0 && height > 0) return { width, height };
      }
      if (marker === 0xda || marker === 0xd9) break;
      const segmentLength = this.imageData.readUInt16BE(offset + 2);
      if (
        segmentLength < 2 ||
        offset + 2 + segmentLength > this.imageData.length
      )
        break;
      offset += 2 + segmentLength;
    }
    return null;
  }

  /**
   * Gets the image data buffer asynchronously
   */
  async getImageDataAsync(): Promise<Buffer> {
    await this.ensureDataLoaded();
    if (!this.imageData) throw new Error('Failed to load image data');
    return this.imageData;
  }

  /**
   * Gets the image data buffer synchronously
   */
  getImageData(): Buffer {
    if (!this.imageData)
      throw new Error('Image data not loaded. Call ensureDataLoaded first.');
    return this.imageData;
  }

  getExtension(): string {
    return this.extension;
  }

  getDPI(): number {
    return this.dpi;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getImageDataSafe(): Buffer | null {
    return this.imageData ?? null;
  }

  setWidth(width: number, maintainAspectRatio = true): this {
    if (maintainAspectRatio && this.height > 0) {
      const ratio = this.height / this.width;
      this.height = Math.round(width * ratio);
    }
    this.width = width;
    return this;
  }

  setHeight(height: number, maintainAspectRatio = true): this {
    if (maintainAspectRatio && this.width > 0) {
      const ratio = this.width / this.height;
      this.width = Math.round(height * ratio);
    }
    this.height = height;
    return this;
  }

  setSize(width: number, height: number): this {
    this.width = width;
    this.height = height;
    return this;
  }

  async updateImageData(newSource: string | Buffer): Promise<void> {
    this.source = newSource;
    this.imageData = undefined;
    await this.loadImageDataForDimensions();
    if (typeof newSource === 'string') this.extension = this.detectExtension();
    this.dpi = this.detectDPI() || 96;
  }

  setRelationshipId(relationshipId: string): this {
    this.relationshipId = relationshipId;
    return this;
  }

  getRelationshipId(): string | undefined {
    return this.relationshipId;
  }

  setDocPrId(id: number): this {
    this.docPrId = id;
    return this;
  }

  setAltText(altText: string): this {
    this.description = altText;
    return this;
  }

  getAltText(): string {
    return this.description;
  }

  rotate(degrees: number): this {
    this.rotation = ((degrees % 360) + 360) % 360;
    if (this.rotation === 90 || this.rotation === 270) {
      [this.width, this.height] = [this.height, this.width];
    }
    return this;
  }

  getRotation(): number {
    return this.rotation;
  }

  setEffectExtent(
    left: number,
    top: number,
    right: number,
    bottom: number
  ): this {
    this.effectExtent = { left, top, right, bottom };
    return this;
  }

  getEffectExtent(): EffectExtent | undefined {
    return this.effectExtent;
  }

  setWrap(
    type: WrapType,
    side?: WrapSide,
    distances?: { top?: number; bottom?: number; left?: number; right?: number }
  ): this {
    this.wrap = {
      type,
      side,
      distanceTop: distances?.top,
      distanceBottom: distances?.bottom,
      distanceLeft: distances?.left,
      distanceRight: distances?.right,
    };
    return this;
  }

  getWrap(): TextWrapSettings | undefined {
    return this.wrap;
  }

  /**
   * Validates a position offset value
   * @param offset - Offset value in EMUs
   * @param axis - 'horizontal' or 'vertical' for error messages
   * @throws {Error} If offset exceeds maximum reasonable value
   * @private
   */
  private validatePositionOffset(
    offset: number | undefined,
    axis: string
  ): void {
    if (offset === undefined) return;

    // Maximum reasonable offset: 50 inches = 45,720,000 EMUs
    const MAX_OFFSET_EMUS = 45_720_000;
    if (Math.abs(offset) > MAX_OFFSET_EMUS) {
      throw new Error(
        `Invalid ${axis} position offset: ${offset} EMUs exceeds maximum of ${MAX_OFFSET_EMUS} EMUs (50 inches).`
      );
    }
  }

  /**
   * Sets the position for a floating image
   *
   * Position can be specified using either:
   * - Absolute offset (in EMUs from the anchor point)
   * - Relative alignment (left, center, right / top, center, bottom)
   *
   * @param horizontal - Horizontal positioning configuration
   * @param vertical - Vertical positioning configuration
   * @returns This image for chaining
   * @throws {Error} If offset values exceed maximum
   *
   * @example
   * ```typescript
   * // Absolute positioning (100,000 EMUs from page edges)
   * image.setPosition(
   *   { anchor: 'page', offset: 100000 },
   *   { anchor: 'page', offset: 100000 }
   * );
   *
   * // Relative alignment (centered on page)
   * image.setPosition(
   *   { anchor: 'page', alignment: 'center' },
   *   { anchor: 'page', alignment: 'center' }
   * );
   * ```
   */
  setPosition(
    horizontal: ImagePosition['horizontal'],
    vertical: ImagePosition['vertical']
  ): this {
    // Validate offset values
    this.validatePositionOffset(horizontal.offset, 'horizontal');
    this.validatePositionOffset(vertical.offset, 'vertical');

    this.position = { horizontal, vertical };
    return this;
  }

  getPosition(): ImagePosition | undefined {
    return this.position;
  }

  /**
   * Validates the current image position configuration
   *
   * Checks for common configuration issues:
   * - Missing anchor when offset is used
   * - Conflicting offset and alignment values
   * - Invalid combinations
   *
   * @returns Validation result with details
   *
   * @example
   * ```typescript
   * const result = image.validatePosition();
   * if (!result.isValid) {
   *   console.log(result.warnings); // Array of warning messages
   * }
   * ```
   */
  validatePosition(): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    if (!this.position) {
      return { isValid: true, warnings };
    }

    // Check if both offset and alignment are specified (unusual but not invalid)
    if (
      this.position.horizontal.offset !== undefined &&
      this.position.horizontal.alignment
    ) {
      warnings.push(
        'Horizontal position has both offset and alignment. Word will use alignment and ignore offset.'
      );
    }

    if (
      this.position.vertical.offset !== undefined &&
      this.position.vertical.alignment
    ) {
      warnings.push(
        'Vertical position has both offset and alignment. Word will use alignment and ignore offset.'
      );
    }

    // Check for floating image without anchor settings
    if (this.position && !this.anchor) {
      warnings.push(
        'Position is set but anchor is not. Consider setting anchor properties for proper floating behavior.'
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }

  setAnchor(options: ImageAnchor): this {
    this.anchor = options;
    return this;
  }

  getAnchor(): ImageAnchor | undefined {
    return this.anchor;
  }

  setCrop(left: number, top: number, right: number, bottom: number): this {
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    this.crop = {
      left: clamp(left),
      top: clamp(top),
      right: clamp(right),
      bottom: clamp(bottom),
    };
    return this;
  }

  getCrop(): ImageCrop | undefined {
    return this.crop;
  }

  setEffects(options: ImageEffects): this {
    const clamp = (val?: number) =>
      val !== undefined ? Math.max(-100, Math.min(100, val)) : undefined;
    this.effects = {
      brightness: clamp(options.brightness),
      contrast: clamp(options.contrast),
      grayscale: options.grayscale,
    };
    return this;
  }

  getEffects(): ImageEffects | undefined {
    return this.effects;
  }

  private detectDPI(): number | undefined {
    if (!this.imageData) return;

    try {
      if (this.extension === 'png') {
        const physIndex = this.imageData.indexOf(
          Buffer.from([0x70, 0x48, 0x59, 0x73])
        );
        if (physIndex !== -1 && physIndex + 12 < this.imageData.length) {
          const xPixelsPerMeter = this.imageData.readUInt32BE(physIndex + 4);
          const yPixelsPerMeter = this.imageData.readUInt32BE(physIndex + 8);
          const unit = this.imageData[physIndex + 12];
          if (unit === 1) {
            const dpiX = Math.round(xPixelsPerMeter * 0.0254);
            const dpiY = Math.round(yPixelsPerMeter * 0.0254);
            return Math.min(dpiX, dpiY);
          }
        }
      } else if (this.extension === 'jpg' || this.extension === 'jpeg') {
        let offset = 2;
        while (offset < this.imageData.length) {
          if (this.imageData[offset] !== 0xff) break;
          const marker = this.imageData[offset + 1];
          if (marker === 0xe0) {
            const length = this.imageData.readUInt16BE(offset + 2);
            if (
              length >= 16 &&
              this.imageData.slice(offset + 4, offset + 9).toString('ascii') ===
                'JFIF\0'
            ) {
              const units = this.imageData[offset + 11];
              const xDensity = this.imageData.readUInt16BE(offset + 12);
              const yDensity = this.imageData.readUInt16BE(offset + 14);
              if (units === 1) return Math.min(xDensity, yDensity);
              if (units === 2)
                return Math.min(
                  Math.round(xDensity * 2.54),
                  Math.round(yDensity * 2.54)
                );
            }
            offset += 2 + length;
            continue;
          }
          offset += 2 + this.imageData.readUInt16BE(offset + 2);
        }
      }
    } catch (error) {
      defaultLogger.warn(
        `DPI detection failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    return;
  }

  isFloating(): boolean {
    return !!this.anchor || !!this.position;
  }

  floatTopLeft(marginTop = 0, marginLeft = 0): this {
    this.setPosition(
      { anchor: 'page', offset: marginLeft },
      { anchor: 'page', offset: marginTop }
    );
    this.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: true,
      relativeHeight: 251_658_240,
    });
    this.setWrap('square', 'bothSides');
    return this;
  }

  floatTopRight(marginTop = 0, marginRight = 0): this {
    this.setPosition(
      { anchor: 'page', alignment: 'right', offset: -marginRight },
      { anchor: 'page', offset: marginTop }
    );
    this.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: true,
      relativeHeight: 251_658_240,
    });
    this.setWrap('square', 'bothSides');
    return this;
  }

  floatCenter(): this {
    this.setPosition(
      { anchor: 'page', alignment: 'center' },
      { anchor: 'page', alignment: 'center' }
    );
    this.setAnchor({
      behindDoc: false,
      locked: false,
      layoutInCell: true,
      allowOverlap: true,
      relativeHeight: 251_658_240,
    });
    this.setWrap('square', 'bothSides');
    return this;
  }

  setBehindText(behind = true): this {
    if (this.anchor) {
      this.anchor.behindDoc = behind;
    } else {
      this.setAnchor({
        behindDoc: behind,
        locked: false,
        layoutInCell: true,
        allowOverlap: true,
        relativeHeight: 251_658_240,
      });
    }
    return this;
  }

  /**
   * Applies a black border around the image
   * @param thicknessPt Border thickness in points (default: 2pt)
   * @returns This image for chaining
   *
   * Note: effectExtent is set to accommodate the border width so it renders
   * properly without being clipped. The border is drawn centered on the image
   * edge, so half the border width extends outside the image bounds.
   */
  setBorder(thicknessPt = 2): this {
    this.border = { width: thicknessPt };

    // Calculate space needed for border (half-width on each side)
    // 1 point = 12700 EMUs - border is drawn centered on the edge
    const borderEmu = thicknessPt * 12_700;
    const halfBorderEmu = Math.ceil(borderEmu / 2);

    // Ensure effectExtent has at least enough space for the border
    if (!this.effectExtent) {
      this.effectExtent = { left: 0, top: 0, right: 0, bottom: 0 };
    }
    this.effectExtent.left = Math.max(this.effectExtent.left, halfBorderEmu);
    this.effectExtent.top = Math.max(this.effectExtent.top, halfBorderEmu);
    this.effectExtent.right = Math.max(this.effectExtent.right, halfBorderEmu);
    this.effectExtent.bottom = Math.max(
      this.effectExtent.bottom,
      halfBorderEmu
    );

    return this;
  }

  /**
   * Removes the border from the image
   * @returns This image for chaining
   */
  removeBorder(): this {
    this.border = undefined;
    return this;
  }

  /**
   * @deprecated Use setBorder() instead. This method will be removed in a future version.
   * Applies a 2-point black border around the image.
   * @returns This image for chaining
   */
  applyTwoPixelBlackBorder(): this {
    return this.setBorder(2);
  }

  toXML(): XMLElement {
    const isFloating = this.isFloating();

    // Common elements - must include wp: namespace prefix
    const extent = XMLBuilder.wp('extent', {
      cx: this.width.toString(),
      cy: this.height.toString(),
    });

    // Blip with required cstate attribute and optional effects
    const blipChildren: XMLElement[] = [];

    // Add luminance effect for brightness/contrast (per ECMA-376 §20.1.8.43)
    if (
      this.effects?.brightness !== undefined ||
      this.effects?.contrast !== undefined
    ) {
      const lumAttrs: Record<string, string> = {};
      if (this.effects.brightness !== undefined) {
        lumAttrs.bright = Math.round(this.effects.brightness * 1000).toString();
      }
      if (this.effects.contrast !== undefined) {
        lumAttrs.contrast = Math.round(this.effects.contrast * 1000).toString();
      }
      blipChildren.push(XMLBuilder.aSelf('lum', lumAttrs));
    }

    // Add grayscale effect (per ECMA-376 §20.1.8.37)
    if (this.effects?.grayscale) {
      blipChildren.push(XMLBuilder.aSelf('grayscl'));
    }

    const blip =
      blipChildren.length > 0
        ? XMLBuilder.a(
            'blip',
            { 'r:embed': this.relationshipId, cstate: 'none' },
            blipChildren
          )
        : XMLBuilder.a('blip', {
            'r:embed': this.relationshipId,
            cstate: 'none',
          });

    // Transform element with offset and extent (required by Word)
    // Rotation is stored as 60000ths of a degree in OOXML (ECMA-376 §20.1.7.6)
    const xfrmAttrs =
      this.rotation > 0
        ? { rot: Math.round(this.rotation * 60_000).toString() }
        : undefined;
    const xfrm = XMLBuilder.a('xfrm', xfrmAttrs, [
      XMLBuilder.a('off', { x: '0', y: '0' }),
      XMLBuilder.a('ext', {
        cx: this.width.toString(),
        cy: this.height.toString(),
      }),
    ]);

    const spPrChildren: XMLElement[] = [xfrm];

    // Add preset geometry for rectangle with avLst
    spPrChildren.push(
      XMLBuilder.a('prstGeom', { prst: 'rect' }, [XMLBuilder.a('avLst')])
    );

    // Add border if set (Word-compatible structure)
    if (this.border) {
      // Add noFill element before the border line (required by Word)
      spPrChildren.push(XMLBuilder.a('noFill'));

      const ptToEmu = 12_700; // 1 point = 12700 EMUs (Word standard)
      const widthEmu = this.border.width * ptToEmu;

      // Simplified border structure matching Word's output
      const ln = XMLBuilder.a('ln', { w: widthEmu.toString() }, [
        XMLBuilder.a('solidFill', undefined, [
          XMLBuilder.a('schemeClr', { val: 'tx1' }), // Use scheme color like Word does
        ]),
      ]);
      spPrChildren.push(ln);
    }

    const graphicData = XMLBuilder.a(
      'graphicData',
      { uri: 'http://schemas.openxmlformats.org/drawingml/2006/picture' },
      [
        XMLBuilder.pic('pic', undefined, [
          XMLBuilder.pic('nvPicPr', undefined, [
            XMLBuilder.pic('cNvPr', { id: '0', name: '', descr: '' }),
            XMLBuilder.pic('cNvPicPr', undefined, [
              XMLBuilder.a('picLocks', {
                noChangeAspect: '1',
                noChangeArrowheads: '1',
              }),
            ]),
          ]),
          XMLBuilder.pic('blipFill', undefined, [
            blip,
            // Crop values are stored as percentages (0-100), serialized as per-mille (0-100000)
            XMLBuilder.a(
              'srcRect',
              this.crop
                ? {
                    l: Math.round(this.crop.left * 1000).toString(),
                    t: Math.round(this.crop.top * 1000).toString(),
                    r: Math.round(this.crop.right * 1000).toString(),
                    b: Math.round(this.crop.bottom * 1000).toString(),
                  }
                : undefined
            ),
            XMLBuilder.a('stretch', undefined, [XMLBuilder.a('fillRect')]),
          ]),
          XMLBuilder.pic('spPr', { bwMode: 'auto' }, spPrChildren),
        ]),
      ]
    );

    const graphic = XMLBuilder.a('graphic', undefined, [graphicData]);

    if (isFloating) {
      // Floating image (anchor)
      const positionHChildren: XMLElement[] = [];
      if (this.position?.horizontal.alignment) {
        positionHChildren.push(
          XMLBuilder.wp('align', undefined, [
            this.position.horizontal.alignment,
          ])
        );
      } else {
        positionHChildren.push(
          XMLBuilder.wp('posOffset', undefined, [
            (this.position?.horizontal.offset || 0).toString(),
          ])
        );
      }
      const positionH = XMLBuilder.wp(
        'positionH',
        { relativeFrom: this.position?.horizontal.anchor || 'page' },
        positionHChildren
      );

      const positionVChildren: XMLElement[] = [];
      if (this.position?.vertical.alignment) {
        positionVChildren.push(
          XMLBuilder.wp('align', undefined, [this.position.vertical.alignment])
        );
      } else {
        positionVChildren.push(
          XMLBuilder.wp('posOffset', undefined, [
            (this.position?.vertical.offset || 0).toString(),
          ])
        );
      }
      const positionV = XMLBuilder.wp(
        'positionV',
        { relativeFrom: this.position?.vertical.anchor || 'page' },
        positionVChildren
      );

      // Effect extent for floating images (required by Word)
      const floatEffectExt = this.effectExtent || {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      };
      const effectExtentElement = XMLBuilder.wp('effectExtent', {
        t: floatEffectExt.top.toString(),
        r: floatEffectExt.right.toString(),
        b: floatEffectExt.bottom.toString(),
        l: floatEffectExt.left.toString(),
      });

      const anchorChildren = [
        positionH,
        positionV,
        extent,
        effectExtentElement,
      ];

      if (this.wrap) {
        const wrapAttrs: Record<string, any> = {};
        if (this.wrap.distanceTop !== undefined)
          wrapAttrs.distT = this.wrap.distanceTop;
        if (this.wrap.distanceBottom !== undefined)
          wrapAttrs.distB = this.wrap.distanceBottom;
        if (this.wrap.distanceLeft !== undefined)
          wrapAttrs.distL = this.wrap.distanceLeft;
        if (this.wrap.distanceRight !== undefined)
          wrapAttrs.distR = this.wrap.distanceRight;
        if (this.wrap.side) wrapAttrs.wrapText = this.wrap.side;

        let wrapElementName: string;
        switch (this.wrap.type) {
          case 'square':
            wrapElementName = 'wrapSquare';
            break;
          case 'tight':
            wrapElementName = 'wrapTight';
            break;
          case 'through':
            wrapElementName = 'wrapThrough';
            break;
          case 'topAndBottom':
            wrapElementName = 'wrapTopAndBottom';
            break;
          case 'none':
            wrapElementName = 'wrapNone';
            break;
          default:
            wrapElementName = 'wrapSquare';
        }

        anchorChildren.push(XMLBuilder.wp(wrapElementName, wrapAttrs));
      }

      anchorChildren.push(
        XMLBuilder.wp('docPr', {
          id: this.docPrId,
          name: this.name,
          descr: this.description,
        })
      );
      anchorChildren.push(graphic);

      return XMLBuilder.w('drawing', undefined, [
        XMLBuilder.wp(
          'anchor',
          {
            behindDoc: this.anchor?.behindDoc ? 1 : 0,
            locked: this.anchor?.locked ? 1 : 0,
            layoutInCell: this.anchor?.layoutInCell ? 1 : 0,
            allowOverlap: this.anchor?.allowOverlap ? 1 : 0,
            relativeHeight: this.anchor?.relativeHeight,
          },
          anchorChildren
        ),
      ]);
    }
    // Inline image - requires specific attributes and elements for Word compatibility
    const effectExt = this.effectExtent || {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };

    return XMLBuilder.w('drawing', undefined, [
      XMLBuilder.wp(
        'inline',
        {
          distT: '0',
          distB: '0',
          distL: '0',
          distR: '0',
        },
        [
          extent,
          XMLBuilder.wp('effectExtent', {
            t: effectExt.top.toString(),
            r: effectExt.right.toString(),
            b: effectExt.bottom.toString(),
            l: effectExt.left.toString(),
          }),
          XMLBuilder.wp('docPr', {
            id: this.docPrId.toString(),
            name: '',
            descr: '',
            title: '',
          }),
          XMLBuilder.wp('cNvGraphicFramePr', undefined, [
            XMLBuilder.a('graphicFrameLocks', {
              'xmlns:a':
                'http://schemas.openxmlformats.org/drawingml/2006/main',
              noChangeAspect: '1',
            }),
          ]),
          graphic,
        ]
      ),
    ]);
  }
}
