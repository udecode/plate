/**
 * ZipWriter - Handles writing ZIP archives (DOCX files)
 *
 * DOCX Compliance Notes:
 * - [Content_Types].xml MUST be the first entry in the ZIP
 * - [Content_Types].xml MUST use STORE compression (uncompressed)
 * - File order matters for Microsoft Word compatibility
 */

import JSZip from 'jszip';
import { promises as fs } from 'fs';
import type { ZipFile, FileMap, SaveOptions, AddFileOptions } from './types';
import { FileOperationError } from './errors';
import { validateDocxStructure, normalizePath } from '../utils/validation';

/**
 * Handles writing operations on ZIP archives with DOCX-specific compliance
 */
export class ZipWriter {
  private zip: JSZip;
  private files: FileMap = new Map();

  constructor() {
    this.zip = new JSZip();
  }

  /**
   * Adds a file to the archive
   * @param filePath - Path where the file will be stored in the archive
   * @param content - File content (string or Buffer)
   * @param options - Options for adding the file
   *
   * **Encoding Note:**
   * - String content is always encoded as UTF-8 per DOCX/OpenXML standard
   * - Buffer content is stored as-is (should already be UTF-8 encoded for text)
   * - XML files must use UTF-8 encoding as specified in their XML declaration
   *
   * **DOCX Compliance:**
   * - [Content_Types].xml is automatically set to STORE compression
   */
  /**
   * Validates a file path for security issues
   * @param path - Normalized file path
   * @throws {Error} If path contains path traversal or other security issues
   * @private
   */
  private validatePathSecurity(path: string): void {
    // Check for path traversal attacks
    if (path.includes('..')) {
      throw new Error(
        `Security error: Path "${path}" contains path traversal sequence "..". ` +
          'This could be an attempt to write files outside the archive.'
      );
    }

    // Check for absolute paths (even after normalization)
    if (path.startsWith('/') || /^[a-zA-Z]:/.test(path)) {
      throw new Error(
        `Security error: Path "${path}" is an absolute path. ` +
          'Only relative paths are allowed in ZIP archives.'
      );
    }

    // Check for null bytes (can be used to truncate paths)
    if (path.includes('\0')) {
      throw new Error(
        `Security error: Path "${path}" contains null byte. ` +
          'This could be an attempt to exploit path handling.'
      );
    }

    // Check for excessively long paths (potential DoS)
    const MAX_PATH_LENGTH = 260; // Windows MAX_PATH
    if (path.length > MAX_PATH_LENGTH) {
      throw new Error(
        `Security error: Path "${path}" exceeds maximum length of ${MAX_PATH_LENGTH} characters.`
      );
    }
  }

  addFile(
    filePath: string,
    content: string | Buffer,
    options: AddFileOptions = {}
  ): void {
    const {
      binary = Buffer.isBuffer(content),
      compression = 6,
      date = new Date(),
    } = options;

    const normalizedPath = normalizePath(filePath);

    // Security: Validate path for traversal and other attacks
    this.validatePathSecurity(normalizedPath);

    // Convert string content to UTF-8 Buffer if not already binary
    // This ensures consistent UTF-8 encoding regardless of system locale
    let processedContent = content;
    if (typeof content === 'string') {
      // Explicitly encode string as UTF-8 Buffer
      processedContent = Buffer.from(content, 'utf8');
    }

    // DOCX REQUIREMENT: [Content_Types].xml MUST be uncompressed (STORE)
    const isContentTypes = normalizedPath === '[Content_Types].xml';
    const useCompression = isContentTypes
      ? 'STORE'
      : compression > 0
        ? 'DEFLATE'
        : 'STORE';
    const compressionLevel = isContentTypes ? 0 : compression;

    // For text content (XML), this ensures UTF-8 encoding is preserved
    this.zip.file(normalizedPath, processedContent, {
      binary: true, // Always treat as binary since we're using Buffers
      compression: useCompression,
      compressionOptions: {
        level: compressionLevel,
      },
      date,
    });

    // Store in our file map
    // IMPORTANT: Store the PROCESSED content (Buffer), not the original
    // This ensures consistency with what was added to this.zip and prevents
    // double UTF-8 conversion in toBuffer() method (Issue #1)
    this.files.set(normalizedPath, {
      path: normalizedPath,
      content: processedContent, // Store Buffer, not original string
      isBinary: binary,
      size: processedContent.length, // Buffer.length is always correct (Issue #3)
      date,
    });
  }

