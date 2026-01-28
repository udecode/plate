/**
 * DocumentTrackingContext - Implementation of automatic change tracking
 *
 * Manages pending changes and creates Revision objects when flushed.
 * Supports consolidation of similar changes within a time window.
 *
 * @module DocumentTrackingContext
 */

import { Revision, RevisionType } from '../elements/Revision';
import { RevisionManager } from '../elements/RevisionManager';
import { Run } from '../elements/Run';
import { Paragraph } from '../elements/Paragraph';
import type { TrackingContext, PendingChange } from './TrackingContext';

/**
 * Enable options for tracking context
 */
export interface TrackingEnableOptions {
  /** Author name for new revisions (default: 'DocHub') */
  author?: string;
  /** Whether to track formatting changes (default: true) */
  trackFormatting?: boolean;
}

/**
 * Implementation of TrackingContext for Document
 */
export class DocumentTrackingContext implements TrackingContext {
  private enabled = false;
  private trackFormatting = true;
  private author = 'DocHub';
  private revisionManager: RevisionManager;

  /** Pending changes waiting to be flushed */
  private pendingChanges = new Map<string, PendingChange>();

  /** Properties considered "formatting" (vs structural) */
  private static readonly FORMATTING_PROPERTIES = new Set([
    'bold',
    'italic',
    'underline',
    'strike',
    'dstrike',
    'subscript',
    'superscript',
    'font',
    'size',
    'color',
    'highlight',
    'smallCaps',
    'allCaps',
    'characterSpacing',
    'scaling',
    'position',
    'emphasis',
    'shadow',
    'emboss',
    'imprint',
    'outline',
    'vanish',
  ]);

  /**
   * Creates a new DocumentTrackingContext
   * @param revisionManager - RevisionManager to register revisions with
   */
  constructor(revisionManager: RevisionManager) {
    this.revisionManager = revisionManager;
  }

  /**
   * Enable change tracking
   * @param options - Enable options
   */
  enable(options?: TrackingEnableOptions): void {
    this.enabled = true;
    if (options?.author) {
      this.author = options.author;
    }
    if (options?.trackFormatting !== undefined) {
      this.trackFormatting = options.trackFormatting;
    }
  }

  /**
   * Disable change tracking and flush pending changes
   */
  disable(): void {
    this.flushPendingChanges();
    this.enabled = false;
  }

