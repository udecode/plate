/**
 * Field Parser
 *
 * Parses field codes from MS-DOC files.
 * Fields are marked by special characters (0x13/0x14/0x15)
 * representing field begin, separator, and end.
 *
 * References:
 * - [MS-DOC] 2.16 Fields
 * - [MS-DOC] 2.16.1 PlcFld
 */

import type { FieldDefinition } from '../types/DocTypes';

/**
 * Error thrown when field parsing fails
 */
export class FieldParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FieldParseError';
  }
}

/**
 * Field character codes
 */
const FIELD_CHARS = {
  /** Field begin (0x13) */
  BEGIN: 0x13,
  /** Field separator (0x14) */
  SEPARATOR: 0x14,
  /** Field end (0x15) */
  END: 0x15,
} as const;

/**
 * Known field types
 */
const FIELD_TYPES: { [key: string]: string } = {
  PAGE: 'page',
  NUMPAGES: 'numPages',
  DATE: 'date',
  TIME: 'time',
  AUTHOR: 'author',
  TITLE: 'title',
  SUBJECT: 'subject',
  KEYWORDS: 'keywords',
  FILENAME: 'filename',
  CREATEDATE: 'createDate',
  SAVEDATE: 'saveDate',
  PRINTDATE: 'printDate',
  TOC: 'toc',
  PAGEREF: 'pageRef',
  REF: 'ref',
  HYPERLINK: 'hyperlink',
  MERGEFIELD: 'mergeField',
  IF: 'if',
  SEQ: 'seq',
  SET: 'set',
  ASK: 'ask',
  FILLIN: 'fillIn',
  INCLUDETEXT: 'includeText',
  INCLUDEPICTURE: 'includePicture',
  SYMBOL: 'symbol',
  EMBED: 'embed',
  LINK: 'link',
  DOCPROPERTY: 'docProperty',
  DOCVARIABLE: 'docVariable',
  STYLEREF: 'styleRef',
  LISTNUM: 'listNum',
  AUTONUM: 'autoNum',
  AUTONUMLGL: 'autoNumLgl',
  AUTONUMOUT: 'autoNumOut',
  QUOTE: 'quote',
  EQ: 'equation',
  ADVANCE: 'advance',
  TC: 'tocEntry',
  XE: 'indexEntry',
  INDEX: 'index',
  RD: 'referencedDocument',
  TA: 'tableOfAuthoritiesEntry',
  TOA: 'tableOfAuthorities',
  COMMENTS: 'comments',
  LASTSAVEDBY: 'lastSavedBy',
  EDITTIME: 'editTime',
  NUMWORDS: 'numWords',
  NUMCHARS: 'numChars',
  REVNUM: 'revNum',
  SECTION: 'section',
  SECTIONPAGES: 'sectionPages',
};

/**
 * Parsed field structure
 */
export interface ParsedField {
  /** Field type (e.g., 'PAGE', 'DATE', 'HYPERLINK') */
  type: string;
  /** Normalized type */
  normalizedType: string;
  /** Field instruction/code */
  instruction: string;
  /** Field result/value */
  result: string;
  /** Starting CP */
  cpStart: number;
  /** Separator CP (if present) */
  cpSeparator?: number;
  /** Ending CP */
  cpEnd: number;
  /** Switches (e.g., \* MERGEFORMAT) */
  switches: string[];
  /** Is nested field */
  isNested: boolean;
  /** Parent field index (if nested) */
  parentIndex?: number;
}

/**
 * Parse fields from document text
 */
export class FieldParser {
  private text: string;
  private fields: ParsedField[] = [];

  constructor(documentText: string) {
    this.text = documentText;
  }

  /**
   * Parse all fields in the document
   */
  parse(): ParsedField[] {
    this.fields = [];
    const fieldStack: { cpStart: number; level: number }[] = [];

    for (let i = 0; i < this.text.length; i++) {
      const charCode = this.text.charCodeAt(i);

      switch (charCode) {
        case FIELD_CHARS.BEGIN:
          // Start of a new field
          fieldStack.push({ cpStart: i, level: fieldStack.length });
          break;

        case FIELD_CHARS.SEPARATOR:
          // Field separator - marks end of instruction, start of result
          if (fieldStack.length > 0) {
            const current = fieldStack[fieldStack.length - 1];
            if (current) {
              // Mark separator position in current field
              const partialField = this.parseFieldInstruction(
                current.cpStart,
                i
              );
              if (partialField) {
                partialField.cpSeparator = i;
              }
            }
          }
          break;

        case FIELD_CHARS.END:
          // End of current field
          if (fieldStack.length > 0) {
            const current = fieldStack.pop();
            if (current) {
              const field = this.parseCompleteField(
                current.cpStart,
                i,
                current.level > 0
              );
              if (field) {
                if (current.level > 0 && this.fields.length > 0) {
                  field.parentIndex = this.fields.length - 1;
                }
                this.fields.push(field);
              }
            }
          }
          break;
      }
    }

    return this.fields;
  }

