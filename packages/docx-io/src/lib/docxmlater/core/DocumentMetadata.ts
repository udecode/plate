/**
 * DocumentMetadata - Manages document properties and custom metadata
 *
 * Handles core properties (title, author, etc.), extended properties (company, version),
 * and custom properties. Extracted from Document.ts for better separation of concerns.
 */

import { DocumentValidator } from "./DocumentValidator";

/**
 * Document properties (core and extended)
 */
export interface DocumentProperties {
  // Core Properties (docProps/core.xml)
  title?: string;
  subject?: string;
  creator?: string;
  keywords?: string;
  description?: string;
  lastModifiedBy?: string;
  revision?: number;
  created?: Date;
  modified?: Date;
  language?: string;
  category?: string;
  contentStatus?: string;

  // Extended Properties (docProps/app.xml)
  application?: string;
  appVersion?: string;
  company?: string;
  manager?: string;
  version?: string;

  // Custom Properties (docProps/custom.xml)
  customProperties?: Record<string, string | number | boolean | Date>;
}

/**
 * Manages document metadata and properties
 */
export class DocumentMetadata {
  private properties: DocumentProperties;

  constructor(initialProperties?: DocumentProperties) {
    this.properties = initialProperties || {};
  }

  /**
   * Sets multiple document metadata properties
   *
   * @param properties - Properties to set (merged with existing)
   * @returns This instance for chaining
   */
  setProperties(properties: DocumentProperties): this {
    const validated = DocumentValidator.validateProperties(properties);
    this.properties = { ...this.properties, ...validated };
    return this;
  }

  /**
   * Gets all document metadata properties
   *
   * @returns Copy of the document properties object
   */
  getProperties(): DocumentProperties {
    return { ...this.properties };
  }

  /**
   * Sets a single document property value
   *
   * @param key - Property key
   * @param value - Property value
   * @returns This instance for chaining
   */
  setProperty(key: keyof DocumentProperties, value: unknown): this {
    (this.properties as Record<string, unknown>)[key] = value;
    return this;
  }

  /**
   * Gets a single document property value
   *
   * @param key - Property key
   * @returns Property value or undefined
   */
  getProperty<K extends keyof DocumentProperties>(
    key: K
  ): DocumentProperties[K] {
    return this.properties[key];
  }

  // ==================== Core Properties ====================

  /**
   * Sets the document title
   */
  setTitle(title: string): this {
    this.properties.title = title;
    return this;
  }

  /**
   * Gets the document title
   */
  getTitle(): string | undefined {
    return this.properties.title;
  }

  /**
   * Sets the document subject
   */
  setSubject(subject: string): this {
    this.properties.subject = subject;
    return this;
  }

  /**
   * Gets the document subject
   */
  getSubject(): string | undefined {
    return this.properties.subject;
  }

  /**
   * Sets the document creator/author
   */
  setCreator(creator: string): this {
    this.properties.creator = creator;
    return this;
  }

  /**
   * Gets the document creator/author
   */
  getCreator(): string | undefined {
    return this.properties.creator;
  }

  /**
   * Sets the document keywords (comma-separated)
   */
  setKeywords(keywords: string): this {
    this.properties.keywords = keywords;
    return this;
  }

  /**
   * Gets the document keywords
   */
  getKeywords(): string | undefined {
    return this.properties.keywords;
  }

  /**
   * Sets the document description
   */
  setDescription(description: string): this {
    this.properties.description = description;
    return this;
  }

  /**
   * Gets the document description
   */
  getDescription(): string | undefined {
    return this.properties.description;
  }

  /**
   * Sets the document category
   */
  setCategory(category: string): this {
    this.properties.category = category;
    return this;
  }

  /**
   * Gets the document category
   */
  getCategory(): string | undefined {
    return this.properties.category;
  }

  /**
   * Sets the document content status (e.g., "Draft", "Final", "In Review")
   */
  setContentStatus(status: string): this {
    this.properties.contentStatus = status;
    return this;
  }

  /**
   * Gets the document content status
   */
  getContentStatus(): string | undefined {
    return this.properties.contentStatus;
  }

  /**
   * Sets the last modified by user
   */
  setLastModifiedBy(name: string): this {
    this.properties.lastModifiedBy = name;
    return this;
  }

  /**
   * Gets the last modified by user
   */
  getLastModifiedBy(): string | undefined {
    return this.properties.lastModifiedBy;
  }

  /**
   * Sets the document language
   */
  setLanguage(language: string): this {
    this.properties.language = language;
    return this;
  }

  /**
   * Gets the document language
   */
  getLanguage(): string | undefined {
    return this.properties.language;
  }

  /**
   * Sets the revision number
   */
  setRevision(revision: number): this {
    this.properties.revision = revision;
    return this;
  }

