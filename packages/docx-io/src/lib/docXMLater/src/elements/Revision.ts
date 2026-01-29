/**
 * Revision - Represents tracked changes in a Word document
 *
 * Track changes allow tracking of insertions, deletions, and modifications
 * to document content, showing who made changes and when.
 */

import { Run } from './Run';
import type { XMLElement } from '../xml/XMLBuilder';
import type { RevisionLocation } from './PropertyChangeTypes';
import type { RevisionContent } from './RevisionContent';
import { isRunContent, isHyperlinkContent } from './RevisionContent';

/**
 * Revision type - All OpenXML WordprocessingML revision types
 */
export type RevisionType =
  // Content changes
  | 'insert' // w:ins - Inserted content
  | 'delete' // w:del - Deleted content
  // Property changes
  | 'runPropertiesChange' // w:rPrChange - Run formatting change (bold, italic, font, etc.)
  | 'paragraphPropertiesChange' // w:pPrChange - Paragraph formatting change
  | 'tablePropertiesChange' // w:tblPrChange - Table formatting change
  | 'tableExceptionPropertiesChange' // w:tblPrExChange - Table exception properties change
  | 'tableRowPropertiesChange' // w:trPrChange - Table row properties change
  | 'tableCellPropertiesChange' // w:tcPrChange - Table cell properties change
  | 'sectionPropertiesChange' // w:sectPrChange - Section properties change
  // Move operations
  | 'moveFrom' // w:moveFrom - Content moved from this location
  | 'moveTo' // w:moveTo - Content moved to this location
  // Table operations
  | 'tableCellInsert' // w:cellIns - Table cell inserted
  | 'tableCellDelete' // w:cellDel - Table cell deleted
  | 'tableCellMerge' // w:cellMerge - Table cells merged
  // Numbering
  | 'numberingChange' // w:numberingChange - List numbering changed
  // Hyperlink changes
  | 'hyperlinkChange' // Hyperlink URL, text, or formatting change
  // Rich content changes (new tracking types)
  | 'imageChange' // Image insertion, deletion, or property change
  | 'fieldChange' // Field insertion, deletion, or value change
  | 'commentChange' // Comment insertion, deletion, or content change
  | 'bookmarkChange' // Bookmark creation, deletion, or range change
  | 'contentControlChange'; // Content control insertion, deletion, or property change

/**
 * Field context for revisions inside complex fields
 * Provides information about the parent field when a revision appears in a field result
 */
export interface FieldContext {
  /** Reference to the parent ComplexField (if revision is in field result) */
  field?: import('./Field').ComplexField;
  /** Field instruction (e.g., "HYPERLINK", "TOC", "MERGEFIELD") */
  instruction?: string;
  /** Position within field: 'instruction' or 'result' */
  position: 'instruction' | 'result';
}

/**
 * Revision properties
 */
export interface RevisionProperties {
  /** Unique revision ID (assigned by RevisionManager) */
  id?: number;
  /** Author who made the change */
  author: string;
  /** Date when the change was made */
  date?: Date;
  /** Type of revision */
  type: RevisionType;
  /** Content affected by the revision (Run, Hyperlink, or arrays thereof) */
  content: RevisionContent | RevisionContent[];
  /** Previous properties (for property change revisions) */
  previousProperties?: Record<string, any>;
  /** New properties (for property change revisions) */
  newProperties?: Record<string, any>;
  /** Move ID (for moveFrom/moveTo operations) */
  moveId?: string;
  /** Destination location (for moveFrom) or source location (for moveTo) */
  moveLocation?: string;
  /** Location of this revision within the document structure */
  location?: RevisionLocation;
  /** Field context if revision is inside a complex field */
  fieldContext?: FieldContext;
}

/**
 * Represents a tracked change (revision) in a document
 */
export class Revision {
  private id: number;
  private author: string;
  private date: Date;
  private type: RevisionType;
  private content: RevisionContent[];
  private previousProperties?: Record<string, any>;
  private newProperties?: Record<string, any>;
  private moveId?: string;
  private moveLocation?: string;
  private isFieldInstruction = false;
  private location?: RevisionLocation;
  private fieldContext?: FieldContext;

