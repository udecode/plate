/**
 * ChangelogGenerator - Generates structured changelog from Word tracked changes
 *
 * Converts Word revisions (w:ins, w:del, property changes) into structured
 * changelog data with support for consolidation, categorization, and
 * multiple output formats.
 *
 * Follows ECMA-376 revision semantics.
 *
 * @module ChangelogGenerator
 */

import type { Document } from '../core/Document';
import { Revision, RevisionType } from '../elements/Revision';
import { getGlobalLogger, createScopedLogger, ILogger } from './logger';

// Scoped logger for ChangelogGenerator
function getLogger(): ILogger {
  return createScopedLogger(getGlobalLogger(), 'ChangelogGenerator');
}

/**
 * Semantic category for grouping changes.
 */
export type ChangeCategory =
  | 'content'      // Text insertions, deletions
  | 'formatting'   // Run/paragraph property changes
  | 'structural'   // Moves, section changes
  | 'table'        // Table structure changes
  | 'hyperlink'    // Hyperlink URL, text, or formatting changes
  | 'image'        // Image insertion, deletion, or property changes
  | 'field'        // Field insertion, deletion, or value changes
  | 'comment'      // Comment changes
  | 'bookmark'     // Bookmark changes
  | 'contentControl'; // Content control (SDT) changes

/**
 * Location of a change within the document.
 */
export interface ChangeLocation {
  /** Section index (0-based) */
  sectionIndex?: number;
  /** Paragraph index within body (0-based) */
  paragraphIndex: number;
  /** Run index within paragraph (0-based) */
  runIndex?: number;
  /** Nearest heading for context */
  nearestHeading?: string;
  /** Character offset within paragraph */
  characterOffset?: number;
}

/**
 * Represents a single change entry in the changelog.
 * Follows ECMA-376 revision semantics.
 */
export interface ChangeEntry {
  /** Unique identifier (matches revision ID) */
  id: string;

  /** ECMA-376 revision type */
  revisionType: RevisionType;

  /** Semantic category for grouping */
  category: ChangeCategory;

  /** Human-readable description */
  description: string;

  /** Author who made the change */
  author: string;

  /** ISO 8601 timestamp */
  date: Date;

  /** Location in document */
  location: ChangeLocation;

  /** Content details */
  content: {
    /** Text before change (for deletions/modifications) */
    before?: string;
    /** Text after change (for insertions/modifications) */
    after?: string;
    /** Affected text (for property changes) */
    affectedText?: string;
  };

  /** Property change details (for formatting changes) */
  propertyChange?: {
    property: string;
    oldValue?: string;
    newValue?: string;
  };
}

/**
 * Output format for changelog generation.
 */
export type ChangelogFormat = 'json' | 'markdown' | 'text' | 'html' | 'csv';

/**
 * Options for changelog generation.
 */
export interface ChangelogOptions {
  /** Include formatting/property changes (default: true) */
  includeFormattingChanges?: boolean;
  /** Consolidate similar changes (default: false) */
  consolidate?: boolean;
  /** Maximum context length for descriptions (default: 50) */
  maxContextLength?: number;
  /** Filter by authors */
  filterAuthors?: string[];
  /** Filter by date range */
  filterDateRange?: { start: Date; end: Date };
  /** Filter by categories */
  filterCategories?: ChangeCategory[];
  /** Output format (default: 'markdown') */
  format?: ChangelogFormat;
  /** Sort changes by field */
  sortBy?: 'date' | 'author' | 'type' | 'category';
  /** Sort order (default: 'asc') */
  sortOrder?: 'asc' | 'desc';
  /** Group changes by element type */
  groupByElement?: boolean;
  /** Include document context (nearest heading, section) */
  includeDocumentContext?: boolean;
}

/**
 * Consolidated change grouping similar changes together.
 */
export interface ConsolidatedChange {
  /** Description of the consolidated change */
  description: string;
  /** Number of individual changes */
  count: number;
  /** Category of changes */
  category: ChangeCategory;
  /** Common attributes shared by all changes */
  commonAttributes: {
    author?: string;
    revisionType?: RevisionType;
    propertyChanged?: string;
    newValue?: string;
  };
  /** Individual change IDs */
  changeIds: string[];
}

/**
 * Summary statistics for changelog entries.
 */
export interface ChangelogSummary {
  /** Total number of changes */
  total: number;
  /** Breakdown by category */
  byCategory: Record<ChangeCategory, number>;
  /** Breakdown by revision type */
  byType: Record<string, number>;
  /** Breakdown by author */
  byAuthor: Record<string, number>;
  /** Date range of changes */
  dateRange: { earliest: Date; latest: Date } | null;
}

/**
 * Generates changelog from Word tracked changes.
 * Follows ECMA-376 revision semantics.
 */
export class ChangelogGenerator {
  /**
   * Generate changelog entries from a document.
   * Document must be loaded with { revisionHandling: 'preserve' }.
   *
   * @param doc - Document to extract revisions from
   * @param options - Changelog generation options
   * @returns Array of changelog entries
   */
  static fromDocument(doc: Document, options?: ChangelogOptions): ChangeEntry[] {
    const revisionManager = doc.getRevisionManager();
    if (!revisionManager) {
      return [];
    }

    const revisions = revisionManager.getAllRevisions();
    return this.fromRevisions(revisions, options, doc);
  }

