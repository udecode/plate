/**
 * Tracking Module - Automatic change tracking for docxmlater
 *
 * Provides infrastructure for tracking changes when Document.enableTrackChanges() is called.
 *
 * @module tracking
 */

export { TrackingContext, PendingChange } from './TrackingContext';
export {
  DocumentTrackingContext,
  TrackingEnableOptions,
} from './DocumentTrackingContext';