  /**
   * Creates a new Revision
   * @param properties - Revision properties
   */
  constructor(properties: RevisionProperties) {
    this.id = properties.id ?? 0; // Will be assigned by RevisionManager
    this.author = properties.author;
    this.date = properties.date || new Date();
    this.type = properties.type;
    this.content = Array.isArray(properties.content)
      ? properties.content
      : [properties.content];
    this.previousProperties = properties.previousProperties;
    this.newProperties = properties.newProperties;
    this.moveId = properties.moveId;
    this.moveLocation = properties.moveLocation;
    this.location = properties.location;
    this.fieldContext = properties.fieldContext;
  }

  /**
   * Gets the revision ID
   */
  getId(): number {
    return this.id;
  }

  /**
   * Sets the revision ID (used by RevisionManager)
   * @internal
   */
  setId(id: number): void {
    this.id = id;
  }

  /**
   * Gets the author
   */
  getAuthor(): string {
    return this.author;
  }

  /**
   * Sets the author
   */
  setAuthor(author: string): this {
    this.author = author;
    return this;
  }

  /**
   * Gets the revision date
   */
  getDate(): Date {
    return this.date;
  }

  /**
   * Sets the revision date
   */
  setDate(date: Date): this {
    this.date = date;
    return this;
  }

  /**
   * Gets the revision type
   */
  getType(): RevisionType {
    return this.type;
  }

  /**
   * Gets all content items in this revision
   * @returns Array of RevisionContent (Run or Hyperlink objects)
   */
  getContent(): RevisionContent[] {
    return [...this.content];
  }

  /**
   * Gets only the Run objects from this revision (backward compatible)
   * @returns Array of Run objects
   */
  getRuns(): Run[] {
    return this.content.filter((item): item is Run => isRunContent(item));
  }

  /**
   * Gets only the Hyperlink objects from this revision
   * @returns Array of Hyperlink objects
   */
  getHyperlinks(): import('./Hyperlink').Hyperlink[] {
    return this.content.filter(
      (item): item is import('./Hyperlink').Hyperlink =>
        isHyperlinkContent(item)
    );
  }

  /**
   * Adds a run to this revision
   */
  addRun(run: Run): this {
    this.content.push(run);
    return this;
  }

  /**
   * Adds a hyperlink to this revision
   */
  addHyperlink(hyperlink: import('./Hyperlink').Hyperlink): this {
    this.content.push(hyperlink);
    return this;
  }

  /**
   * Adds content (Run or Hyperlink) to this revision
   */
  addContent(item: RevisionContent): this {
    this.content.push(item);
    return this;
  }

  /**
   * Gets the combined text content from all Runs and Hyperlinks in this revision.
   * This is used by isParagraphBlank() to detect text inside revision elements.
   * @returns Combined text string from all content items
   */
  getText(): string {
    return this.content
      .filter(
        (item): item is Run | import('./Hyperlink').Hyperlink =>
          isRunContent(item) || isHyperlinkContent(item)
      )
      .map((item) => item.getText())
      .join('');
  }

  /**
   * Gets the previous properties (for property change revisions)
   */
  getPreviousProperties(): Record<string, any> | undefined {
    return this.previousProperties;
  }

  /**
   * Gets the new properties (for property change revisions)
   */
  getNewProperties(): Record<string, any> | undefined {
    return this.newProperties;
  }

  /**
   * Gets the move ID (for moveFrom/moveTo operations)
   */
  getMoveId(): string | undefined {
    return this.moveId;
  }

  /**
   * Gets the move location
   */
  getMoveLocation(): string | undefined {
    return this.moveLocation;
  }

  /**
   * Gets the location of this revision within the document
   * @returns Location information or undefined if not set
   */
  getLocation(): RevisionLocation | undefined {
    return this.location;
  }

