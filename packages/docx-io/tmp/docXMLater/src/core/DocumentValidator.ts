/**
 * DocumentValidator - Handles validation of document properties and content
 * Prevents security issues and data corruption
 */

import { Paragraph } from '../elements/Paragraph';
import { Table } from '../elements/Table';
import { TableOfContentsElement } from '../elements/TableOfContentsElement';
import { StructuredDocumentTag } from '../elements/StructuredDocumentTag';
import { ImageManager } from '../elements/ImageManager';
import { DocumentProperties } from './Document';
import { LIMITS } from '../constants/limits';
import { defaultLogger } from '../utils/logger';
import * as v8 from 'v8';

/**
 * Memory validation options
 */
export interface MemoryOptions {
  /** Maximum memory usage percentage (0-100) before throwing error. Default: 80 */
  maxMemoryUsagePercent?: number;
  /** Maximum absolute RSS (Resident Set Size) in MB. Default: 2048 (2GB) */
  maxRssMB?: number;
  /** Enable absolute RSS limit checking. Default: true */
  useAbsoluteLimit?: boolean;
}

/**
 * Body element types
 */
type BodyElement = Paragraph | Table | TableOfContentsElement | StructuredDocumentTag;

/**
 * Size estimation result
 */
export interface SizeEstimate {
  paragraphs: number;
  tables: number;
  images: number;
  estimatedXmlBytes: number;
  imageBytes: number;
  totalEstimatedBytes: number;
  totalEstimatedMB: number;
  warning?: string;
}

/**
 * DocumentValidator handles all validation logic
 */
export class DocumentValidator {
  private maxMemoryUsagePercent: number;
  private maxRssMB: number;
  private useAbsoluteLimit: boolean;

  constructor(maxMemoryUsagePercent: number = 80, options: MemoryOptions = {}) {
    // Validate maxMemoryUsagePercent
    const memoryPercent = options.maxMemoryUsagePercent ?? maxMemoryUsagePercent;
    if (
      memoryPercent < 1 ||
      memoryPercent > 100 ||
      !Number.isFinite(memoryPercent)
    ) {
      throw new Error('maxMemoryUsagePercent must be between 1 and 100');
    }
    this.maxMemoryUsagePercent = memoryPercent;
    this.maxRssMB = options.maxRssMB ?? 2048; // Default 2GB
    this.useAbsoluteLimit = options.useAbsoluteLimit ?? true;
  }

