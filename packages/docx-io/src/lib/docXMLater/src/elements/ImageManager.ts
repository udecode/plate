/**
 * ImageManager - Manages images in a document
 *
 * Handles image tracking, unique filename generation, and coordination
 * with the RelationshipManager for image relationships.
 */

import type { Image } from './Image';
import { defaultLogger } from '../utils/logger';

/**
 * Image file entry
 */
interface ImageEntry {
  /** The Image object */
  image: Image;
  /** Filename in media folder (e.g., 'image1.png') */
  filename: string;
  /** Relationship ID */
  relationshipId: string;
  /** Document property ID (for DrawingML) */
  docPrId: number;
}

/**
 * Image manager options
 */
export interface ImageManagerOptions {
  /** Maximum number of images allowed. Default: 1000 */
  maxImageCount?: number;
  /** Maximum total size of all images in MB. Default: 100 */
  maxTotalImageSizeMB?: number;
  /** Maximum size of a single image in MB. Default: 20 */
  maxSingleImageSizeMB?: number;
}

/**
 * Manages all images in a document
 */
export class ImageManager {
  private images: Map<Image, ImageEntry>;
  private imagesByRelId: Map<string, ImageEntry>; // Track by relationship ID (Issue #12 fix)
  private nextImageNumber: number;
  private nextDocPrId: number;
  private maxImageCount: number;
  private maxTotalImageSizeBytes: number;
  private maxSingleImageSizeBytes: number;

  /**
   * Creates a new image manager
   * @param options Image manager options
   */
  constructor(options: ImageManagerOptions = {}) {
    this.images = new Map();
    this.imagesByRelId = new Map(); // Issue #12 fix
    this.nextImageNumber = 1;
    this.nextDocPrId = 1;
    // Increased from 20 to 1000 to support production documents with many images
    this.maxImageCount = options.maxImageCount ?? 1000;
    this.maxTotalImageSizeBytes =
      (options.maxTotalImageSizeMB ?? 100) * 1024 * 1024;
    this.maxSingleImageSizeBytes =
      (options.maxSingleImageSizeMB ?? 20) * 1024 * 1024;
  }

  /**
   * Registers an image with the manager
   * @param image The image to register
   * @param relationshipId The relationship ID for this image
   * @param originalFilename Optional original filename from the source document.
   *   When provided (during parsing), preserves the original filename to maintain
   *   consistency with relationship targets. When not provided (adding new images),
   *   generates a new sequential filename.
   * @returns The filename assigned to this image
   * @throws {Error} If image limits are exceeded
   *
   * **Issue #12 Fix:** Reuses filename for images with same relationship ID
   * to prevent duplicating files in media folder during save.
   * However, each image occurrence gets its own entry to preserve dimensions
   * (Word allows same image file displayed at different sizes via wp:extent).
   */
  registerImage(
    image: Image,
    relationshipId: string,
    originalFilename?: string
  ): string {
    // Check if already registered by object reference (exact same object)
    const existing = this.images.get(image);
    if (existing) {
      return existing.filename;
    }

    // Issue #12 fix: Reuse FILENAME for same rId, but create separate entry
    // This prevents duplicate files in media folder while preserving dimensions
    const existingByRelId = this.imagesByRelId.get(relationshipId);

    // Filename priority:
    // 1. Existing filename for same rId (prevents duplicates)
    // 2. Original filename from source document (preserves round-trip integrity)
    // 3. Generate new sequential filename (for newly added images)
    const filename = existingByRelId
      ? existingByRelId.filename
      : originalFilename ||
        `image${this.nextImageNumber++}.${image.getExtension()}`;

    // Validate image count limit
    if (this.images.size >= this.maxImageCount) {
      throw new Error(
        `Cannot add image: Maximum image count (${this.maxImageCount}) exceeded. ` +
          'Consider:\n' +
          '  - Reducing the number of images\n' +
          '  - Increasing maxImageCount in DocumentOptions\n' +
          '  - Splitting into multiple documents'
      );
    }

    // Validate single image size (if data is loaded)
    try {
      const imageData = image.getImageData();
      const imageSizeMB = imageData.length / (1024 * 1024);

      if (imageData.length > this.maxSingleImageSizeBytes) {
        throw new Error(
          `Image size (${imageSizeMB.toFixed(1)}MB) exceeds maximum single image size ` +
            `(${(this.maxSingleImageSizeBytes / (1024 * 1024)).toFixed(0)}MB). ` +
            'Consider:\n' +
            '  - Compressing the image\n' +
            '  - Resizing to lower resolution\n' +
            '  - Converting to a more efficient format (e.g., JPEG)\n' +
            '  - Increasing maxSingleImageSizeMB in DocumentOptions'
        );
      }

      // Validate total size after adding this image
      const currentTotalSize = this.getTotalSize();
      const newTotalSize = currentTotalSize + imageData.length;
      const newTotalSizeMB = newTotalSize / (1024 * 1024);

      if (newTotalSize > this.maxTotalImageSizeBytes) {
        throw new Error(
          `Total image size (${newTotalSizeMB.toFixed(1)}MB) would exceed maximum ` +
            `(${(this.maxTotalImageSizeBytes / (1024 * 1024)).toFixed(0)}MB) after adding this image. ` +
            'Consider:\n' +
            '  - Compressing existing images\n' +
            '  - Removing unnecessary images\n' +
            '  - Increasing maxTotalImageSizeMB in DocumentOptions\n' +
            '  - Splitting into multiple documents'
        );
      }
    } catch (error) {
      // Image data not loaded yet - validation will happen during save
      // This is acceptable for lazy-loaded images
      if (error instanceof Error && !error.message.includes('not loaded')) {
        throw error; // Re-throw size limit errors
      }
    }

    // Assign docPr ID
    const docPrId = this.nextDocPrId++;
    image.setDocPrId(docPrId);

    // Set relationship ID
    image.setRelationshipId(relationshipId);

    // Store entry (each image occurrence gets its own entry)
    const entry: ImageEntry = {
      image,
      filename,
      relationshipId,
      docPrId,
    };

    this.images.set(image, entry);

    // Only store first image for each rId (used for filename reuse)
    if (!existingByRelId) {
      this.imagesByRelId.set(relationshipId, entry);
    }

    return filename;
  }

