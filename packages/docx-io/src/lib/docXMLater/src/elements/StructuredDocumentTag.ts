/**
 * Structured Document Tag (SDT) - Content control wrapper
 *
 * SDTs are used by applications like Google Docs to wrap content
 * with metadata and control settings. They can contain paragraphs,
 * tables, or other block-level elements.
 */

import { XMLBuilder, type XMLElement } from '../xml/XMLBuilder';
import type { Paragraph } from './Paragraph';
import type { Table } from './Table';

/**
 * Type of content lock for SDT
 */
export type SDTLockType =
  | 'unlocked'
  | 'sdtLocked'
  | 'contentLocked'
  | 'sdtContentLocked';

/**
 * Content control type
 */
export type ContentControlType =
  | 'richText'
  | 'plainText'
  | 'comboBox'
  | 'dropDownList'
  | 'datePicker'
  | 'checkbox'
  | 'picture'
  | 'buildingBlock'
  | 'group';

/**
 * List item for combo box or dropdown
 */
export interface ListItem {
  /** Display text shown to user */
  displayText: string;
  /** Internal value */
  value: string;
}

/**
 * Plain text control properties
 */
export interface PlainTextProperties {
  /** Allow multiple lines */
  multiLine?: boolean;
}

/**
 * Combo box control properties
 */
export interface ComboBoxProperties {
  /** List of items */
  items: ListItem[];
  /** Last selected value */
  lastValue?: string;
}

/**
 * Dropdown list control properties
 */
export interface DropDownListProperties {
  /** List of items */
  items: ListItem[];
  /** Last selected value */
  lastValue?: string;
}

/**
 * Date picker control properties
 */
export interface DatePickerProperties {
  /** Date format string (e.g., 'M/d/yyyy') */
  dateFormat?: string;
  /** Full date value */
  fullDate?: Date;
  /** Locale ID */
  lid?: string;
  /** Calendar type */
  calendar?:
    | 'gregorian'
    | 'hijri'
    | 'hebrew'
    | 'taiwan'
    | 'japan'
    | 'thai'
    | 'korean';
}

/**
 * Checkbox control properties
 */
export interface CheckboxProperties {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Character code for checked state (default: '2612' - ☒) */
  checkedState?: string;
  /** Character code for unchecked state (default: '2610' - ☐) */
  uncheckedState?: string;
}

/**
 * Building block control properties
 */
export interface BuildingBlockProperties {
  /** Building block gallery name */
  gallery?: string;
  /** Building block category */
  category?: string;
}

/**
 * Properties for a Structured Document Tag
 */
export interface SDTProperties {
  /** Unique ID for this SDT */
  id?: number;
  /** Tag value (used by applications) */
  tag?: string;
  /** Lock type */
  lock?: SDTLockType;
  /** Alias (display name) */
  alias?: string;
  /** Temporary placeholder (removed when content is edited) */
  temporary?: boolean;
  /** Content control type */
  controlType?: ContentControlType;
  /** Plain text properties */
  plainText?: PlainTextProperties;
  /** Combo box properties */
  comboBox?: ComboBoxProperties;
  /** Dropdown list properties */
  dropDownList?: DropDownListProperties;
  /** Date picker properties */
  datePicker?: DatePickerProperties;
  /** Checkbox properties */
  checkbox?: CheckboxProperties;
  /** Building block properties */
  buildingBlock?: BuildingBlockProperties;
}

/**
 * Content that can be wrapped by an SDT
 */
export type SDTContent = Table | Paragraph | StructuredDocumentTag;

/**
 * Structured Document Tag class
 * Wraps content with metadata and control settings
 *
 * Example XML:
 * ```xml
 * <w:sdt>
 *   <w:sdtPr>
 *     <w:lock w:val="contentLocked"/>
 *     <w:id w:val="-258490443"/>
 *     <w:tag w:val="goog_rdk_0"/>
 *   </w:sdtPr>
 *   <w:sdtContent>
 *     <!-- content here -->
 *   </w:sdtContent>
 * </w:sdt>
 * ```
 */
export class StructuredDocumentTag {
  private properties: SDTProperties;
  private content: SDTContent[];

