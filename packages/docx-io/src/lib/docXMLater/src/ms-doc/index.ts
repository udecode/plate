/**
 * MS-DOC Binary File Format parser
 *
 * This module provides parsing capabilities for legacy Microsoft Word
 * binary format (.doc) files and conversion to modern .docx format.
 *
 * @module ms-doc
 */

// CFB (Compound File Binary) container parsing
export { CFBReader, CFBParseError } from './cfb/CFBReader';

// File Information Block parsing
export { FIBParser, FIBParseError } from './fib/FIB';

// Text extraction
export { PieceTableParser, PieceTableError } from './text/PieceTable';

// Property parsing
export {
  SPRMParser,
  SPRM_CHARACTER,
  SPRM_PARAGRAPH,
  SPRM_TYPES,
  SPRM_CATEGORIES,
} from './properties/SPRM';

// Style sheet parsing
export { StyleSheetParser, StyleSheetError } from './styles/StyleSheet';
export type { ParsedStyleSheet } from './styles/StyleSheet';

// Table parsing
export { TableParser, TAPParser, TableParseError } from './tables/TableParser';
export type { TableBoundary } from './tables/TableParser';

// Image extraction
export {
  PictureExtractor,
  PictureExtractError,
} from './images/PictureExtractor';

// Section parsing
export { SectionParser, SectionParseError } from './sections/SectionParser';
export type { ParsedSection } from './sections/SectionParser';

// Subdocument parsing (headers, footers, footnotes, etc.)
export {
  SubdocumentParser,
  SubdocumentParseError,
} from './subdocuments/SubdocumentParser';
export type {
  ParsedSubdocument,
  SubdocumentType,
  HeaderFooterType,
} from './subdocuments/SubdocumentParser';

// Field parsing
export { FieldParser, FieldParseError } from './fields/FieldParser';
export type { ParsedField } from './fields/FieldParser';

// Converter
export {
  DocToDocxConverter,
  DocConversionError,
  convertDocToDocx,
  parseDocFile,
} from './converter/DocToDocxConverter';
export type {
  DocConversionOptions,
  ParsedDocument,
  ParsedParagraph,
} from './converter/DocToDocxConverter';

// Type definitions
export * from './types/Constants';
export * from './types/DocTypes';
