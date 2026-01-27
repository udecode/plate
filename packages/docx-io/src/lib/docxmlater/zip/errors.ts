/**
 * Custom error classes for ZIP and DOCX operations
 */

/**
 * Base error class for all DOCX-related errors
 */
export class DocxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocxError';
    Object.setPrototypeOf(this, DocxError.prototype);
  }
}

/**
 * Error thrown when a DOCX file is not found
 */
export class DocxNotFoundError extends DocxError {
  constructor(filePath: string) {
    super(`DOCX file not found: ${filePath}`);
    this.name = 'DocxNotFoundError';
    Object.setPrototypeOf(this, DocxNotFoundError.prototype);
  }
}

/**
 * Error thrown when a file is not a valid DOCX/ZIP archive
 */
export class InvalidDocxError extends DocxError {
  constructor(message: string) {
    super(`Invalid DOCX file: ${message}`);
    this.name = 'InvalidDocxError';
    Object.setPrototypeOf(this, InvalidDocxError.prototype);
  }
}

/**
 * Error thrown when a ZIP archive is corrupted
 */
export class CorruptedArchiveError extends DocxError {
  constructor(message: string) {
    super(`Corrupted archive: ${message}`);
    this.name = 'CorruptedArchiveError';
    Object.setPrototypeOf(this, CorruptedArchiveError.prototype);
  }
}

/**
 * Error thrown when a required DOCX file is missing
 */
export class MissingRequiredFileError extends DocxError {
  constructor(fileName: string) {
    super(`Missing required file: ${fileName}`);
    this.name = 'MissingRequiredFileError';
    Object.setPrototypeOf(this, MissingRequiredFileError.prototype);
  }
}

/**
 * Error thrown when a file operation fails
 */
export class FileOperationError extends DocxError {
  constructor(operation: string, message: string) {
    super(`File operation '${operation}' failed: ${message}`);
    this.name = 'FileOperationError';
    Object.setPrototypeOf(this, FileOperationError.prototype);
  }
}