  /**
   * Create a new Structured Document Tag
   * @param properties - SDT properties
   * @param content - Content elements to wrap
   */
  constructor(properties: SDTProperties = {}, content: SDTContent[] = []) {
    this.properties = properties;
    this.content = content;
  }

  /**
   * Get the SDT ID
   * @returns SDT ID or undefined
   */
  getId(): number | undefined {
    return this.properties.id;
  }

  /**
   * Set the SDT ID
   * @param id - Unique ID
   */
  setId(id: number): this {
    this.properties.id = id;
    return this;
  }

  /**
   * Get the SDT tag
   * @returns Tag value or undefined
   */
  getTag(): string | undefined {
    return this.properties.tag;
  }

  /**
   * Set the SDT tag
   * @param tag - Tag value
   */
  setTag(tag: string): this {
    this.properties.tag = tag;
    return this;
  }

  /**
   * Get the lock type
   * @returns Lock type or undefined
   */
  getLock(): SDTLockType | undefined {
    return this.properties.lock;
  }

  /**
   * Set the lock type
   * @param lock - Lock type
   */
  setLock(lock: SDTLockType): this {
    this.properties.lock = lock;
    return this;
  }

  /**
   * Get the alias (display name)
   * @returns Alias or undefined
   */
  getAlias(): string | undefined {
    return this.properties.alias;
  }

  /**
   * Set the alias (display name)
   * @param alias - Display name
   */
  setAlias(alias: string): this {
    this.properties.alias = alias;
    return this;
  }

  /**
   * Get the content control type
   * @returns Control type or undefined
   */
  getControlType(): ContentControlType | undefined {
    return this.properties.controlType;
  }

  /**
   * Set the content control type
   * @param type - Control type
   */
  setControlType(type: ContentControlType): this {
    this.properties.controlType = type;
    return this;
  }

  /**
   * Get plain text properties
   * @returns Plain text properties or undefined
   */
  getPlainTextProperties(): PlainTextProperties | undefined {
    return this.properties.plainText;
  }

  /**
   * Set plain text properties
   * @param properties - Plain text properties
   */
  setPlainTextProperties(properties: PlainTextProperties): this {
    this.properties.controlType = 'plainText';
    this.properties.plainText = properties;
    return this;
  }

  /**
   * Get combo box properties
   * @returns Combo box properties or undefined
   */
  getComboBoxProperties(): ComboBoxProperties | undefined {
    return this.properties.comboBox;
  }

  /**
   * Set combo box properties
   * @param properties - Combo box properties
   */
  setComboBoxProperties(properties: ComboBoxProperties): this {
    this.properties.controlType = 'comboBox';
    this.properties.comboBox = properties;
    return this;
  }

  /**
   * Get dropdown list properties
   * @returns Dropdown list properties or undefined
   */
  getDropDownListProperties(): DropDownListProperties | undefined {
    return this.properties.dropDownList;
  }

  /**
   * Set dropdown list properties
   * @param properties - Dropdown list properties
   */
  setDropDownListProperties(properties: DropDownListProperties): this {
    this.properties.controlType = 'dropDownList';
    this.properties.dropDownList = properties;
    return this;
  }

  /**
   * Get date picker properties
   * @returns Date picker properties or undefined
   */
  getDatePickerProperties(): DatePickerProperties | undefined {
    return this.properties.datePicker;
  }

  /**
   * Set date picker properties
   * @param properties - Date picker properties
   */
  setDatePickerProperties(properties: DatePickerProperties): this {
    this.properties.controlType = 'datePicker';
    this.properties.datePicker = properties;
    return this;
  }

  /**
   * Get checkbox properties
   * @returns Checkbox properties or undefined
   */
  getCheckboxProperties(): CheckboxProperties | undefined {
    return this.properties.checkbox;
  }

  /**
   * Set checkbox properties
   * @param properties - Checkbox properties
   */
  setCheckboxProperties(properties: CheckboxProperties): this {
    this.properties.controlType = 'checkbox';
    this.properties.checkbox = properties;
    return this;
  }

  /**
   * Get building block properties
   * @returns Building block properties or undefined
   */
  getBuildingBlockProperties(): BuildingBlockProperties | undefined {
    return this.properties.buildingBlock;
  }