  /**
   * Sets the location of this revision within the document
   * @param location - Location information
   * @returns This revision for chaining
   */
  setLocation(location: RevisionLocation): this {
    this.location = location;
    return this;
  }

  /**
   * Gets the field context if this revision is inside a complex field
   * @returns Field context information or undefined if not inside a field
   */
  getFieldContext(): FieldContext | undefined {
    return this.fieldContext;
  }

  /**
   * Sets the field context for this revision
   * @param context - Field context information
   * @returns This revision for chaining
   */
  setFieldContext(context: FieldContext): this {
    this.fieldContext = context;
    return this;
  }

  /**
   * Checks if this revision is inside a complex field
   * @returns True if the revision is inside a field result or instruction section
   */
  isInsideField(): boolean {
    return this.fieldContext !== undefined;
  }

  /**
   * Checks if this revision is inside a field result section
   * @returns True if the revision is in the result section of a complex field
   */
  isInsideFieldResult(): boolean {
    return this.fieldContext?.position === 'result';
  }

  /**
   * Checks if this revision is inside a field instruction section
   * @returns True if the revision is in the instruction section of a complex field
   */
  isInsideFieldInstruction(): boolean {
    return this.fieldContext?.position === 'instruction';
  }

  /**
   * Gets the parent field if this revision is inside a complex field
   * @returns The parent ComplexField or undefined
   */
  getParentField(): import('./Field').ComplexField | undefined {
    return this.fieldContext?.field;
  }

  /**
   * Marks this revision as a field instruction deletion
   * When true, uses w:delInstrText instead of w:delText
   */
  setAsFieldInstruction(): this {
    this.isFieldInstruction = true;
    return this;
  }

  /**
   * Checks if this is a field instruction deletion
   */
  isFieldInstructionDeletion(): boolean {
    return this.isFieldInstruction;
  }

  /**
   * Formats a date to ISO 8601 format for XML
   * Per ECMA-376, revision dates must be in ISO 8601 format (e.g., "2024-01-01T12:00:00Z")
   * @param date - Date to format
   * @returns ISO 8601 formatted date string
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Gets the XML element name for this revision type
   * Maps internal revision types to OOXML WordprocessingML element names per ECMA-376
   *
   * Mappings:
   * - insert → w:ins (inserted content)
   * - delete → w:del (deleted content)
   * - runPropertiesChange → w:rPrChange (run formatting change)
   * - paragraphPropertiesChange → w:pPrChange (paragraph formatting change)
   * - tablePropertiesChange → w:tblPrChange (table formatting change)
   * - tableRowPropertiesChange → w:trPrChange (table row properties change)
   * - tableCellPropertiesChange → w:tcPrChange (table cell properties change)
   * - sectionPropertiesChange → w:sectPrChange (section properties change)
   * - moveFrom → w:moveFrom (source location of moved content)
   * - moveTo → w:moveTo (destination location of moved content)
   * - tableCellInsert → w:cellIns (inserted table cell)
   * - tableCellDelete → w:cellDel (deleted table cell)
   * - tableCellMerge → w:cellMerge (merged table cells)
   * - numberingChange → w:numberingChange (list numbering changed)
   *
   * @returns OOXML element name (e.g., "w:ins", "w:del")
   */
  private getElementName(): string {
    switch (this.type) {
      case 'insert':
        return 'w:ins';
      case 'delete':
        return 'w:del';
      case 'runPropertiesChange':
        return 'w:rPrChange';
      case 'paragraphPropertiesChange':
        return 'w:pPrChange';
      case 'tablePropertiesChange':
        return 'w:tblPrChange';
      case 'tableExceptionPropertiesChange':
        return 'w:tblPrExChange';
      case 'tableRowPropertiesChange':
        return 'w:trPrChange';
      case 'tableCellPropertiesChange':
        return 'w:tcPrChange';
      case 'sectionPropertiesChange':
        return 'w:sectPrChange';
      case 'moveFrom':
        return 'w:moveFrom';
      case 'moveTo':
        return 'w:moveTo';
      case 'tableCellInsert':
        return 'w:cellIns';
      case 'tableCellDelete':
        return 'w:cellDel';
      case 'tableCellMerge':
        return 'w:cellMerge';
      case 'numberingChange':
        return 'w:numberingChange';
      // Internal tracking types - no OOXML element equivalent
      // These are used for changelog generation and internal tracking,
      // not for XML serialization. OOXML tracks these as insert/delete pairs.
      case 'hyperlinkChange':
      case 'imageChange':
      case 'fieldChange':
      case 'commentChange':
      case 'bookmarkChange':
      case 'contentControlChange':
        throw new Error(
          `Revision type '${this.type}' is an internal tracking type and cannot be serialized to OOXML XML. ` +
            'OOXML does not have a native element for this type. ' +
            `Use insert/delete revision pairs for tracking changes to ${this.type.replace('Change', '')}s.`
        );
      default: {
        // TypeScript exhaustiveness check - this should never be reached
        // if all RevisionType values are handled above
        const _exhaustiveCheck: never = this.type;
        throw new Error(`Unknown revision type: ${_exhaustiveCheck}`);
      }
    }
  }