  /**
   * Gets the revision number
   */
  getRevision(): number | undefined {
    return this.properties.revision;
  }

  /**
   * Sets the created date
   */
  setCreated(date: Date): this {
    this.properties.created = date;
    return this;
  }

  /**
   * Gets the created date
   */
  getCreated(): Date | undefined {
    return this.properties.created;
  }

  /**
   * Sets the modified date
   */
  setModified(date: Date): this {
    this.properties.modified = date;
    return this;
  }

  /**
   * Gets the modified date
   */
  getModified(): Date | undefined {
    return this.properties.modified;
  }

  // ==================== Extended Properties ====================

  /**
   * Sets the application name
   */
  setApplication(application: string): this {
    this.properties.application = application;
    return this;
  }

  /**
   * Gets the application name
   */
  getApplication(): string | undefined {
    return this.properties.application;
  }

  /**
   * Sets the application version
   */
  setAppVersion(version: string): this {
    this.properties.appVersion = version;
    return this;
  }

  /**
   * Gets the application version
   */
  getAppVersion(): string | undefined {
    return this.properties.appVersion;
  }

  /**
   * Sets the company name
   */
  setCompany(company: string): this {
    this.properties.company = company;
    return this;
  }

  /**
   * Gets the company name
   */
  getCompany(): string | undefined {
    return this.properties.company;
  }

  /**
   * Sets the manager name
   */
  setManager(manager: string): this {
    this.properties.manager = manager;
    return this;
  }

  /**
   * Gets the manager name
   */
  getManager(): string | undefined {
    return this.properties.manager;
  }

  /**
   * Sets the version string
   */
  setVersion(version: string): this {
    this.properties.version = version;
    return this;
  }

  /**
   * Gets the version string
   */
  getVersion(): string | undefined {
    return this.properties.version;
  }

  // ==================== Custom Properties ====================

  /**
   * Sets a custom property
   *
   * @param name - Property name
   * @param value - Property value (string, number, boolean, or Date)
   * @returns This instance for chaining
   */
  setCustomProperty(
    name: string,
    value: string | number | boolean | Date
  ): this {
    if (!this.properties.customProperties) {
      this.properties.customProperties = {};
    }
    this.properties.customProperties[name] = value;
    return this;
  }

  /**
   * Gets a custom property value
   *
   * @param name - Property name
   * @returns Property value or undefined
   */
  getCustomProperty(
    name: string
  ): string | number | boolean | Date | undefined {
    return this.properties.customProperties?.[name];
  }

  /**
   * Sets multiple custom properties
   *
   * @param properties - Object containing custom properties
   * @returns This instance for chaining
   */
  setCustomProperties(
    properties: Record<string, string | number | boolean | Date>
  ): this {
    this.properties.customProperties = { ...properties };
    return this;
  }

  /**
   * Gets all custom properties
   *
   * @returns Copy of custom properties object or empty object
   */
  getCustomProperties(): Record<string, string | number | boolean | Date> {
    return { ...(this.properties.customProperties || {}) };
  }

  /**
   * Removes a custom property
   *
   * @param name - Property name to remove
   * @returns true if property was removed, false if it didn't exist
   */
  removeCustomProperty(name: string): boolean {
    if (this.properties.customProperties?.[name] !== undefined) {
      delete this.properties.customProperties[name];
      return true;
    }
    return false;
  }

  /**
   * Checks if a custom property exists
   *
   * @param name - Property name
   * @returns true if property exists
   */
  hasCustomProperty(name: string): boolean {
    return this.properties.customProperties?.[name] !== undefined;
  }

  /**
   * Gets the number of custom properties
   *
   * @returns Number of custom properties
   */
  getCustomPropertyCount(): number {
    return Object.keys(this.properties.customProperties || {}).length;
  }

  /**
   * Clears all custom properties
   *
   * @returns This instance for chaining
   */
  clearCustomProperties(): this {
    this.properties.customProperties = {};
    return this;
  }

  // ==================== Utility Methods ====================

  /**
   * Creates a clone of this metadata instance
   *
   * @returns New DocumentMetadata instance with same properties
   */
  clone(): DocumentMetadata {
    return new DocumentMetadata(this.getProperties());
  }

  /**
   * Merges properties from another metadata instance
   *
   * @param other - Source metadata to merge from
   * @returns This instance for chaining
   */
  merge(other: DocumentMetadata): this {
    const otherProps = other.getProperties();
    this.properties = { ...this.properties, ...otherProps };
    return this;
  }

  /**
   * Clears all properties
   *
   * @returns This instance for chaining
   */
  clear(): this {
    this.properties = {};
    return this;
  }

  /**
   * Checks if any properties are set
   *
   * @returns true if no properties are set
   */
  isEmpty(): boolean {
    return Object.keys(this.properties).length === 0;
  }
}