  /**
   * Alias for getBuildingBlockProperties() for backward compatibility
   * @returns Building block properties or undefined
   */
  getBuildingBlock(): BuildingBlockProperties | undefined {
    return this.getBuildingBlockProperties();
  }

  /**
   * Set building block properties
   * @param properties - Building block properties
   */
  setBuildingBlockProperties(properties: BuildingBlockProperties): this {
    this.properties.controlType = 'buildingBlock';
    this.properties.buildingBlock = properties;
    return this;
  }

  /**
   * Get list items from combo box or dropdown list
   * @returns List items or undefined if not a list control
   */
  getListItems(): ListItem[] | undefined {
    if (this.properties.comboBox) {
      return this.properties.comboBox.items;
    }
    if (this.properties.dropDownList) {
      return this.properties.dropDownList.items;
    }
    return;
  }

  /**
   * Get date format from date picker
   * @returns Date format string or undefined
   */
  getDateFormat(): string | undefined {
    return this.properties.datePicker?.dateFormat;
  }

  /**
   * Get checked state from checkbox
   * @returns True if checkbox is checked, false otherwise
   */
  isChecked(): boolean {
    return this.properties.checkbox?.checked ?? false;
  }

  /**
   * Get temporary state
   * Temporary SDTs are placeholders removed when content is edited
   * @returns True if SDT is temporary (placeholder), false otherwise
   */
  isTemporary(): boolean {
    return this.properties.temporary === true;
  }

  /**
   * Set whether SDT is temporary
   * @param temporary - Whether SDT is temporary
   * @returns This instance for chaining
   */
  setTemporary(temporary: boolean): this {
    this.properties.temporary = temporary;
    return this;
  }

  /**
   * Get all content elements
   * @returns Array of content elements
   */
  getContent(): SDTContent[] {
    return [...this.content];
  }

  /**
   * Add content element
   * @param element - Element to add
   */
  addContent(element: SDTContent): this {
    this.content.push(element);
    return this;
  }

  /**
   * Clear all content
   */
  clearContent(): this {
    this.content = [];
    return this;
  }