  /**
   * Generates XML for this revision per OOXML WordprocessingML specification (ECMA-376)
   *
   * **XML Structure:**
   *
   * Content revisions (w:ins, w:del, w:moveFrom, w:moveTo):
   * ```xml
   * <w:ins w:id="0" w:author="Author Name" w:date="2024-01-01T12:00:00Z">
   *   <w:r>
   *     <w:t>Inserted text</w:t>
   *   </w:r>
   * </w:ins>
   * ```
   *
   * Deletion revisions use w:delText instead of w:t:
   * ```xml
   * <w:del w:id="1" w:author="Author Name" w:date="2024-01-01T12:00:00Z">
   *   <w:r>
   *     <w:delText>Deleted text</w:delText>
   *   </w:r>
   * </w:del>
   * ```
   *
   * Property change revisions (w:rPrChange, w:pPrChange, etc.):
   * ```xml
   * <w:rPrChange w:id="2" w:author="Author Name" w:date="2024-01-01T12:00:00Z">
   *   <w:rPr>
   *     <w:b/>  <!-- Previous bold setting -->
   *     <w:sz w:val="24"/>  <!-- Previous font size -->
   *   </w:rPr>
   * </w:rPrChange>
   * ```
   *
   * **Required Attributes (per ECMA-376):**
   * - w:id: Unique revision identifier (ST_DecimalNumber) - REQUIRED
   * - w:author: Author who made the change (ST_String) - REQUIRED
   * - w:date: When the change was made (ST_DateTime, ISO 8601) - OPTIONAL
   *
   * **Move Operations:**
   * For moveFrom/moveTo, an additional w:moveId attribute links the source and destination:
   * ```xml
   * <w:moveFrom w:id="3" w:author="Author" w:date="..." w:moveId="move-1">...</w:moveFrom>
   * <w:moveTo w:id="4" w:author="Author" w:date="..." w:moveId="move-1">...</w:moveTo>
   * ```
   *
   * **Content vs Property Changes:**
   * - Content revisions (insert/delete/move): Contain w:r elements with text runs
   * - Property revisions (rPrChange/pPrChange): Contain previous property elements (w:rPr, w:pPr)
   *
   * @returns XMLElement representing the revision in OOXML format, or null for internal-only types
   * @see ECMA-376 Part 1 §17.13.5 (Revision Identifiers for Paragraph Content)
   * @see ECMA-376 Part 1 §17.13.5.15 (Inserted Paragraph)
   * @see ECMA-376 Part 1 §17.13.5.14 (Deleted Paragraph)
   */
  toXML(): XMLElement | null {
    // Internal tracking types have no OOXML equivalent and cannot be serialized
    // They are used for changelog generation and internal tracking only
    const INTERNAL_TRACKING_TYPES: RevisionType[] = [
      'hyperlinkChange',
      'imageChange',
      'fieldChange',
      'commentChange',
      'bookmarkChange',
      'contentControlChange',
    ];

    if (INTERNAL_TRACKING_TYPES.includes(this.type)) {
      // Return null for internal types - callers should skip these
      return null;
    }

    const attributes: Record<string, string> = {
      'w:id': this.id.toString(),
      'w:author': this.author,
      'w:date': this.formatDate(this.date),
    };

    // Add move-specific attributes
    if ((this.type === 'moveFrom' || this.type === 'moveTo') && this.moveId) {
      attributes['w:moveId'] = this.moveId;
    }

    const elementName = this.getElementName();
    const children: XMLElement[] = [];

    // Handle different revision types
    if (this.isPropertyChangeType()) {
      // Property change revisions contain the previous properties
      if (this.previousProperties) {
        children.push(this.createPropertiesElement());
      }
    }

    // Add content to the revision (handles both Run and Hyperlink)
    for (const item of this.content) {
      if (isHyperlinkContent(item)) {
        // Handle Hyperlink content
        if (this.type === 'delete' || this.type === 'moveFrom') {
          // For deletions, transform hyperlink's nested runs to use w:delText
          children.push(this.createDeletedHyperlinkXml(item));
        } else {
          // For insertions, use normal hyperlink XML
          children.push(item.toXML());
        }
      } else if (isRunContent(item)) {
        // Handle Run content (existing behavior)
        if (this.type === 'delete' || this.type === 'moveFrom') {
          // For deletions and moveFrom, we need to modify the run XML to use w:delText instead of w:t
          const runXml = this.createDeletedRunXml(item);
          children.push(runXml);
        } else {
          // For other types, use normal run XML
          children.push(item.toXML());
        }
      }
    }

    return {
      name: elementName,
      attributes,
      children,
    };
  }

