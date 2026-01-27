/**
 * TrackingContext - Interface for automatic change tracking
 *
 * When enabled via Document.enableTrackChanges(), element setter methods
 * use this context to automatically create Revision objects for changes.
 *
 * @module TrackingContext
 */

import type { Revision, RevisionType } from '../elements/Revision';
import type { RevisionManager } from '../elements/RevisionManager';
import type { Run } from '../elements/Run';

/**
 * Pending change entry before flushing to RevisionManager
 */
export interface PendingChange {
  /** Type of revision to create */
  type: RevisionType;
  /** Property that changed */
  property: string;
  /** Value before the change */
  previousValue: any;
  /** Value after the change */
  newValue: any;
  /** Element that was modified */
  element: any;
  /** When the change occurred */
  timestamp: number;
  /** Count for consolidated changes */
  count?: number;
}

/**
 * Interface for tracking changes to document elements.
 *
 * Elements call tracking methods when their setters are invoked.
 * The context decides whether to create revisions based on enabled state.
 */
export interface TrackingContext {
  /**
   * Check if change tracking is currently enabled
   */
  isEnabled(): boolean;

  /**
   * Get the author name for new revisions
   */
  getAuthor(): string;

  /**
   * Get the RevisionManager for registering revisions
   */
  getRevisionManager(): RevisionManager;

  /**
   * Check if formatting changes should be tracked
   */
  isTrackFormattingEnabled(): boolean;

  /**
   * Track a Run property change (bold, italic, font, color, etc.)
   * @param run - The Run that was modified
   * @param property - Property name (e.g., 'bold', 'color')
   * @param oldValue - Value before the change
   * @param newValue - Value after the change
   */
  trackRunPropertyChange(
    run: Run,
    property: string,
    oldValue: any,
    newValue: any
  ): void;

  /**
   * Track a Paragraph property change (alignment, spacing, etc.)
   * @param paragraph - The Paragraph that was modified
   * @param property - Property name (e.g., 'alignment', 'spaceBefore')
   * @param oldValue - Value before the change
   * @param newValue - Value after the change
   */
  trackParagraphPropertyChange(
    paragraph: any,
    property: string,
    oldValue: any,
    newValue: any
  ): void;

  /**
   * Track a Hyperlink change (URL, anchor, text, formatting)
   * @param hyperlink - The Hyperlink that was modified
   * @param changeType - Type of change (e.g., 'url', 'text', 'formatting')
   * @param oldValue - Value before the change
   * @param newValue - Value after the change
   */
  trackHyperlinkChange(
    hyperlink: any,
    changeType: string,
    oldValue: any,
    newValue: any
  ): void;

  /**
   * Track a Table element property change
   * @param element - The table/row/cell that was modified
   * @param property - Property name
   * @param oldValue - Value before the change
   * @param newValue - Value after the change
   */
  trackTableChange(
    element: any,
    property: string,
    oldValue: any,
    newValue: any
  ): void;

  /**
   * Track text insertion
   * @param element - Element containing the insertion
   * @param text - Text that was inserted
   */
  trackInsertion(element: any, text: string): void;

  /**
   * Track text deletion
   * @param element - Element containing the deletion
   * @param text - Text that was deleted
   */
  trackDeletion(element: any, text: string): void;

  /**
   * Flush all pending changes and create Revision objects.
   * This is called automatically before document save.
   * @returns Array of created revisions
   */
  flushPendingChanges(): Revision[];
}