  /**
   * Generate XML for this SDT
   * @returns XML element
   */
  toXML(): XMLElement {
    const children: XMLElement[] = [];

    // Build sdtPr (properties)
    const sdtPrChildren: XMLElement[] = [];

    if (this.properties.lock) {
      sdtPrChildren.push(
        XMLBuilder.wSelf('lock', { 'w:val': this.properties.lock })
      );
    }

    if (this.properties.id !== undefined) {
      sdtPrChildren.push(
        XMLBuilder.wSelf('id', { 'w:val': this.properties.id.toString() })
      );
    }

    if (this.properties.tag) {
      sdtPrChildren.push(
        XMLBuilder.wSelf('tag', { 'w:val': this.properties.tag })
      );
    }

    if (this.properties.alias) {
      sdtPrChildren.push(
        XMLBuilder.wSelf('alias', { 'w:val': this.properties.alias })
      );
    }

    // Add control type-specific XML
    if (this.properties.controlType) {
      switch (this.properties.controlType) {
        case 'richText':
          sdtPrChildren.push(XMLBuilder.wSelf('richText', {}));
          break;

        case 'plainText':
          if (this.properties.plainText) {
            const attrs: Record<string, string> = {};
            if (this.properties.plainText.multiLine !== undefined) {
              attrs['w:multiLine'] = this.properties.plainText.multiLine
                ? '1'
                : '0';
            }
            sdtPrChildren.push(XMLBuilder.wSelf('text', attrs));
          } else {
            sdtPrChildren.push(XMLBuilder.wSelf('text', {}));
          }
          break;

        case 'comboBox':
          if (this.properties.comboBox) {
            const comboBoxChildren: XMLElement[] = [];
            for (const item of this.properties.comboBox.items) {
              comboBoxChildren.push(
                XMLBuilder.wSelf('listItem', {
                  'w:displayText': item.displayText,
                  'w:value': item.value,
                })
              );
            }
            sdtPrChildren.push(XMLBuilder.w('comboBox', {}, comboBoxChildren));
          }
          break;

        case 'dropDownList':
          if (this.properties.dropDownList) {
            const dropDownChildren: XMLElement[] = [];
            for (const item of this.properties.dropDownList.items) {
              dropDownChildren.push(
                XMLBuilder.wSelf('listItem', {
                  'w:displayText': item.displayText,
                  'w:value': item.value,
                })
              );
            }
            sdtPrChildren.push(
              XMLBuilder.w('dropDownList', {}, dropDownChildren)
            );
          }
          break;

        case 'datePicker':
          if (this.properties.datePicker) {
            const dateAttrs: Record<string, string> = {};
            if (this.properties.datePicker.dateFormat) {
              dateAttrs['w:dateFormat'] = this.properties.datePicker.dateFormat;
            }
            if (this.properties.datePicker.lid) {
              dateAttrs['w:lid'] = this.properties.datePicker.lid;
            }
            if (this.properties.datePicker.fullDate) {
              dateAttrs['w:fullDate'] =
                this.properties.datePicker.fullDate.toISOString();
            }
            if (this.properties.datePicker.calendar) {
              dateAttrs['w:calendar'] = this.properties.datePicker.calendar;
            }
            sdtPrChildren.push(XMLBuilder.wSelf('date', dateAttrs));
          }
          break;

        case 'checkbox':
          if (this.properties.checkbox) {
            const checkboxChildren: XMLElement[] = [];

            // Add checked state - use w14 namespace per OOXML spec
            if (this.properties.checkbox.checked !== undefined) {
              checkboxChildren.push(
                XMLBuilder.w14Self('checked', {
                  'w14:val': this.properties.checkbox.checked ? '1' : '0',
                })
              );
            }

            // Add checked state symbol - use w14 namespace per OOXML spec
            if (this.properties.checkbox.checkedState) {
              checkboxChildren.push(
                XMLBuilder.w14Self('checkedState', {
                  'w14:val': this.properties.checkbox.checkedState,
                  'w14:font': 'MS Gothic',
                })
              );
            }

            // Add unchecked state symbol - use w14 namespace per OOXML spec
            if (this.properties.checkbox.uncheckedState) {
              checkboxChildren.push(
                XMLBuilder.w14Self('uncheckedState', {
                  'w14:val': this.properties.checkbox.uncheckedState,
                  'w14:font': 'MS Gothic',
                })
              );
            }

            sdtPrChildren.push(
              XMLBuilder.w14('checkbox', {}, checkboxChildren)
            );
          }
          break;

        case 'picture':
          sdtPrChildren.push(XMLBuilder.wSelf('picture', {}));
          break;

        case 'buildingBlock':
          if (this.properties.buildingBlock) {
            const bbChildren: XMLElement[] = [];
            if (this.properties.buildingBlock.gallery) {
              bbChildren.push(
                XMLBuilder.wSelf('docPartGallery', {
                  'w:val': this.properties.buildingBlock.gallery,
                })
              );
            }
            if (this.properties.buildingBlock.category) {
              bbChildren.push(
                XMLBuilder.wSelf('docPartCategory', {
                  'w:val': this.properties.buildingBlock.category,
                })
              );
            }
            sdtPrChildren.push(XMLBuilder.w('docPartObj', {}, bbChildren));
          }
          break;

        case 'group':
          sdtPrChildren.push(XMLBuilder.wSelf('group', {}));
          break;
      }
    }

    if (sdtPrChildren.length > 0) {
      children.push(XMLBuilder.w('sdtPr', {}, sdtPrChildren));
    }

    // Build sdtContent
    const sdtContentChildren: XMLElement[] = [];
    for (const element of this.content) {
      sdtContentChildren.push(element.toXML());
    }

    children.push(XMLBuilder.w('sdtContent', {}, sdtContentChildren));

    return XMLBuilder.w('sdt', {}, children);
  }