  /**
   * Adds multiple files to the archive
   * @param files - Map of file paths to contents
   * @param options - Options for adding files
   */
  addFiles(files: FileMap, options: AddFileOptions = {}): void {
    for (const [path, file] of files) {
      this.addFile(path, file.content, {
        ...options,
        binary: file.isBinary,
        date: file.date,
      });
    }
  }

  /**
   * Removes a file from the archive
   * @param filePath - Path to the file to remove
   * @returns True if the file was removed, false if it didn't exist
   */
  removeFile(filePath: string): boolean {
    const normalizedPath = normalizePath(filePath);

    // Remove from JSZip
    const zipFile = this.zip.file(normalizedPath);
    if (zipFile) {
      this.zip.remove(normalizedPath);
      this.files.delete(normalizedPath);
      return true;
    }

    return false;
  }

  /**
   * Checks if a file exists in the archive
   * @param filePath - Path to check
   * @returns True if the file exists
   */
  hasFile(filePath: string): boolean {
    const normalizedPath = normalizePath(filePath);
    return this.files.has(normalizedPath);
  }

  /**
   * Gets a file from the archive
   * @param filePath - Path to the file
   * @returns The file data, or undefined if not found
   */
  getFile(filePath: string): ZipFile | undefined {
    const normalizedPath = normalizePath(filePath);
    return this.files.get(normalizedPath);
  }

  /**
   * Gets all files in the archive
   * @returns Map of file paths to file data
   */
  getAllFiles(): FileMap {
    return new Map(this.files);
  }

  /**
   * Gets a list of all file paths in the archive
   * @returns Array of file paths
   */
  getFilePaths(): string[] {
    return Array.from(this.files.keys());
  }

  /**
   * Validates the DOCX structure before saving
   * @throws {MissingRequiredFileError} If required files are missing
   */
  validate(): void {
    const filePaths = this.getFilePaths();
    validateDocxStructure(filePaths);
  }

  /**
   * Sorts files according to DOCX best practices
   * Microsoft Word expects files in a specific order for optimal compatibility
   *
   * @returns Sorted array of file paths
   *
   * **DOCX File Order (CRITICAL):**
   * 1. [Content_Types].xml - MUST be first
   * 2. _rels/.rels - Root relationships
   * 3. docProps/* - Document properties
   * 4. word/_rels/document.xml.rels - Document relationships
   * 5. word/document.xml - Main document
   * 6. word/* - Other word files (styles, numbering, etc.)
   * 7. Everything else - Media, custom XML, etc.
   */
  private getSortedFilePaths(): string[] {
    const paths = Array.from(this.files.keys());

    return paths.sort((a, b) => {
      // Priority 1: [Content_Types].xml MUST be first (CRITICAL for MS Word)
      if (a === '[Content_Types].xml') return -1;
      if (b === '[Content_Types].xml') return 1;

      // Priority 2: Root relationships
      if (a === '_rels/.rels') return -1;
      if (b === '_rels/.rels') return 1;

      // Priority 3: Document properties
      const aIsDocProps = a.startsWith('docProps/');
      const bIsDocProps = b.startsWith('docProps/');
      if (aIsDocProps && !bIsDocProps) return -1;
      if (!aIsDocProps && bIsDocProps) return 1;

      // Priority 4: word/_rels/document.xml.rels
      if (a === 'word/_rels/document.xml.rels') return -1;
      if (b === 'word/_rels/document.xml.rels') return 1;

      // Priority 5: word/document.xml
      if (a === 'word/document.xml') return -1;
      if (b === 'word/document.xml') return 1;

      // Priority 6: Other word/ folder files (before relationships)
      const aIsWordRels = a.startsWith('word/_rels/');
      const bIsWordRels = b.startsWith('word/_rels/');
      const aIsWord = a.startsWith('word/') && !aIsWordRels;
      const bIsWord = b.startsWith('word/') && !bIsWordRels;

      if (aIsWord && !bIsWord && !bIsWordRels) return -1;
      if (!aIsWord && bIsWord && !aIsWordRels) return 1;

      // Priority 7: word/_rels/ files
      if (aIsWordRels && !bIsWordRels) return -1;
      if (!aIsWordRels && bIsWordRels) return 1;

      // Alphabetical for same priority
      return a.localeCompare(b);
    });
  }