  /**
   * Checks if this is a property change revision type
   *
   * Property change revisions track formatting changes, not content changes.
   * They contain previous property elements (w:rPr, w:pPr, etc.) instead of text runs.
   *
   * **Property Change Types:**
   * - runPropertiesChange: Run formatting (bold, italic, font, color, etc.)
   * - paragraphPropertiesChange: Paragraph formatting (alignment, spacing, indentation, etc.)
   * - tablePropertiesChange: Table formatting
   * - tableRowPropertiesChange: Table row properties
   * - tableCellPropertiesChange: Table cell properties
   * - sectionPropertiesChange: Section properties (page size, margins, etc.)
   * - numberingChange: List numbering properties
   *
   * **Content Change Types (NOT property changes):**
   * - insert: Added text
   * - delete: Removed text
   * - moveFrom: Moved text source
   * - moveTo: Moved text destination
   * - tableCellInsert: Added table cell
   * - tableCellDelete: Removed table cell
   * - tableCellMerge: Merged table cells
   *
   * @returns true if this revision tracks a property/formatting change, false otherwise
   */
  private isPropertyChangeType(): boolean {
    return [
      'runPropertiesChange',
      'paragraphPropertiesChange',
      'tablePropertiesChange',
      'tableExceptionPropertiesChange',
      'tableRowPropertiesChange',
      'tableCellPropertiesChange',
      'sectionPropertiesChange',
      'numberingChange',
    ].includes(this.type);
  }