  /**
   * Generate changelog entries from specific revisions.
   *
   * @param revisions - Array of revisions to convert
   * @param options - Changelog generation options
   * @param doc - Optional document for context (paragraph indices, headings)
   * @returns Array of changelog entries
   */
  static fromRevisions(
    revisions: Revision[],
    options?: ChangelogOptions,
    doc?: Document
  ): ChangeEntry[] {
    const logger = getLogger();
    const opts = {
      includeFormattingChanges: true,
      consolidate: false,
      maxContextLength: 50,
      ...options,
    };

    logger.debug('Processing revisions', {
      total: revisions.length,
      filters: {
        categories: opts.filterCategories?.length ?? 0,
        authors: opts.filterAuthors?.length ?? 0,
        dateRange: !!opts.filterDateRange
      }
    });

    const entries: ChangeEntry[] = [];
    let filtered = 0;

    for (let i = 0; i < revisions.length; i++) {
      const revision = revisions[i];
      if (!revision) continue;

      const category = this.categorize(revision);

      // Filter by category
      if (opts.filterCategories && !opts.filterCategories.includes(category)) {
        filtered++;
        continue;
      }

      // Filter out formatting changes if requested
      if (!opts.includeFormattingChanges && category === 'formatting') {
        filtered++;
        continue;
      }

      // Filter by author
      if (opts.filterAuthors && !opts.filterAuthors.includes(revision.getAuthor())) {
        filtered++;
        continue;
      }

      // Filter by date range
      if (opts.filterDateRange) {
        const revDate = revision.getDate();
        if (revDate < opts.filterDateRange.start || revDate > opts.filterDateRange.end) {
          filtered++;
          continue;
        }
      }

      const entry = this.revisionToEntry(revision, i, opts.maxContextLength);
      entries.push(entry);
    }

    if (filtered > 0) {
      logger.debug('Revisions filtered', { included: entries.length, filtered });
    }

    return entries;
  }

  /**
   * Convert a single revision to a changelog entry.
   *
   * @param revision - Revision to convert
   * @param index - Index for paragraph location (default location)
   * @param maxContextLength - Maximum length for text context
   * @returns Changelog entry
   */
  private static revisionToEntry(
    revision: Revision,
    index: number,
    maxContextLength: number
  ): ChangeEntry {
    const type = revision.getType();
    const category = this.categorize(revision);
    const runs = revision.getRuns();

    // Extract text content from runs
    const text = runs.map(r => r.getText()).join('');
    const truncatedText = text.length > maxContextLength
      ? text.substring(0, maxContextLength) + '...'
      : text;

    // Build content object based on revision type
    const content: ChangeEntry['content'] = {};
    if (type === 'insert' || type === 'moveTo') {
      content.after = truncatedText;
    } else if (type === 'delete' || type === 'moveFrom') {
      content.before = truncatedText;
    } else if (this.isPropertyChangeType(type)) {
      content.affectedText = truncatedText;
    }

    // Handle hyperlink changes specially
    const prevProps = revision.getPreviousProperties();
    const newProps = revision.getNewProperties();
    if (type === 'hyperlinkChange' && (prevProps || newProps)) {
      (content as any).hyperlinkChange = {
        urlBefore: prevProps?.url,
        urlAfter: newProps?.url,
        textBefore: prevProps?.text,
        textAfter: newProps?.text,
      };
      // Set before/after for standard diff view
      if (prevProps?.url !== newProps?.url) {
        content.before = prevProps?.url;
        content.after = newProps?.url;
      } else if (prevProps?.text !== newProps?.text) {
        content.before = prevProps?.text;
        content.after = newProps?.text;
      }
    }

    // Build property change details if applicable
    let propertyChange: ChangeEntry['propertyChange'] | undefined;
    if (prevProps || newProps) {
      // Get the first property that changed
      const allKeys = new Set([
        ...Object.keys(prevProps || {}),
        ...Object.keys(newProps || {}),
      ]);
      const firstKey = Array.from(allKeys)[0];
      if (firstKey) {
        propertyChange = {
          property: firstKey,
          oldValue: this.formatPropertyValue(prevProps?.[firstKey]),
          newValue: this.formatPropertyValue(newProps?.[firstKey]),
        };
      }
    }

    // Use revision's location if available, otherwise fall back to index
    const revisionLocation = revision.getLocation();
    const location: ChangeLocation = {
      paragraphIndex: revisionLocation?.paragraphIndex ?? index, // Use actual or fallback
      sectionIndex: revisionLocation?.sectionIndex,
      runIndex: revisionLocation?.runIndex,
    };

    return {
      id: revision.getId().toString(),
      revisionType: type,
      category,
      description: this.describeRevision(revision, maxContextLength),
      author: revision.getAuthor(),
      date: revision.getDate(),
      location,
      content,
      propertyChange,
    };
  }