  /**
   * Generates the ZIP archive as a buffer
   * @param options - Save options
   * @returns Buffer containing the ZIP archive
   *
   * **Encoding Note:**
   * The generated buffer contains UTF-8 encoded XML and text files.
   * All string content within files has been explicitly UTF-8 encoded
   * before being added to the archive to ensure consistency.
   *
   * **DOCX Compliance:**
   * - Files are ordered with [Content_Types].xml first (REQUIRED)
   * - [Content_Types].xml uses STORE compression (uncompressed)
   * - All other files use DEFLATE compression by default
   */
  async toBuffer(options: SaveOptions = {}): Promise<Buffer> {
    const { compression = 6, validate = true } = options;

    // Validate structure if requested
    if (validate) {
      this.validate();
    }

    try {
      // Create a new JSZip instance with proper file ordering
      const orderedZip = new JSZip();
      const sortedPaths = this.getSortedFilePaths();

      // Add files in the correct order
      for (const path of sortedPaths) {
        const file = this.files.get(path);
        if (!file) continue;

        // Content is already a Buffer from addFile() - no re-conversion needed (Issue #2)
        const processedContent = file.content as Buffer;

        // DOCX REQUIREMENT: [Content_Types].xml MUST be uncompressed
        const isContentTypes = path === '[Content_Types].xml';
        const useCompression = isContentTypes
          ? 'STORE'
          : compression > 0
            ? 'DEFLATE'
            : 'STORE';
        const compressionLevel = isContentTypes ? 0 : compression;

        orderedZip.file(path, processedContent, {
          binary: true,
          compression: useCompression,
          compressionOptions: {
            level: compressionLevel,
          },
          date: file.date,
        });
      }

      // Generate ZIP with the ordered files
      const buffer = await orderedZip.generateAsync({
        type: 'nodebuffer',
        compression: compression > 0 ? 'DEFLATE' : 'STORE',
        compressionOptions: {
          level: compression,
        },
        streamFiles: true,
      });

      return buffer;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw new FileOperationError('generate', err.message);
    }
  }

  /**
   * Saves the archive to a file
   * @param filePath - Path where the file will be saved
   * @param options - Save options
   */
  async saveToFile(filePath: string, options: SaveOptions = {}): Promise<void> {
    try {
      const buffer = await this.toBuffer(options);
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      if (error instanceof FileOperationError) {
        throw error;
      }
      const err = error instanceof Error ? error : new Error(String(error));
      throw new FileOperationError('save', err.message);
    }
  }

  /**
   * Creates a new empty archive
   */
  clear(): void {
    this.zip = new JSZip();
    this.files.clear();
  }

  /**
   * Gets the number of files in the archive
   * @returns Number of files
   */
  getFileCount(): number {
    return this.files.size;
  }

  /**
   * Creates a clone of this writer with all its files
   * @returns A new ZipWriter instance with the same files
   */
  clone(): ZipWriter {
    const newWriter = new ZipWriter();
    newWriter.addFiles(this.files);
    return newWriter;
  }
}