  /**
   * Creates XML element for previous properties in property change revisions
   *
   * **Purpose:**
   * Property change revisions (w:rPrChange, w:pPrChange, etc.) must contain a child element
   * with the PREVIOUS state of the properties before the change. This allows Word to show
   * what changed and enables accepting/rejecting the change.
   *
   * **Structure:**
   * ```xml
   * <w:rPrChange w:id="0" w:author="Author" w:date="...">
   *   <w:rPr>
   *     <!-- Previous run properties -->
   *     <w:b/>  <!-- Was bold -->
   *     <w:sz w:val="24"/>  <!-- Was 12pt (24 half-points) -->
   *   </w:rPr>
   * </w:rPrChange>
   * ```
   *
   * **Property Element Mapping:**
   * - runPropertiesChange → w:rPr (run properties)
   * - paragraphPropertiesChange → w:pPr (paragraph properties)
   * - tablePropertiesChange → w:tblPr (table properties)
   * - tableRowPropertiesChange → w:trPr (table row properties)
   * - tableCellPropertiesChange → w:tcPr (table cell properties)
   * - sectionPropertiesChange → w:sectPr (section properties)
   * - numberingChange → w:numPr (numbering properties)
   *
   * **Implementation:**
   * This method converts the previousProperties object into OOXML elements.
   * - Boolean properties (e.g., bold) → <w:b/>
   * - Value properties (e.g., font size) → <w:sz w:val="24"/>
   *
   * @returns XMLElement containing previous properties (w:rPr, w:pPr, etc.)
   * @see ECMA-376 Part 1 §17.13.5.31 (Run Properties Change)
   * @see ECMA-376 Part 1 §17.13.5.29 (Paragraph Properties Change)
   */
  private createPropertiesElement(): XMLElement {
    // The property element name depends on the revision type
    let propElementName = 'w:rPr';

    switch (this.type) {
      case 'runPropertiesChange':
        propElementName = 'w:rPr';
        break;
      case 'paragraphPropertiesChange':
        propElementName = 'w:pPr';
        break;
      case 'tablePropertiesChange':
        propElementName = 'w:tblPr';
        break;
      case 'tableExceptionPropertiesChange':
        propElementName = 'w:tblPrEx';
        break;
      case 'tableRowPropertiesChange':
        propElementName = 'w:trPr';
        break;
      case 'tableCellPropertiesChange':
        propElementName = 'w:tcPr';
        break;
      case 'sectionPropertiesChange':
        propElementName = 'w:sectPr';
        break;
      case 'numberingChange':
        propElementName = 'w:numPr';
        break;
    }

    // Build property children from previousProperties
    const propChildren: XMLElement[] = [];
    if (this.previousProperties) {
      for (const [key, value] of Object.entries(this.previousProperties)) {
        if (typeof value === 'boolean' && value) {
          // Boolean properties (e.g., bold, italic)
          propChildren.push({ name: `w:${key}`, attributes: {}, children: [] });
        } else if (typeof value === 'string' || typeof value === 'number') {
          // Value properties (e.g., font size, color)
          propChildren.push({
            name: `w:${key}`,
            attributes: { 'w:val': value.toString() },
            children: [],
          });
        }
      }
    }

    return {
      name: propElementName,
      attributes: {},
      children: propChildren,
    };
  }

  /**
   * Creates XML for a deleted run (uses w:delText or w:delInstrText instead of w:t)
   *
   * **OOXML Requirement:**
   * Per ECMA-376, deleted text must use w:delText element instead of w:t element.
   * For deleted field instructions, w:delInstrText must be used instead.
   * This is required for proper rendering in Microsoft Word's Track Changes mode.
   *
   * **Transformation:**
   * ```xml
   * <!-- Normal run (NOT in deletion) -->
   * <w:r>
   *   <w:rPr><w:b/></w:rPr>
   *   <w:t>Text</w:t>
   * </w:r>
   *
   * <!-- Deleted run (inside w:del) -->
   * <w:r>
   *   <w:rPr><w:b/></w:rPr>
   *   <w:delText>Text</w:delText>
   * </w:r>
   *
   * <!-- Deleted field instruction (inside w:del) -->
   * <w:r>
   *   <w:delInstrText>MERGEFIELD Name</w:delInstrText>
   * </w:r>
   * ```
   *
   * **Why This Matters:**
   * - w:delText tells Word to render with strikethrough in Track Changes mode
   * - w:delInstrText is specifically for deleted field codes
   * - w:t would render as normal text even inside w:del element
   * - Word will reject documents with w:t inside deletions as malformed
   *
   * **Implementation:**
   * This method gets the run's normal XML and replaces all w:t elements with w:delText
   * or w:delInstrText (for field instructions) while preserving all other properties
   * (formatting, spacing attributes, etc.)
   *
   * @param run - Run containing deleted text
   * @returns XMLElement with w:delText or w:delInstrText instead of w:t
   * @see ECMA-376 Part 1 §17.13.5.14 (Deleted Run Content)
   * @see ECMA-376 Part 1 §22.1.2.27 (w:delText element)
   * @see ECMA-376 Part 1 §22.1.2.26 (w:delInstrText element)
   */
  private createDeletedRunXml(run: Run): XMLElement {
    // Get the regular run XML
    const runXml = run.toXML();

    // Determine which element to use for deleted text
    // w:delInstrText for field instructions, w:delText for regular text
    const deletedTextElement = this.isFieldInstruction
      ? 'w:delInstrText'
      : 'w:delText';

    // We need to replace text elements with their deleted counterparts:
    // - w:t -> w:delText (or w:delInstrText if isFieldInstruction)
    // - w:instrText -> w:delInstrText (always, regardless of isFieldInstruction flag)
    if (runXml.children) {
      const modifiedChildren = runXml.children.map((child) => {
        if (typeof child === 'object') {
          if (child.name === 'w:t') {
            // Replace w:t with appropriate deleted text element
            return {
              ...child,
              name: deletedTextElement,
            };
          }
          if (child.name === 'w:instrText') {
            // Replace w:instrText with w:delInstrText
            // Per ECMA-376 §22.1.2.26, deleted field instructions must use w:delInstrText
            return {
              ...child,
              name: 'w:delInstrText',
            };
          }
        }
        return child;
      });

      return {
        ...runXml,
        children: modifiedChildren,
      };
    }

    return runXml;
  }