  /**
   * Create an SDT wrapping a table (common for Google Docs)
   * @param table - Table to wrap
   * @param tag - Optional tag value
   * @param lock - Optional lock type (default: unlocked for editability)
   * @returns New SDT instance
   * @example
   * ```typescript
   * // Unlocked table (editable in Word) - RECOMMENDED
   * const sdt = StructuredDocumentTag.wrapTable(table);
   *
   * // Locked table (read-only in Word)
   * const lockedSdt = StructuredDocumentTag.wrapTable(table, 'my-table', 'contentLocked');
   * ```
   */
  static wrapTable(
    table: Table,
    tag = 'goog_rdk_0',
    lock?: SDTLockType
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000, // Generate a reasonable ID
        tag,
        lock, // Only set if provided - defaults to unlocked
      },
      [table]
    );
  }

  /**
   * Create an SDT wrapping a paragraph
   * @param paragraph - Paragraph to wrap
   * @param tag - Optional tag value
   * @returns New SDT instance
   */
  static wrapParagraph(
    paragraph: Paragraph,
    tag?: string
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        tag,
      },
      [paragraph]
    );
  }

  /**
   * Create an empty SDT
   * @param properties - SDT properties
   * @returns New SDT instance
   */
  static create(properties: SDTProperties = {}): StructuredDocumentTag {
    return new StructuredDocumentTag(properties);
  }

  /**
   * Create a rich text content control
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createRichText(
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'richText',
        ...properties,
      },
      content
    );
  }

  /**
   * Create a plain text content control
   * @param content - Initial content
   * @param multiLine - Allow multiple lines
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createPlainText(
    content: SDTContent[] = [],
    multiLine = false,
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'plainText',
        plainText: { multiLine },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a combo box content control
   * @param items - List items
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createComboBox(
    items: ListItem[],
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'comboBox',
        comboBox: { items },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a dropdown list content control
   * @param items - List items
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createDropDownList(
    items: ListItem[],
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'dropDownList',
        dropDownList: { items },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a date picker content control
   * @param dateFormat - Date format string (e.g., 'M/d/yyyy')
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createDatePicker(
    dateFormat = 'M/d/yyyy',
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'datePicker',
        datePicker: { dateFormat },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a checkbox content control
   * @param checked - Initial checked state
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createCheckbox(
    checked = false,
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'checkbox',
        checkbox: {
          checked,
          checkedState: '2612', // ☒
          uncheckedState: '2610', // ☐
        },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a picture content control
   * @param content - Initial content (typically contains an image)
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createPicture(
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'picture',
        ...properties,
      },
      content
    );
  }

  /**
   * Create a building block content control
   * @param gallery - Building block gallery name
   * @param category - Building block category
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createBuildingBlock(
    gallery: string,
    category: string,
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'buildingBlock',
        buildingBlock: { gallery, category },
        ...properties,
      },
      content
    );
  }

  /**
   * Create a group content control
   * @param content - Initial content
   * @param properties - Additional SDT properties
   * @returns New SDT instance
   */
  static createGroup(
    content: SDTContent[] = [],
    properties: Partial<SDTProperties> = {}
  ): StructuredDocumentTag {
    return new StructuredDocumentTag(
      {
        id: Date.now() % 1_000_000_000,
        controlType: 'group',
        lock: 'sdtContentLocked', // Groups typically lock content
        ...properties,
      },
      content
    );
  }

  /**
   * Unlocks the SDT content (allows editing)
   * Removes any lock that prevents content modification
   * @returns This SDT for chaining
   * @example
   * ```typescript
   * // Unlock a locked SDT to enable editing
   * sdt.unlock();
   *
   * // Chain with other modifications
   * sdt.unlock().setTag('editable-content');
   * ```
   */
  unlock(): this {
    delete this.properties.lock;
    return this;
  }

  /**
   * Checks if SDT content is locked in any way
   * @returns True if content is locked (contentLocked, sdtLocked, or sdtContentLocked)
   * @example
   * ```typescript
   * if (sdt.isLocked()) {
   *   console.log('SDT is locked - unlocking for editing');
   *   sdt.unlock();
   * }
   * ```
   */
  isLocked(): boolean {
    const lock = this.properties.lock;
    return (
      lock === 'contentLocked' ||
      lock === 'sdtContentLocked' ||
      lock === 'sdtLocked'
    );
  }

  /**
   * Checks if SDT content can be edited by users
   * @returns True if content can be modified (not locked by contentLocked or sdtContentLocked)
   * @example
   * ```typescript
   * const editable = sdt.isContentEditable();
   * console.log(editable ? 'Can edit' : 'Cannot edit');
   * ```
   */
  isContentEditable(): boolean {
    const lock = this.properties.lock;
    return lock !== 'contentLocked' && lock !== 'sdtContentLocked';
  }
}