  /**
   * Validates and sanitizes document properties
   * Prevents injection attacks and excessive memory usage
   * @param properties - Properties to validate
   * @returns Validated and sanitized properties
   */
  static validateProperties(properties: DocumentProperties): DocumentProperties {
    const validated: DocumentProperties = {};

    // Validate and truncate string properties
    if (properties.title !== undefined) {
      if (typeof properties.title !== 'string') {
        throw new Error('DocumentProperties.title must be a string');
      }
      if (properties.title.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.title exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.title = properties.title;
    }

    if (properties.subject !== undefined) {
      if (typeof properties.subject !== 'string') {
        throw new Error('DocumentProperties.subject must be a string');
      }
      if (properties.subject.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.subject exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.subject = properties.subject;
    }

    if (properties.creator !== undefined) {
      if (typeof properties.creator !== 'string') {
        throw new Error('DocumentProperties.creator must be a string');
      }
      if (properties.creator.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.creator exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.creator = properties.creator;
    }

    if (properties.keywords !== undefined) {
      if (typeof properties.keywords !== 'string') {
        throw new Error('DocumentProperties.keywords must be a string');
      }
      if (properties.keywords.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.keywords exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.keywords = properties.keywords;
    }

    if (properties.description !== undefined) {
      if (typeof properties.description !== 'string') {
        throw new Error('DocumentProperties.description must be a string');
      }
      if (properties.description.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.description exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.description = properties.description;
    }

    if (properties.lastModifiedBy !== undefined) {
      if (typeof properties.lastModifiedBy !== 'string') {
        throw new Error('DocumentProperties.lastModifiedBy must be a string');
      }
      if (properties.lastModifiedBy.length > LIMITS.MAX_STRING_LENGTH) {
        throw new Error(
          `DocumentProperties.lastModifiedBy exceeds maximum length of ${LIMITS.MAX_STRING_LENGTH} characters`
        );
      }
      validated.lastModifiedBy = properties.lastModifiedBy;
    }

    // Validate revision number
    if (properties.revision !== undefined) {
      if (
        typeof properties.revision !== 'number' ||
        !Number.isInteger(properties.revision)
      ) {
        throw new Error('DocumentProperties.revision must be an integer');
      }
      if (properties.revision < 0 || properties.revision > LIMITS.MAX_REVISION) {
        throw new Error(
          `DocumentProperties.revision must be between 0 and ${LIMITS.MAX_REVISION}`
        );
      }
      validated.revision = properties.revision;
    }

    // Validate dates
    if (properties.created !== undefined) {
      if (!(properties.created instanceof Date)) {
        throw new Error('DocumentProperties.created must be a Date object');
      }
      if (!Number.isFinite(properties.created.getTime())) {
        throw new Error('DocumentProperties.created is an invalid date');
      }
      validated.created = properties.created;
    }

    if (properties.modified !== undefined) {
      if (!(properties.modified instanceof Date)) {
        throw new Error('DocumentProperties.modified must be a Date object');
      }
      if (!Number.isFinite(properties.modified.getTime())) {
        throw new Error('DocumentProperties.modified is an invalid date');
      }
      validated.modified = properties.modified;
    }

    return validated;
  }

  /**
   * Validates that the document has meaningful content before saving
   * Warns if the document appears to be empty or corrupted
   */
  validateBeforeSave(bodyElements: BodyElement[]): void {
    const paragraphs = bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );

    if (paragraphs.length === 0) {
      defaultLogger.warn(
        '\nDocXML Save Warning:\n' +
          'Document has no paragraphs. You are saving an empty document.\n'
      );
      return;
    }

    // Count runs with text
    let totalRuns = 0;
    let emptyRuns = 0;

    for (const para of paragraphs) {
      const runs = para.getRuns();
      totalRuns += runs.length;

      for (const run of runs) {
        if (run.getText().length === 0) {
          emptyRuns++;
        }
      }
    }

    if (totalRuns > 0) {
      const emptyPercentage = (emptyRuns / totalRuns) * 100;

      if (emptyPercentage > 90 && emptyRuns > 10) {
        defaultLogger.warn(
          '\nDocXML Save Warning:\n' +
            `You are about to save a document where ${emptyRuns} out of ${totalRuns} runs (${emptyPercentage.toFixed(1)}%) are empty.\n` +
            'This may result in a document with no visible text content.\n' +
            'If this is unintentional, please review the document before saving.\n'
        );
      }
    }
  }

  /**
   * Checks current memory usage and throws if above threshold
   * Prevents out-of-memory errors by failing early
   * Uses both heap percentage and absolute RSS limits for better accuracy
   * @throws {Error} If memory usage exceeds configured limits
   */
  checkMemoryThreshold(): void {
    const { heapUsed, external, rss } = process.memoryUsage();
    const heapStats = v8.getHeapStatistics();
    const heapLimit = heapStats.heap_size_limit; // Actual max heap (typically 4GB on 64-bit)

    // Calculate heap usage percentage against the actual limit, not currently allocated
    const heapPercent = (heapUsed / heapLimit) * 100;
    const heapMB = heapUsed / (1024 * 1024);
    const heapLimitMB = heapLimit / (1024 * 1024);

    // Calculate RSS (Resident Set Size - actual memory used by process)
    const rssMB = rss / (1024 * 1024);
    const externalMB = external / (1024 * 1024);

    // Check heap percentage (protects against heap fragmentation)
    const heapExceeded = heapPercent > this.maxMemoryUsagePercent;

    // Check absolute RSS limit (protects against excessive total memory)
    const rssExceeded = this.useAbsoluteLimit && rssMB > this.maxRssMB;

    // Only throw if BOTH conditions are true (avoids false positives)
    if (heapExceeded && rssExceeded) {
      throw new Error(
        `Memory usage critical:\n` +
        `  Heap: ${heapMB.toFixed(0)}MB / ${heapLimitMB.toFixed(0)}MB (${heapPercent.toFixed(1)}%)\n` +
        `  RSS: ${rssMB.toFixed(0)}MB (limit: ${this.maxRssMB}MB)\n` +
        `  External: ${externalMB.toFixed(0)}MB\n` +
        `Cannot process document safely. Consider:\n` +
        `  - Reducing document size (remove/compress images)\n` +
        `  - Splitting into multiple documents\n` +
        `  - Increasing memory limits in DocumentOptions\n` +
        `  - Increasing Node.js heap size (--max-old-space-size)`
      );
    }

    // Warn if only heap exceeded (might be temporary fragmentation)
    if (heapExceeded && !rssExceeded && this.useAbsoluteLimit) {
      defaultLogger.warn(
        `DocXML Memory Warning: Heap usage high (${heapPercent.toFixed(1)}%) ` +
        `but RSS (${rssMB.toFixed(0)}MB) is below limit. ` +
        `This might be temporary heap fragmentation.`
      );
    }
  }

  /**
   * Estimates the size of the document
   * Provides breakdown by component and warnings if size is too large
   * @returns Size estimation with breakdown and optional warning
   */
  estimateSize(bodyElements: BodyElement[], imageManager: ImageManager): SizeEstimate {
    // Count elements
    const paragraphs = bodyElements.filter(
      (el): el is Paragraph => el instanceof Paragraph
    );
    const tables = bodyElements.filter((el): el is Table => el instanceof Table);
    const paragraphCount = paragraphs.length;
    const tableCount = tables.length;
    const imageCount = imageManager.getImageCount();

    // Estimate XML size using documented constants
    const estimatedXml = paragraphCount * LIMITS.BYTES_PER_PARAGRAPH +
                         tableCount * LIMITS.BYTES_PER_TABLE +
                         LIMITS.BASE_STRUCTURE_BYTES;

    // Get actual image sizes
    const imageBytes = imageManager.getTotalSize();

    // Total estimate
    const totalBytes = estimatedXml + imageBytes;
    const totalMB = totalBytes / (1024 * 1024);

    // Use documented threshold constants
    let warning: string | undefined;

    if (totalMB > LIMITS.ERROR_SIZE_MB) {
      warning =
        `Document size (${totalMB.toFixed(1)}MB) exceeds recommended maximum of ${LIMITS.ERROR_SIZE_MB}MB. ` +
        `This may cause memory issues. Consider splitting into multiple documents or optimizing images.`;
    } else if (totalMB > LIMITS.WARNING_SIZE_MB) {
      warning =
        `Document size (${totalMB.toFixed(1)}MB) exceeds ${LIMITS.WARNING_SIZE_MB}MB. ` +
        `Large documents may take longer to process and use significant memory.`;
    }

    return {
      paragraphs: paragraphCount,
      tables: tableCount,
      images: imageCount,
      estimatedXmlBytes: estimatedXml,
      imageBytes,
      totalEstimatedBytes: totalBytes,
      totalEstimatedMB: parseFloat(totalMB.toFixed(2)),
      warning,
    };
  }

  /**
   * Gets size statistics for the document
   * @returns Size statistics
   */
  getSizeStats(bodyElements: BodyElement[], imageManager: ImageManager): {
    elements: { paragraphs: number; tables: number; images: number };
    size: { xml: string; images: string; total: string };
    warnings: string[];
  } {
    const estimate = this.estimateSize(bodyElements, imageManager);
    const warnings: string[] = [];

    if (estimate.warning) {
      warnings.push(estimate.warning);
    }

    // Format sizes for display
    const formatBytes = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return {
      elements: {
        paragraphs: estimate.paragraphs,
        tables: estimate.tables,
        images: estimate.images,
      },
      size: {
        xml: formatBytes(estimate.estimatedXmlBytes),
        images: formatBytes(estimate.imageBytes),
        total: formatBytes(estimate.totalEstimatedBytes),
      },
      warnings,
    };
  }
}