  /**
   * Get summary statistics for changelog entries.
   *
   * @param entries - Array of changelog entries
   * @returns Summary statistics
   */
  static getSummary(entries: ChangeEntry[]): ChangelogSummary {
    const byCategory: Record<ChangeCategory, number> = {
      content: 0,
      formatting: 0,
      structural: 0,
      table: 0,
      hyperlink: 0,
      image: 0,
      field: 0,
      comment: 0,
      bookmark: 0,
      contentControl: 0,
    };
    const byType: Record<string, number> = {};
    const byAuthor: Record<string, number> = {};
    let earliest: Date | null = null;
    let latest: Date | null = null;

    for (const entry of entries) {
      // Count by category
      byCategory[entry.category]++;

      // Count by type
      byType[entry.revisionType] = (byType[entry.revisionType] || 0) + 1;

      // Count by author
      byAuthor[entry.author] = (byAuthor[entry.author] || 0) + 1;

      // Track date range
      if (!earliest || entry.date < earliest) {
        earliest = entry.date;
      }
      if (!latest || entry.date > latest) {
        latest = entry.date;
      }
    }

    return {
      total: entries.length,
      byCategory,
      byType,
      byAuthor,
      dateRange: earliest && latest ? { earliest, latest } : null,
    };
  }

  /**
   * Consolidate similar changes into groups.
   * Groups changes that share: same type, same property, same new value.
   *
   * @param entries - Array of changelog entries
   * @returns Array of consolidated changes
   */
  static consolidate(entries: ChangeEntry[]): ConsolidatedChange[] {
    const groups = new Map<string, ChangeEntry[]>();

    for (const entry of entries) {
      // Create grouping key
      let key = `${entry.revisionType}_${entry.category}`;

      // For property changes, include the property name and new value
      if (entry.propertyChange) {
        key += `_${entry.propertyChange.property}_${entry.propertyChange.newValue || ''}`;
      }

      // For content changes by same author, group them
      key += `_${entry.author}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    }

    const consolidated: ConsolidatedChange[] = [];

    for (const [_, groupEntries] of groups) {
      const first = groupEntries[0];
      if (!first) continue;

      let description: string;

      if (groupEntries.length === 1) {
        description = first.description;
      } else {
        // Generate consolidated description
        description = this.generateConsolidatedDescription(groupEntries);
      }

      consolidated.push({
        description,
        count: groupEntries.length,
        category: first.category,
        commonAttributes: {
          author: this.allSame(groupEntries.map(e => e.author)) ? first.author : undefined,
          revisionType: first.revisionType,
          propertyChanged: first.propertyChange?.property,
          newValue: first.propertyChange?.newValue,
        },
        changeIds: groupEntries.map(e => e.id),
      });
    }

    // Sort by count descending
    consolidated.sort((a, b) => b.count - a.count);

    if (entries.length > 0) {
      getLogger().info('Entries consolidated', {
        input: entries.length,
        groups: consolidated.length,
        reduction: `${Math.round((1 - consolidated.length / entries.length) * 100)}%`
      });
    }

    return consolidated;
  }

  /**
   * Generate a consolidated description for a group of similar changes.
   */
  private static generateConsolidatedDescription(entries: ChangeEntry[]): string {
    const first = entries[0];
    if (!first) {
      return `${entries.length} changes`;
    }

    const count = entries.length;

    switch (first.revisionType) {
      case 'insert':
        return `Inserted text in ${count} locations`;
      case 'delete':
        return `Deleted text from ${count} locations`;
      case 'moveFrom':
      case 'moveTo':
        return `Moved content (${count} operations)`;
      case 'runPropertiesChange':
        if (first.propertyChange) {
          return `Changed ${first.propertyChange.property} to "${first.propertyChange.newValue}" (${count} times)`;
        }
        return `Changed run formatting (${count} times)`;
      case 'paragraphPropertiesChange':
        if (first.propertyChange) {
          return `Changed paragraph ${first.propertyChange.property} (${count} times)`;
        }
        return `Changed paragraph formatting (${count} times)`;
      case 'tablePropertiesChange':
      case 'tableRowPropertiesChange':
      case 'tableCellPropertiesChange':
        return `Changed table formatting (${count} times)`;
      case 'tableCellInsert':
        return `Inserted ${count} table cells`;
      case 'tableCellDelete':
        return `Deleted ${count} table cells`;
      case 'tableCellMerge':
        return `Merged table cells (${count} operations)`;
      case 'numberingChange':
        return `Changed list numbering (${count} times)`;
      case 'sectionPropertiesChange':
        return `Changed section properties (${count} times)`;
      default:
        return `${count} changes of type ${first.revisionType}`;
    }
  }

  /**
   * Check if all values in an array are the same.
   */
  private static allSame<T>(arr: T[]): boolean {
    if (arr.length === 0) return true;
    const first = arr[0];
    return arr.every(v => v === first);
  }

  /**
   * Categorize a revision into a semantic category.
   *
   * @param revision - Revision to categorize
   * @returns Semantic category
   */
  static categorize(revision: Revision): ChangeCategory {
    const type = revision.getType();

    switch (type) {
      // Content changes
      case 'insert':
      case 'delete':
        return 'content';

      // Structural changes
      case 'moveFrom':
      case 'moveTo':
      case 'sectionPropertiesChange':
        return 'structural';

      // Formatting changes
      case 'runPropertiesChange':
      case 'paragraphPropertiesChange':
      case 'numberingChange':
        return 'formatting';

      // Table changes
      case 'tablePropertiesChange':
      case 'tableExceptionPropertiesChange':
      case 'tableRowPropertiesChange':
      case 'tableCellPropertiesChange':
      case 'tableCellInsert':
      case 'tableCellDelete':
      case 'tableCellMerge':
        return 'table';

      // Hyperlink changes
      case 'hyperlinkChange':
        return 'hyperlink';

      // Rich content changes
      case 'imageChange':
        return 'image';

      case 'fieldChange':
        return 'field';

      case 'commentChange':
        return 'comment';

      case 'bookmarkChange':
        return 'bookmark';

      case 'contentControlChange':
        return 'contentControl';

      default:
        return 'content';
    }
  }

  /**
   * Check if a revision type is a property change type.
   */
  private static isPropertyChangeType(type: RevisionType): boolean {
    return [
      'runPropertiesChange',
      'paragraphPropertiesChange',
      'tablePropertiesChange',
      'tableExceptionPropertiesChange',
      'tableRowPropertiesChange',
      'tableCellPropertiesChange',
      'sectionPropertiesChange',
      'numberingChange',
    ].includes(type);
  }

  /**
   * Generate human-readable description for a revision.
   *
   * @param revision - Revision to describe
   * @param maxLength - Maximum length for text excerpts
   * @returns Human-readable description
   */
  static describeRevision(revision: Revision, maxLength: number = 50): string {
    const type = revision.getType();
    const author = revision.getAuthor();
    const runs = revision.getRuns();
    const text = runs.map(r => r.getText()).join('');
    const excerpt = text.length > maxLength
      ? `"${text.substring(0, maxLength)}..."`
      : text ? `"${text}"` : '';

    switch (type) {
      case 'insert':
        return excerpt ? `Inserted ${excerpt}` : 'Inserted content';
      case 'delete':
        return excerpt ? `Deleted ${excerpt}` : 'Deleted content';
      case 'moveFrom':
        return excerpt ? `Moved ${excerpt} from here` : 'Moved content from here';
      case 'moveTo':
        return excerpt ? `Moved ${excerpt} to here` : 'Moved content to here';
      case 'runPropertiesChange':
        return this.describePropertyChange(revision, 'run formatting');
      case 'paragraphPropertiesChange':
        return this.describePropertyChange(revision, 'paragraph formatting');
      case 'tablePropertiesChange':
        return 'Changed table properties';
      case 'tableExceptionPropertiesChange':
        return 'Changed table exception properties';
      case 'tableRowPropertiesChange':
        return 'Changed table row properties';
      case 'tableCellPropertiesChange':
        return 'Changed table cell properties';
      case 'sectionPropertiesChange':
        return 'Changed section properties';
      case 'tableCellInsert':
        return 'Inserted table cell';
      case 'tableCellDelete':
        return 'Deleted table cell';
      case 'tableCellMerge':
        return 'Merged table cells';
      case 'numberingChange':
        return 'Changed list numbering';
      case 'hyperlinkChange':
        return this.describeHyperlinkChange(revision, maxLength);
      case 'imageChange':
        return this.describeImageChange(revision);
      case 'fieldChange':
        return this.describeFieldChange(revision);
      case 'commentChange':
        return this.describeCommentChange(revision);
      case 'bookmarkChange':
        return this.describeBookmarkChange(revision);
      case 'contentControlChange':
        return this.describeContentControlChange(revision);
      default:
        return `Changed (${type})`;
    }
  }

  /**
   * Generate description for a hyperlink change revision.
   */
  private static describeHyperlinkChange(revision: Revision, maxLength: number): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};
    const changes: string[] = [];

    if (prevProps.url !== newProps.url) {
      changes.push('URL');
    }
    if (prevProps.text !== newProps.text) {
      changes.push('display text');
    }
    if (prevProps.formatting !== newProps.formatting) {
      changes.push('formatting');
    }

    if (changes.length === 0) {
      return 'Updated hyperlink';
    }

    return `Changed hyperlink ${changes.join(' and ')}`;
  }

  /**
   * Generate description for an image change revision.
   */
  private static describeImageChange(revision: Revision): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};
    const changes: string[] = [];

    // Detect type of change
    if (!prevProps.imageId && newProps.imageId) {
      return `Inserted image${newProps.filename ? ` "${newProps.filename}"` : ''}`;
    }
    if (prevProps.imageId && !newProps.imageId) {
      return `Deleted image${prevProps.filename ? ` "${prevProps.filename}"` : ''}`;
    }

    // Property changes
    if (prevProps.width !== newProps.width || prevProps.height !== newProps.height) {
      changes.push('size');
    }
    if (prevProps.position !== newProps.position) {
      changes.push('position');
    }
    if (prevProps.wrapping !== newProps.wrapping) {
      changes.push('wrapping');
    }
    if (prevProps.altText !== newProps.altText) {
      changes.push('alt text');
    }

    if (changes.length === 0) {
      return 'Updated image';
    }

    return `Changed image ${changes.join(' and ')}`;
  }

  /**
   * Generate description for a field change revision.
   */
  private static describeFieldChange(revision: Revision): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};

    // Detect type of change
    if (!prevProps.fieldType && newProps.fieldType) {
      return `Inserted ${newProps.fieldType || 'field'}`;
    }
    if (prevProps.fieldType && !newProps.fieldType) {
      return `Deleted ${prevProps.fieldType || 'field'}`;
    }

    // Value/formula changes
    if (prevProps.value !== newProps.value) {
      return `Updated ${newProps.fieldType || 'field'} value`;
    }
    if (prevProps.formula !== newProps.formula) {
      return `Changed ${newProps.fieldType || 'field'} formula`;
    }

    return `Updated ${newProps.fieldType || 'field'}`;
  }

  /**
   * Generate description for a comment change revision.
   */
  private static describeCommentChange(revision: Revision): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};

    // Detect type of change
    if (!prevProps.commentId && newProps.commentId) {
      return `Added comment${newProps.author ? ` by ${newProps.author}` : ''}`;
    }
    if (prevProps.commentId && !newProps.commentId) {
      return `Deleted comment${prevProps.author ? ` by ${prevProps.author}` : ''}`;
    }
    if (prevProps.text !== newProps.text) {
      return `Edited comment${newProps.author ? ` by ${newProps.author}` : ''}`;
    }

    return 'Updated comment';
  }

  /**
   * Generate description for a bookmark change revision.
   */
  private static describeBookmarkChange(revision: Revision): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};

    // Detect type of change
    if (!prevProps.bookmarkId && newProps.bookmarkId) {
      return `Created bookmark "${newProps.name || 'unnamed'}"`;
    }
    if (prevProps.bookmarkId && !newProps.bookmarkId) {
      return `Deleted bookmark "${prevProps.name || 'unnamed'}"`;
    }
    if (prevProps.name !== newProps.name) {
      return `Renamed bookmark from "${prevProps.name}" to "${newProps.name}"`;
    }
    if (prevProps.rangeStart !== newProps.rangeStart || prevProps.rangeEnd !== newProps.rangeEnd) {
      return `Changed bookmark "${newProps.name || 'unnamed'}" range`;
    }

    return `Updated bookmark "${newProps.name || prevProps.name || 'unnamed'}"`;
  }

  /**
   * Generate description for a content control change revision.
   */
  private static describeContentControlChange(revision: Revision): string {
    const prevProps = revision.getPreviousProperties() || {};
    const newProps = revision.getNewProperties() || {};

    // Detect type of change
    if (!prevProps.sdtId && newProps.sdtId) {
      return `Inserted content control${newProps.title ? ` "${newProps.title}"` : ''}`;
    }
    if (prevProps.sdtId && !newProps.sdtId) {
      return `Deleted content control${prevProps.title ? ` "${prevProps.title}"` : ''}`;
    }
    if (prevProps.title !== newProps.title) {
      return `Renamed content control to "${newProps.title}"`;
    }
    if (prevProps.content !== newProps.content) {
      return `Changed content control${newProps.title ? ` "${newProps.title}"` : ''} content`;
    }

    return `Updated content control${newProps.title || prevProps.title ? ` "${newProps.title || prevProps.title}"` : ''}`;
  }

  /**
   * Generate description for a property change revision.
   */
  private static describePropertyChange(revision: Revision, context: string): string {
    const prevProps = revision.getPreviousProperties();
    const newProps = revision.getNewProperties();

    if (!prevProps && !newProps) {
      return `Changed ${context}`;
    }

    // Get meaningful property names
    const propNames: string[] = [];
    const allKeys = new Set([
      ...Object.keys(prevProps || {}),
      ...Object.keys(newProps || {}),
    ]);

    for (const key of allKeys) {
      const oldVal = prevProps?.[key];
      const newVal = newProps?.[key];
      if (oldVal !== newVal) {
        propNames.push(this.friendlyPropertyName(key));
      }
    }

    if (propNames.length === 0) {
      return `Changed ${context}`;
    }

    if (propNames.length === 1) {
      return `Changed ${propNames[0]}`;
    }

    if (propNames.length <= 3) {
      return `Changed ${propNames.join(', ')}`;
    }

    return `Changed ${propNames.slice(0, 2).join(', ')} and ${propNames.length - 2} more`;
  }

  /**
   * Format a property value for display.
   * Handles objects, arrays, and primitives properly.
   */
  private static formatPropertyValue(value: unknown): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'object') {
      try {
        // For objects, use JSON.stringify for proper representation
        const json = JSON.stringify(value);
        // Truncate if too long
        return json.length > 100 ? json.substring(0, 97) + '...' : json;
      } catch {
        return '[complex value]';
      }
    }
    // For primitives, use String() for safe conversion
    return String(value);
  }

  /**
   * Convert property key to friendly name.
   */
  private static friendlyPropertyName(key: string): string {
    const friendlyNames: Record<string, string> = {
      // Run (character) properties
      b: 'bold',
      i: 'italic',
      u: 'underline',
      strike: 'strikethrough',
      dstrike: 'double strikethrough',
      sz: 'font size',
      szCs: 'complex script font size',
      color: 'text color',
      highlight: 'highlight',
      rFonts: 'font',
      rStyle: 'character style',
      vertAlign: 'vertical alignment',
      vanish: 'hidden text',
      caps: 'all capitals',
      smallCaps: 'small capitals',
      outline: 'outline effect',
      shadow: 'shadow effect',
      emboss: 'emboss effect',
      imprint: 'imprint effect',
      kern: 'kerning',
      w: 'character width',
      spacing: 'character spacing',
      position: 'text position',
      shd: 'shading',
      bdr: 'border',
      lang: 'language',
      eastAsianLayout: 'East Asian layout',
      specVanish: 'special vanish',
      oMath: 'math mode',

      // Paragraph properties
      jc: 'alignment',
      ind: 'indentation',
      pStyle: 'paragraph style',
      numPr: 'list numbering',
      pBdr: 'paragraph border',
      tabs: 'tab stops',
      suppressAutoHyphens: 'hyphenation',
      kinsoku: 'kinsoku rules',
      wordWrap: 'word wrap',
      overflowPunct: 'overflow punctuation',
      topLinePunct: 'top line punctuation',
      autoSpaceDE: 'auto space (DE)',
      autoSpaceDN: 'auto space (DN)',
      bidi: 'bidirectional',
      adjustRightInd: 'right indent adjustment',
      snapToGrid: 'snap to grid',
      contextualSpacing: 'contextual spacing',
      mirrorIndents: 'mirror indents',
      suppressOverlap: 'suppress overlap',
      outlineLvl: 'outline level',
      divId: 'HTML division',
      keepNext: 'keep with next',
      keepLines: 'keep lines together',
      pageBreakBefore: 'page break before',
      widowControl: 'widow/orphan control',
      suppressLineNumbers: 'suppress line numbers',
      textboxTightWrap: 'textbox tight wrap',

      // Table properties
      tblStyle: 'table style',
      tblW: 'table width',
      tblInd: 'table indent',
      tblBorders: 'table borders',
      tblCellMar: 'table cell margins',
      tblLook: 'table look',
      tblLayout: 'table layout',
      gridSpan: 'column span',
      vMerge: 'vertical merge',
      tcW: 'cell width',
      tcBorders: 'cell borders',
      vAlign: 'vertical alignment',
      textDirection: 'text direction',
      noWrap: 'no wrap',
      tcMar: 'cell margins',
      tcFitText: 'fit text',
      hideMark: 'hide mark',

      // Section properties
      sectPr: 'section properties',
      pgSz: 'page size',
      pgMar: 'page margins',
      cols: 'columns',
      docGrid: 'document grid',
      headerReference: 'header',
      footerReference: 'footer',
      pgNumType: 'page numbering',
      formProt: 'form protection',
      titlePg: 'different first page',
      type: 'section type',
    };

    return friendlyNames[key] || key;
  }

  /**
   * Export changelog to Markdown format.
   *
   * @param entries - Array of changelog entries
   * @param options - Export options
   * @returns Markdown string
   */
  static toMarkdown(
    entries: ChangeEntry[],
    options?: { includeMetadata?: boolean }
  ): string {
    const opts = { includeMetadata: true, ...options };
    const lines: string[] = [];

    lines.push('# Document Changes');
    lines.push('');

    if (opts.includeMetadata) {
      const summary = this.getSummary(entries);
      lines.push(`**Total Changes:** ${summary.total}`);
      lines.push('');

      if (summary.dateRange) {
        lines.push(`**Date Range:** ${summary.dateRange.earliest.toLocaleDateString()} - ${summary.dateRange.latest.toLocaleDateString()}`);
        lines.push('');
      }

      const authors = Object.keys(summary.byAuthor);
      if (authors.length > 0) {
        lines.push(`**Authors:** ${authors.join(', ')}`);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }

    // Group by category
    const byCategory = new Map<ChangeCategory, ChangeEntry[]>();
    for (const entry of entries) {
      if (!byCategory.has(entry.category)) {
        byCategory.set(entry.category, []);
      }
      byCategory.get(entry.category)!.push(entry);
    }

    const categoryTitles: Record<ChangeCategory, string> = {
      content: 'Content Changes',
      formatting: 'Formatting Changes',
      structural: 'Structural Changes',
      table: 'Table Changes',
      hyperlink: 'Hyperlink Changes',
      image: 'Image Changes',
      field: 'Field Changes',
      comment: 'Comment Changes',
      bookmark: 'Bookmark Changes',
      contentControl: 'Content Control Changes',
    };

    for (const [category, categoryEntries] of byCategory) {
      if (categoryEntries.length === 0) continue;

      lines.push(`## ${categoryTitles[category]}`);
      lines.push('');

      for (const entry of categoryEntries) {
        const date = entry.date.toLocaleDateString();
        lines.push(`- ${entry.description} *(${entry.author}, ${date})*`);

        if (entry.content.before) {
          lines.push(`  - Removed: "${entry.content.before}"`);
        }
        if (entry.content.after) {
          lines.push(`  - Added: "${entry.content.after}"`);
        }
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Export changelog to plain text format.
   *
   * @param entries - Array of changelog entries
   * @returns Plain text string
   */
  static toPlainText(entries: ChangeEntry[]): string {
    const lines: string[] = [];

    lines.push('DOCUMENT CHANGES');
    lines.push('================');
    lines.push('');

    for (const entry of entries) {
      const date = entry.date.toLocaleDateString();
      lines.push(`[${date}] ${entry.author}: ${entry.description}`);

      if (entry.content.before) {
        lines.push(`  - ${entry.content.before}`);
      }
      if (entry.content.after) {
        lines.push(`  + ${entry.content.after}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Export changelog to JSON (for programmatic consumption).
   *
   * @param entries - Array of changelog entries
   * @returns JSON string
   */
  static toJSON(entries: ChangeEntry[]): string {
    return JSON.stringify({
      generated: new Date().toISOString(),
      summary: this.getSummary(entries),
      entries,
    }, null, 2);
  }

  // ============================================================
  // Unified API (Phase 2 Enhancement)
  // ============================================================

  /**
   * Unified changelog generation - single entry point for all formats.
   *
   * Generates changelog from a document in the specified format.
   * This is the recommended method for most use cases.
   *
   * @param doc - Document to extract revisions from
   * @param options - Generation options including format
   * @returns Formatted changelog string
   *
   * @example
   * ```typescript
   * // Generate Markdown changelog
   * const md = ChangelogGenerator.generate(doc, { format: 'markdown' });
   *
   * // Generate HTML changelog
   * const html = ChangelogGenerator.generate(doc, { format: 'html' });
   *
   * // Generate CSV with filtering
   * const csv = ChangelogGenerator.generate(doc, {
   *   format: 'csv',
   *   filterAuthors: ['John Doe'],
   *   sortBy: 'date',
   *   sortOrder: 'desc'
   * });
   * ```
   */
  static generate(doc: Document, options?: ChangelogOptions): string {
    const logger = getLogger();
    const format = options?.format || 'markdown';

    logger.info('Generating changelog', { format });

    // Get entries with filtering
    let entries = this.fromDocument(doc, options);

    // Apply sorting if specified
    if (options?.sortBy) {
      entries = this.sortEntries(entries, options.sortBy, options.sortOrder || 'asc');
    }

    logger.info('Changelog entries processed', {
      entries: entries.length,
      format,
      sorted: !!options?.sortBy
    });

    // Generate output in specified format
    switch (format) {
      case 'json':
        return this.toJSON(entries);
      case 'markdown':
        return this.toMarkdown(entries, { includeMetadata: true });
      case 'text':
        return this.toPlainText(entries);
      case 'html':
        return this.toHTML(entries, options);
      case 'csv':
        return this.toCSV(entries);
      default:
        return this.toMarkdown(entries);
    }
  }

  /**
   * Export changelog to HTML format.
   *
   * Generates a complete HTML document with styling and structure.
   *
   * @param entries - Array of changelog entries
   * @param options - HTML generation options
   * @returns Complete HTML document string
   *
   * @example
   * ```typescript
   * const html = ChangelogGenerator.toHTML(entries);
   * fs.writeFileSync('changelog.html', html);
   * ```
   */
  static toHTML(entries: ChangeEntry[], options?: ChangelogOptions): string {
    const summary = this.getSummary(entries);

    // Group entries by category
    const byCategory = new Map<ChangeCategory, ChangeEntry[]>();
    for (const entry of entries) {
      if (!byCategory.has(entry.category)) {
        byCategory.set(entry.category, []);
      }
      byCategory.get(entry.category)!.push(entry);
    }

    const categoryTitles: Record<ChangeCategory, string> = {
      content: 'Content Changes',
      formatting: 'Formatting Changes',
      structural: 'Structural Changes',
      table: 'Table Changes',
      hyperlink: 'Hyperlink Changes',
      image: 'Image Changes',
      field: 'Field Changes',
      comment: 'Comment Changes',
      bookmark: 'Bookmark Changes',
      contentControl: 'Content Control Changes',
    };

    // Build HTML
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document Changes</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .summary { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .summary p { margin: 5px 0; }
    .category { margin-bottom: 30px; }
    .change-list { list-style: none; padding: 0; }
    .change-item {
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 12px 15px;
      margin-bottom: 10px;
    }
    .change-item:hover { box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .change-description { font-weight: 500; color: #2c3e50; }
    .change-meta { font-size: 0.85em; color: #7f8c8d; margin-top: 5px; }
    .change-content { margin-top: 8px; font-size: 0.9em; }
    .removed { color: #c0392b; text-decoration: line-through; }
    .added { color: #27ae60; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75em;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-insert { background: #d4edda; color: #155724; }
    .badge-delete { background: #f8d7da; color: #721c24; }
    .badge-formatting { background: #cce5ff; color: #004085; }
    .badge-structural { background: #fff3cd; color: #856404; }
    .badge-table { background: #e2e3e5; color: #383d41; }
  </style>
</head>
<body>
  <h1>Document Changes</h1>

  <div class="summary">
    <p><strong>Total Changes:</strong> ${summary.total}</p>`;

    if (summary.dateRange) {
      html += `
    <p><strong>Date Range:</strong> ${summary.dateRange.earliest.toLocaleDateString()} - ${summary.dateRange.latest.toLocaleDateString()}</p>`;
    }

    const authors = Object.keys(summary.byAuthor);
    if (authors.length > 0) {
      html += `
    <p><strong>Authors:</strong> ${authors.join(', ')}</p>`;
    }

    html += `
  </div>
`;

    // Add sections by category
    for (const [category, categoryEntries] of byCategory) {
      if (categoryEntries.length === 0) continue;

      html += `
  <section class="category">
    <h2>${categoryTitles[category]}</h2>
    <ul class="change-list">`;

      for (const entry of categoryEntries) {
        const badgeClass = this.getBadgeClass(entry.revisionType);
        const date = entry.date.toLocaleDateString();

        html += `
      <li class="change-item">
        <span class="badge ${badgeClass}">${entry.revisionType}</span>
        <div class="change-description">${this.escapeHTML(entry.description)}</div>
        <div class="change-meta">${this.escapeHTML(entry.author)} - ${date}</div>`;

        if (entry.content.before || entry.content.after) {
          html += `
        <div class="change-content">`;
          if (entry.content.before) {
            html += `<span class="removed">${this.escapeHTML(entry.content.before || '')}</span> `;
          }
          if (entry.content.after) {
            html += `<span class="added">${this.escapeHTML(entry.content.after || '')}</span>`;
          }
          html += `</div>`;
        }

        html += `
      </li>`;
      }

      html += `
    </ul>
  </section>`;
    }

    html += `
</body>
</html>`;

    return html;
  }

  /**
   * Export changelog to CSV format.
   *
   * Generates CSV data suitable for spreadsheet applications.
   *
   * @param entries - Array of changelog entries
   * @param options - CSV generation options
   * @returns CSV string
   *
   * @example
   * ```typescript
   * const csv = ChangelogGenerator.toCSV(entries);
   * fs.writeFileSync('changelog.csv', csv);
   * ```
   */
  static toCSV(entries: ChangeEntry[], options?: {
    delimiter?: string;
    includeHeaders?: boolean;
  }): string {
    const delimiter = options?.delimiter || ',';
    const includeHeaders = options?.includeHeaders !== false;

    const headers = [
      'ID',
      'Type',
      'Category',
      'Author',
      'Date',
      'Description',
      'Before',
      'After',
      'Paragraph',
      'Run'
    ];

    const lines: string[] = [];

    if (includeHeaders) {
      lines.push(headers.join(delimiter));
    }

    for (const entry of entries) {
      const row = [
        entry.id,
        entry.revisionType,
        entry.category,
        this.escapeCSV(entry.author),
        entry.date.toISOString(),
        this.escapeCSV(entry.description),
        this.escapeCSV(entry.content.before || ''),
        this.escapeCSV(entry.content.after || ''),
        entry.location.paragraphIndex?.toString() || '',
        entry.location.runIndex?.toString() || '',
      ];
      lines.push(row.join(delimiter));
    }

    return lines.join('\n');
  }

  /**
   * Get timeline view - changes organized by date.
   *
   * Groups changelog entries by date (YYYY-MM-DD) for timeline visualization.
   *
   * @param entries - Array of changelog entries
   * @returns Map of date strings to entries for that date
   *
   * @example
   * ```typescript
   * const timeline = ChangelogGenerator.getTimeline(entries);
   * for (const [date, dayEntries] of timeline) {
   *   console.log(`${date}: ${dayEntries.length} changes`);
   * }
   * ```
   */
  static getTimeline(entries: ChangeEntry[]): Map<string, ChangeEntry[]> {
    const timeline = new Map<string, ChangeEntry[]>();

    for (const entry of entries) {
      const dateKey = entry.date.toISOString().split('T')[0]!; // YYYY-MM-DD
      if (!timeline.has(dateKey)) {
        timeline.set(dateKey, []);
      }
      timeline.get(dateKey)!.push(entry);
    }

    // Sort the map by date
    const sortedTimeline = new Map<string, ChangeEntry[]>(
      [...timeline.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    );

    return sortedTimeline;
  }

  /**
   * Get summary by element type.
   *
   * Groups entries by the type of document element they affect.
   *
   * @param entries - Array of changelog entries
   * @returns Object with entries grouped by element type
   */
  static getSummaryByElement(entries: ChangeEntry[]): {
    paragraphs: ChangeEntry[];
    tables: ChangeEntry[];
    sections: ChangeEntry[];
    runs: ChangeEntry[];
    hyperlinks: ChangeEntry[];
  } {
    return {
      paragraphs: entries.filter(e =>
        e.revisionType === 'paragraphPropertiesChange' ||
        e.revisionType === 'numberingChange' ||
        (e.revisionType === 'insert' && !e.location.runIndex) ||
        (e.revisionType === 'delete' && !e.location.runIndex)
      ),
      tables: entries.filter(e =>
        ['tablePropertiesChange', 'tableRowPropertiesChange',
         'tableCellPropertiesChange', 'tableExceptionPropertiesChange',
         'tableCellInsert', 'tableCellDelete', 'tableCellMerge'].includes(e.revisionType)
      ),
      sections: entries.filter(e =>
        e.revisionType === 'sectionPropertiesChange'
      ),
      runs: entries.filter(e =>
        e.revisionType === 'runPropertiesChange' ||
        (e.revisionType === 'insert' && e.location.runIndex !== undefined) ||
        (e.revisionType === 'delete' && e.location.runIndex !== undefined)
      ),
      hyperlinks: entries.filter(e =>
        e.revisionType === 'hyperlinkChange'
      ),
    };
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Sort entries by specified field.
   * @internal
   */
  private static sortEntries(
    entries: ChangeEntry[],
    sortBy: 'date' | 'author' | 'type' | 'category',
    order: 'asc' | 'desc'
  ): ChangeEntry[] {
    const sorted = [...entries].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
        case 'type':
          comparison = a.revisionType.localeCompare(b.revisionType);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  /**
   * Get CSS badge class for revision type.
   * @internal
   */
  private static getBadgeClass(type: RevisionType): string {
    switch (type) {
      case 'insert':
      case 'moveTo':
      case 'tableCellInsert':
        return 'badge-insert';
      case 'delete':
      case 'moveFrom':
      case 'tableCellDelete':
        return 'badge-delete';
      case 'runPropertiesChange':
      case 'paragraphPropertiesChange':
      case 'numberingChange':
        return 'badge-formatting';
      case 'sectionPropertiesChange':
        return 'badge-structural';
      case 'tablePropertiesChange':
      case 'tableRowPropertiesChange':
      case 'tableCellPropertiesChange':
      case 'tableCellMerge':
        return 'badge-table';
      default:
        return 'badge-formatting';
    }
  }

  /**
   * Escape HTML special characters.
   * @internal
   */
  private static escapeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Escape CSV special characters.
   * @internal
   */
  private static escapeCSV(str: string): string {
    // If string contains delimiter, newline, or quotes, wrap in quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
