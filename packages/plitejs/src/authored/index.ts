export { authored, type AuthoredPlugin } from './authored';
export {
  proposeAuthoredComparison,
  type AuthoredComparisonImportResult,
} from './comparison';
export { projectAuthoredRange } from '../core/authored-runtime';
export {
  createAuthoredImportedRevisionChange,
  createAuthoredReviewDocument,
  deserializeAuthoredJson,
  readAuthoredFormatSnapshot,
  serializeAuthoredJson,
  type AuthoredFormatDiagnostic,
  type AuthoredFormatProjection,
  type AuthoredFormatPropertyChange,
  type AuthoredFormatSegment,
  type AuthoredFormatSnapshot,
  type AuthoredImportedRevision,
  type AuthoredImportedRevisionSection,
  type AuthoredJsonProjection,
  type AuthoredJsonResult,
} from './format';
export type {
  AuthoredChange,
  AuthoredChangePublication,
  AuthoredChangeContent,
  AuthoredChangeDetails,
  AuthoredChangeKind,
  AuthoredChangeLocation,
  AuthoredChangePart,
  AuthoredChangeReview,
  AuthoredDecision,
  AuthoredOptions,
  AuthoredPage,
  AuthoredQuery,
  AuthoredResult,
  AuthoredSelection,
  AuthoredStatus,
  AuthoredView,
} from './types';