  /**
   * Gets the filename for an image
   * @param image The image
   * @returns The filename, or undefined if not registered
   */
  getFilename(image: Image): string | undefined {
    return this.images.get(image)?.filename;
  }

  /**
   * Gets the relationship ID for an image
   * @param image The image
   * @returns The relationship ID, or undefined if not registered
   */
  getRelationshipId(image: Image): string | undefined {
    return this.images.get(image)?.relationshipId;
  }

  /**
   * Gets all registered images
   * @returns Array of image entries
   */
  getAllImages(): ImageEntry[] {
    return Array.from(this.images.values());
  }

  /**
   * Gets the number of images
   * @returns Number of registered images
   */
  getImageCount(): number {
    return this.images.size;
  }

  /**
   * Checks if an image is registered
   * @param image The image
   * @returns True if registered
   */
  hasImage(image: Image): boolean {
    return this.images.has(image);
  }

  /**
   * Gets the MIME type for an image extension
   * @param extension File extension (without dot)
   * @returns MIME type
   */
  static getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
      tif: 'image/tiff',
    };

    return mimeTypes[extension.toLowerCase()] || 'image/png';
  }

  /**
   * Loads data for all images with controlled concurrency
   * Call this before saving to ensure all image data is available
   * @param concurrency Maximum number of images to load simultaneously (default: 5)
   * @param onProgress Optional callback for progress tracking (loaded, total)
   */
  async loadAllImageData(
    concurrency = 5,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    const images = Array.from(this.images.values());
    const total = images.length;

    if (total === 0) {
      return;
    }

    // Validate concurrency
    if (concurrency < 1 || concurrency > 50 || !Number.isInteger(concurrency)) {
      throw new Error('Concurrency must be an integer between 1 and 50');
    }

    let loaded = 0;

    // Load images in batches to control concurrency
    for (let i = 0; i < total; i += concurrency) {
      const batch = images.slice(i, Math.min(i + concurrency, total));

      // Load batch in parallel
      await Promise.all(
        batch.map(async (entry) => {
          try {
            await entry.image.ensureDataLoaded();
            loaded++;

            // Report progress
            if (onProgress) {
              onProgress(loaded, total);
            }
          } catch (error) {
            // Log error but continue loading other images
            defaultLogger.warn(
              `Failed to load image data: ${error instanceof Error ? error.message : error}`
            );
            loaded++; // Still count as processed

            if (onProgress) {
              onProgress(loaded, total);
            }
          }
        })
      );
    }
  }

  /**
   * Releases data for all images
   * Call this after saving to free memory
   */
  releaseAllImageData(): void {
    for (const entry of this.images.values()) {
      entry.image.releaseData();
    }
  }

  /**
   * Gets the total size of all loaded image data
   * Only counts images that are currently loaded in memory
   * @returns Total size in bytes
   */
  getTotalSize(): number {
    let totalSize = 0;
    for (const entry of this.images.values()) {
      try {
        const data = entry.image.getImageData();
        totalSize += data.length;
      } catch {
        // Image not loaded - skip (don't count unloaded images)
      }
    }
    return totalSize;
  }

  /**
   * Gets the total size of all images (loads them if needed)
   * Use this for accurate size estimation before saving
   * @returns Total size in bytes
   */
  async getTotalSizeAsync(): Promise<number> {
    let totalSize = 0;
    for (const entry of this.images.values()) {
      try {
        const data = await entry.image.getImageDataAsync();
        totalSize += data.length;
      } catch {
        // Image loading failed - skip
      }
    }
    return totalSize;
  }

  /**
   * Gets statistics about images
   * @returns Object with image statistics
   */
  getStats(): {
    count: number;
    totalSize: number;
    averageSize: number;
  } {
    const count = this.getImageCount();
    const totalSize = this.getTotalSize();
    return {
      count,
      totalSize,
      averageSize: count > 0 ? Math.round(totalSize / count) : 0,
    };
  }

  /**
   * Initializes nextImageNumber from already-loaded images
   * Call after parsing to prevent filename collisions
   *
   * **Issue #12 Fix:** Prevents collisions when adding new images after load
   */
  initializeFromLoadedImages(): void {
    let maxNumber = 0;

    for (const entry of this.images.values()) {
      // Extract number from filename (e.g., "image5.png" → 5)
      const match = entry.filename.match(/image(\d+)\./);
      if (match && match[1]) {
        const num = Number.parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    // Start numbering after highest existing number
    this.nextImageNumber = maxNumber + 1;
  }

  /**
   * Clears all images
   */
  clear(): this {
    this.images.clear();
    this.imagesByRelId.clear(); // Issue #12 fix
    this.nextImageNumber = 1;
    this.nextDocPrId = 1;
    return this;
  }

  /**
   * Creates a new image manager
   * @param options Image manager options
   */
  static create(options?: ImageManagerOptions): ImageManager {
    return new ImageManager(options);
  }
}