  /**
   * Parse field instruction (between BEGIN and SEPARATOR/END)
   */
  private parseFieldInstruction(
    cpStart: number,
    cpEnd: number
  ): Partial<ParsedField> | null {
    // Extract instruction text (skip the field begin character)
    const instructionRaw = this.text.substring(cpStart + 1, cpEnd).trim();

    if (!instructionRaw) {
      return null;
    }

    // Parse field type and arguments
    const parts = this.tokenizeInstruction(instructionRaw);
    if (parts.length === 0) {
      return null;
    }

    const fieldType = parts[0]?.toUpperCase() ?? '';
    const normalizedType = FIELD_TYPES[fieldType] ?? fieldType.toLowerCase();

    // Extract switches (arguments starting with \)
    const switches: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part?.startsWith('\\')) {
        switches.push(part);
      }
    }

    return {
      type: fieldType,
      normalizedType,
      instruction: instructionRaw,
      switches,
      cpStart,
    };
  }

  /**
   * Parse complete field (instruction and result)
   */
  private parseCompleteField(
    cpStart: number,
    cpEnd: number,
    isNested: boolean
  ): ParsedField | null {
    // Find separator position
    let cpSeparator: number | undefined;
    for (let i = cpStart + 1; i < cpEnd; i++) {
      if (this.text.charCodeAt(i) === FIELD_CHARS.SEPARATOR) {
        cpSeparator = i;
        break;
      }
    }

    // Extract instruction
    const instructionEnd = cpSeparator ?? cpEnd;
    const instructionRaw = this.text
      .substring(cpStart + 1, instructionEnd)
      .trim();

    // Extract result (if separator exists)
    let result = '';
    if (cpSeparator !== undefined) {
      result = this.text.substring(cpSeparator + 1, cpEnd).trim();
      // Clean result of nested field characters
      result = result.replace(/[\x13\x14\x15]/g, '');
    }

    // Parse field type
    const parts = this.tokenizeInstruction(instructionRaw);
    if (parts.length === 0) {
      return null;
    }

    const fieldType = parts[0]?.toUpperCase() ?? '';
    const normalizedType = FIELD_TYPES[fieldType] ?? fieldType.toLowerCase();

    // Extract switches
    const switches: string[] = [];
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part?.startsWith('\\')) {
        switches.push(part);
      }
    }

    return {
      type: fieldType,
      normalizedType,
      instruction: instructionRaw,
      result,
      cpStart,
      cpSeparator,
      cpEnd,
      switches,
      isNested,
    };
  }

  /**
   * Tokenize field instruction respecting quotes
   */
  private tokenizeInstruction(instruction: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < instruction.length; i++) {
      const char = instruction[i]!;

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        current += char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        current += char;
      } else if (char === ' ' && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      tokens.push(current);
    }

    return tokens;
  }

  /**
   * Get fields by type
   */
  getFieldsByType(type: string): ParsedField[] {
    const upperType = type.toUpperCase();
    return this.fields.filter((f) => f.type === upperType);
  }

  /**
   * Check if text contains fields
   */
  static hasFields(text: string): boolean {
    const beginChar = String.fromCharCode(FIELD_CHARS.BEGIN);
    return text.includes(beginChar);
  }

  /**
   * Extract field result text (static text value)
   */
  static extractFieldResults(text: string): string {
    let result = '';
    let inInstruction = false;
    let depth = 0;

    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);

      switch (charCode) {
        case FIELD_CHARS.BEGIN:
          depth++;
          inInstruction = true;
          break;

        case FIELD_CHARS.SEPARATOR:
          if (depth > 0) {
            inInstruction = false;
          }
          break;

        case FIELD_CHARS.END:
          depth--;
          if (depth === 0) {
            inInstruction = false;
          }
          break;

        default:
          if (!inInstruction && depth === 0) {
            result += text[i];
          } else if (!inInstruction && depth > 0) {
            // Inside result section
            result += text[i];
          }
      }
    }

    return result;
  }

  /**
   * Convert parsed field to FieldDefinition
   */
  static toFieldDefinition(field: ParsedField): FieldDefinition {
    return {
      type: field.normalizedType,
      instruction: field.instruction,
      result: field.result,
      cpStart: field.cpStart,
      cpEnd: field.cpEnd,
    };
  }

  /**
   * Static method to parse fields
   */
  static parse(text: string): ParsedField[] {
    const parser = new FieldParser(text);
    return parser.parse();
  }
}
