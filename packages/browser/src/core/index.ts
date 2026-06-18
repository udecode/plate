export {
  createSlateBrowserFeatureContractRegistry,
  defineSlateBrowserFeatureContract,
  type SlateBrowserFeatureContractDefinition,
  type SlateBrowserFeatureContractRegistry,
  type SlateBrowserFeatureContractRow,
} from './feature-contracts';
export {
  assertSlateBrowserFirstPartyParityContracts,
  SLATE_BROWSER_FIRST_PARTY_FEATURE_CONTRACT_REGISTRY,
  SLATE_BROWSER_FIRST_PARTY_OPERATION_FAMILY_CONTRACTS,
  SLATE_BROWSER_FIRST_PARTY_PARITY_FAMILIES,
  type SlateBrowserFirstPartyParityContractResult,
  type SlateBrowserFirstPartyParityFamily,
  type SlateBrowserOperationFamilyContract,
} from './first-party-browser-contracts';
export {
  type BrowserMobileScenarioId,
  type DebugPlaceholderShape,
  type DebugSnapshot,
  evaluateImeInput,
  evaluatePlaceholderInput,
  extractAgentBrowserDebugSnapshot,
  extractAppiumDebugSnapshot,
  type PlaceholderInputEvaluation,
  type ProofEvidenceClass,
  parseAgentBrowserBatch,
  parseDebugSnapshot,
} from './proof';
export {
  assertSlateBrowserReleaseProof,
  createBrowserMobileReleaseProofArtifact,
  createPersistentBrowserSoakProofArtifact,
  createReleaseDisciplineProofArtifact,
  SLATE_BROWSER_RELEASE_DISCIPLINE_GUARDS,
  type SlateBrowserMobileDeviceProofArtifact,
  type SlateBrowserReleaseClaim,
  type SlateBrowserReleaseDisciplineProofArtifact,
  type SlateBrowserReleaseProofArtifact,
  type SlateBrowserReleaseProofResult,
  validateSlateBrowserReleaseProof,
} from './release-proof';
export {
  isCollapsed,
  type Path,
  type Point,
  type Range,
  serializePoint,
  serializeRange,
} from './selection';