  /**
   * Creates XML for a deleted hyperlink (transforms nested runs to use w:delText)
   *
   * **OOXML Requirement:**
   * Per ECMA-376, when a hyperlink is inside a w:del element, its nested runs must
   * use w:delText instead of w:t. This transforms the hyperlink's internal run
   * content to comply with Word's Track Changes requirements.
   *
   * **XML Structure:**
   * ```xml
   * <w:del w:id="1" w:author="Author" w:date="...">
   *   <w:hyperlink r:id="rId1">
   *     <w:r>
   *       <w:delText>Link text</w:delText>  <!-- Transformed from w:t -->
   *     </w:r>
   *   </w:hyperlink>
   * </w:del>
   * ```
   *
   * @param hyperlink - Hyperlink containing deleted content
   * @returns XMLElement with nested runs transformed to use w:delText
   */
  private createDeletedHyperlinkXml(
    hyperlink: import('./Hyperlink').Hyperlink
  ): XMLElement {
    // Get the hyperlink's normal XML
    const hyperlinkXml = hyperlink.toXML();

    // Transform nested runs: w:t -> w:delText (or w:delInstrText for field instructions)
    if (hyperlinkXml.children) {
      hyperlinkXml.children = hyperlinkXml.children.map((child) => {
        if (typeof child === 'object' && child.name === 'w:r') {
          // Transform the run's text elements
          return this.convertRunXmlToDeleted(child);
        }
        return child;
      });
    }

    return hyperlinkXml;
  }

  /**
   * Converts a run XMLElement to use deleted text elements
   * Helper for createDeletedHyperlinkXml
   */
  private convertRunXmlToDeleted(runXml: XMLElement): XMLElement {
    const deletedTextElement = this.isFieldInstruction
      ? 'w:delInstrText'
      : 'w:delText';

    if (!runXml.children) return runXml;

    const modifiedChildren = runXml.children.map((child) => {
      if (typeof child === 'object' && child.name === 'w:t') {
        return {
          ...child,
          name: deletedTextElement,
        };
      }
      return child;
    });

    return {
      ...runXml,
      children: modifiedChildren,
    };
  }

