export {
  authored,
  createAuthoredPlugin,
  type AuthoredPlugin,
  type AuthoredTestOptions,
} from './authored';
export { authoredRecords } from './facts/records';
export {
  proposeAuthoredComparison,
  type AuthoredComparisonImportResult,
} from './comparison';
export {
  projectAuthoredDocument,
  projectAuthoredRange,
  type AuthoredFormatProjection,
} from './format';
export type { AuthoredMark } from './tree/marks';
export type { AuthoredRefusal } from './refusal';
export type {
  AuthoredChange,
  AuthoredChangeDetails,
  AuthoredChangeGroup,
  AuthoredChangesDelta,
  AuthoredChangeKind,
  AuthoredChangePart,
  AuthoredDecision,
  AuthoredDocumentProjection,
  AuthoredOptions,
  AuthoredPage,
  AuthoredProjectionDiagnostic,
  AuthoredProjectionRefusal,
  AuthoredQuery,
  AuthoredResult,
  AuthoredReview,
  AuthoredView,
} from './types';