  /**
   * Set the author for new revisions
   * Flushes any pending changes before switching to prevent mixed authorship
   * @param author - Author name
   */
  setAuthor(author: string): void {
    // Flush pending changes before switching authors to prevent mixed authorship
    if (this.enabled && this.pendingChanges.size > 0) {
      this.flushPendingChanges();
    }
    this.author = author;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TrackingContext Interface Implementation
  // ═══════════════════════════════════════════════════════════════════════════

  isEnabled(): boolean {
    return this.enabled;
  }

  getAuthor(): string {
    return this.author;
  }

  getRevisionManager(): RevisionManager {
    return this.revisionManager;
  }

  isTrackFormattingEnabled(): boolean {
    return this.trackFormatting;
  }

  trackRunPropertyChange(
    run: Run,
    property: string,
    oldValue: any,
    newValue: any
  ): void {
    if (!this.enabled) return;
    if (oldValue === newValue) return;

    // Skip formatting changes if not tracking them
    if (
      !this.trackFormatting &&
      DocumentTrackingContext.FORMATTING_PROPERTIES.has(property)
    ) {
      return;
    }

    // Create consolidation key
    const key = `runProp:${property}:${this.stringifyValue(newValue)}`;

    this.addPendingChange(key, {
      type: 'runPropertiesChange',
      property,
      previousValue: oldValue,
      newValue,
      element: run,
      timestamp: Date.now(),
    });
  }

  trackParagraphPropertyChange(
    paragraph: any,
    property: string,
    oldValue: any,
    newValue: any
  ): void {
    if (!this.enabled) return;
    if (oldValue === newValue) return;

    const key = `paraProp:${property}:${this.stringifyValue(newValue)}`;

    this.addPendingChange(key, {
      type: 'paragraphPropertiesChange',
      property,
      previousValue: oldValue,
      newValue,
      element: paragraph,
      timestamp: Date.now(),
    });
  }

  trackHyperlinkChange(
    hyperlink: any,
    changeType: string,
    oldValue: any,
    newValue: any
  ): void {
    if (!this.enabled) return;
    if (oldValue === newValue) return;

    // Hyperlink changes use dedicated type for proper categorization
    const key = `hyperlink:${changeType}:${this.stringifyValue(newValue)}`;

    this.addPendingChange(key, {
      type: 'hyperlinkChange',
      property: changeType,
      previousValue: oldValue,
      newValue,
      element: hyperlink,
      timestamp: Date.now(),
    });
  }

  trackTableChange(
    element: any,
    property: string,
    oldValue: any,
    newValue: any
  ): void {
    if (!this.enabled) return;
    if (oldValue === newValue) return;

    // Determine revision type based on element type
    let type: RevisionType = 'tablePropertiesChange';
    const elementType = element?.constructor?.name || 'unknown';

    if (elementType === 'TableRow') {
      type = 'tableRowPropertiesChange';
    } else if (elementType === 'TableCell') {
      type = 'tableCellPropertiesChange';
    }

    const key = `table:${elementType}:${property}:${this.stringifyValue(newValue)}`;

    this.addPendingChange(key, {
      type,
      property,
      previousValue: oldValue,
      newValue,
      element,
      timestamp: Date.now(),
    });
  }

  trackInsertion(element: any, text: string): void {
    if (!this.enabled) return;
    if (!text) return;

    const key = `insert:${Date.now()}:${text.substring(0, 20)}`;

    this.addPendingChange(key, {
      type: 'insert',
      property: 'text',
      previousValue: undefined,
      newValue: text,
      element,
      timestamp: Date.now(),
    });
  }

  trackDeletion(element: any, text: string): void {
    if (!this.enabled) return;
    if (!text) return;

    const key = `delete:${Date.now()}:${text.substring(0, 20)}`;

    this.addPendingChange(key, {
      type: 'delete',
      property: 'text',
      previousValue: text,
      newValue: undefined,
      element,
      timestamp: Date.now(),
    });
  }

  flushPendingChanges(): Revision[] {
    const revisions: Revision[] = [];

    // Group pending changes by paragraph for consolidation
    const paragraphChanges = new Map<Paragraph, PendingChange[]>();

    for (const [, pending] of this.pendingChanges) {
      const revision = this.createRevision(pending);
      this.revisionManager.register(revision);
      revisions.push(revision);

      // For paragraph property changes, collect changes by paragraph
      if (pending.type === 'paragraphPropertiesChange' && pending.element instanceof Paragraph) {
        const changes = paragraphChanges.get(pending.element) || [];
        changes.push(pending);
        paragraphChanges.set(pending.element, changes);
      }
    }

    // Apply pPrChange to each paragraph that has property changes
    for (const [paragraph, changes] of paragraphChanges) {
      // Build previous properties from all changes to this paragraph
      const newPreviousProperties: Record<string, any> = {};
      let latestTimestamp = 0;

      for (const change of changes) {
        if (change.previousValue !== undefined) {
          newPreviousProperties[change.property] = change.previousValue;
        }
        if (change.timestamp > latestTimestamp) {
          latestTimestamp = change.timestamp;
        }
      }

      // CRITICAL: Merge with existing pPrChange if present to avoid nested tracked changes
      // When a document already has tracked changes, we need to preserve the original
      // "previous" state for properties that aren't changing now, while updating
      // properties that ARE changing now with their current (pre-change) values
      const existingChange = paragraph.formatting.pPrChange;

      if (existingChange) {
        // Preserve the original pPrChange - this represents what accepting ALL changes would revert to
        // We only update the previousProperties for properties we're NEWLY changing
        const mergedPreviousProperties: Record<string, any> = {
          // Start with existing previous properties (original state before any tracked changes)
          ...(existingChange.previousProperties || {}),
        };

        // For properties we're changing NOW, the "previous" state is their current value
        // (which may already reflect the original tracked change)
        for (const [prop, value] of Object.entries(newPreviousProperties)) {
          // Only update if this property wasn't already in the original pPrChange
          // OR if we're changing the same property again (update the "before" state)
          mergedPreviousProperties[prop] = value;
        }

        // Keep the original author/date/id - represents the first tracked change
        // This ensures Word only requires ONE "Accept" to accept all changes
        // Per ECMA-376 Part 1 §17.13.5.29, w:pPrChange MUST contain a w:pPr child element.
        // Only keep pPrChange if there are properties to track.
        if (Object.keys(mergedPreviousProperties).length > 0) {
          paragraph.formatting.pPrChange = {
            author: existingChange.author,
            date: existingChange.date,
            id: existingChange.id,
            previousProperties: mergedPreviousProperties,
          };
        } else {
          // No properties to track - remove the pPrChange to avoid empty element corruption
          delete paragraph.formatting.pPrChange;
        }
      } else {
        // No existing pPrChange - create a new one ONLY if there are previous properties to record
        // Per ECMA-376 Part 1 §17.13.5.29, w:pPrChange MUST contain a w:pPr child element.
        // Creating pPrChange without previousProperties results in empty <w:pPrChange/> which
        // causes Word to report "unreadable content" corruption.
        if (Object.keys(newPreviousProperties).length > 0) {
          // Use consumeNextId() to ensure unique IDs - peekNextId() was causing duplicate IDs
          const revisionId = this.revisionManager.consumeNextId();
          paragraph.formatting.pPrChange = {
            author: this.author,
            date: new Date(latestTimestamp).toISOString(),
            id: String(revisionId),
            previousProperties: newPreviousProperties,
          };
        }
        // If no previous properties, don't create pPrChange at all
      }
    }

    this.pendingChanges.clear();
    return revisions;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Private Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add a pending change, consolidating with existing if same key
   */
  private addPendingChange(key: string, change: PendingChange): void {
    const existing = this.pendingChanges.get(key);
    if (existing) {
      existing.count = (existing.count || 1) + 1;
      // Keep the first previousValue for consolidated changes
    } else {
      this.pendingChanges.set(key, { ...change, count: 1 });
    }
  }

  /**
   * Create a Revision from a pending change
   */
  private createRevision(pending: PendingChange): Revision {
    const previousProps: Record<string, any> = {};
    const newProps: Record<string, any> = {};

    if (pending.previousValue !== undefined) {
      previousProps[pending.property] = pending.previousValue;
    }
    if (pending.newValue !== undefined) {
      newProps[pending.property] = pending.newValue;
    }

    // Get or create a Run for the revision content
    const run = this.getRunFromElement(pending.element);

    return new Revision({
      author: this.author,
      type: pending.type,
      content: run,
      previousProperties:
        Object.keys(previousProps).length > 0 ? previousProps : undefined,
      newProperties: Object.keys(newProps).length > 0 ? newProps : undefined,
      date: new Date(pending.timestamp),
    });
  }

  /**
   * Get or create a Run from an element for revision content
   */
  private getRunFromElement(element: any): Run {
    if (element instanceof Run) {
      return element;
    }

    // For other elements, create a placeholder Run with description
    const text =
      element?.getText?.() ||
      element?.constructor?.name ||
      'Unknown element';
    return new Run(typeof text === 'string' ? text : String(text));
  }

  /**
   * Stringify a value for use in consolidation key
   */
  private stringifyValue(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Get count of pending changes
   */
  getPendingCount(): number {
    return this.pendingChanges.size;
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges(): boolean {
    return this.pendingChanges.size > 0;
  }

  /**
   * Clear all pending changes without creating revisions
   */
  clearPendingChanges(): void {
    this.pendingChanges.clear();
  }
}