  /**
   * Creates an insertion revision
   * @param author - Author who made the insertion
   * @param content - Inserted content (Run, Hyperlink, or arrays thereof)
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createInsertion(
    author: string,
    content: RevisionContent | RevisionContent[],
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'insert',
      content,
      date,
    });
  }

  /**
   * Creates a deletion revision
   * @param author - Author who made the deletion
   * @param content - Deleted content (Run, Hyperlink, or arrays thereof)
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createDeletion(
    author: string,
    content: RevisionContent | RevisionContent[],
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'delete',
      content,
      date,
    });
  }

  /**
   * Creates a field instruction deletion revision
   * Uses w:delInstrText instead of w:delText for field codes
   * @param author - Author who made the deletion
   * @param content - Deleted field instruction content (Run or array of Runs)
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createFieldInstructionDeletion(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    const revision = new Revision({
      author,
      type: 'delete',
      content,
      date,
    });
    revision.setAsFieldInstruction();
    return revision;
  }

  /**
   * Creates a revision from text
   * Convenience method that creates a Run from the text
   * @param type - Revision type
   * @param author - Author who made the change
   * @param text - Text content
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static fromText(
    type: RevisionType,
    author: string,
    text: string,
    date?: Date
  ): Revision {
    const run = new Run(text);
    return new Revision({
      author,
      type,
      content: run,
      date,
    });
  }

  /**
   * Creates a run properties change revision
   * @param author - Author who made the change
   * @param content - Content with changed formatting
   * @param previousProperties - Previous run properties
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createRunPropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'runPropertiesChange',
      content,
      previousProperties,
      date,
    });
  }

  /**
   * Creates a paragraph properties change revision
   * @param author - Author who made the change
   * @param content - Paragraph content
   * @param previousProperties - Previous paragraph properties
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createParagraphPropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'paragraphPropertiesChange',
      content,
      previousProperties,
      date,
    });
  }

  /**
   * Creates a table properties change revision
   * @param author - Author who made the change
   * @param content - Table content
   * @param previousProperties - Previous table properties
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createTablePropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'tablePropertiesChange',
      content,
      previousProperties,
      date,
    });
  }

  /**
   * Creates a table exception properties change revision
   * Tracks changes to table properties that override style defaults
   * @param author - Author who made the change
   * @param content - Table content
   * @param previousProperties - Previous table exception properties
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createTableExceptionPropertiesChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'tableExceptionPropertiesChange',
      content,
      previousProperties,
      date,
    });
  }

  /**
   * Creates a moveFrom revision (source of moved content)
   * @param author - Author who moved the content
   * @param content - Content that was moved
   * @param moveId - Unique move operation ID (links moveFrom and moveTo)
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createMoveFrom(
    author: string,
    content: Run | Run[],
    moveId: string,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'moveFrom',
      content,
      moveId,
      date,
    });
  }

  /**
   * Creates a moveTo revision (destination of moved content)
   * @param author - Author who moved the content
   * @param content - Content that was moved
   * @param moveId - Unique move operation ID (links moveFrom and moveTo)
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createMoveTo(
    author: string,
    content: Run | Run[],
    moveId: string,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'moveTo',
      content,
      moveId,
      date,
    });
  }

  /**
   * Creates a table cell insertion revision
   * @param author - Author who inserted the cell
   * @param content - Cell content
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createTableCellInsert(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'tableCellInsert',
      content,
      date,
    });
  }

  /**
   * Creates a table cell deletion revision
   * @param author - Author who deleted the cell
   * @param content - Cell content
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createTableCellDelete(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'tableCellDelete',
      content,
      date,
    });
  }

  /**
   * Creates a table cell merge revision
   * @param author - Author who merged cells
   * @param content - Merged cell content
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createTableCellMerge(
    author: string,
    content: Run | Run[],
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'tableCellMerge',
      content,
      date,
    });
  }

  /**
   * Creates a numbering change revision
   * @param author - Author who changed the numbering
   * @param content - Content with changed numbering
   * @param previousProperties - Previous numbering properties
   * @param date - Optional date (defaults to now)
   * @returns New Revision instance
   */
  static createNumberingChange(
    author: string,
    content: Run | Run[],
    previousProperties: Record<string, any>,
    date?: Date
  ): Revision {
    return new Revision({
      author,
      type: 'numberingChange',
      content,
      previousProperties,
      date,
    });
  }
}
