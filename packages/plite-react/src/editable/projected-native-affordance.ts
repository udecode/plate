export type ProjectedNativeAffordanceStatus =
  | 'degraded'
  | 'supported'
  | 'unsupported';

export type ProjectedNativeAffordanceEntry = Readonly<{
  proof: string;
  status: ProjectedNativeAffordanceStatus;
}>;

export type ProjectedNativeAffordanceMatrix = Readonly<{
  clipboard: ProjectedNativeAffordanceEntry;
  find: ProjectedNativeAffordanceEntry;
  ime: ProjectedNativeAffordanceEntry;
  mobileSelection: ProjectedNativeAffordanceEntry;
  screenReader: ProjectedNativeAffordanceEntry;
  spellcheck: ProjectedNativeAffordanceEntry;
}>;

export const PROJECTED_NATIVE_AFFORDANCE_MATRIX =
  Object.freeze<ProjectedNativeAffordanceMatrix>({
    clipboard: {
      proof:
        'Model-owned projected selection writes text/plain, text/html, and Plite fragment payloads.',
      status: 'supported',
    },
    find: {
      proof:
        'Browser find indexes mounted DOM text, not private projected ViewSelection spans.',
      status: 'degraded',
    },
    ime: {
      proof:
        'Collapsed root-local IME remains native; expanded projected composition has no native-span proof.',
      status: 'degraded',
    },
    mobileSelection: {
      proof:
        'No raw-device mobile handle proof exists for expanded projected selection.',
      status: 'unsupported',
    },
    screenReader: {
      proof:
        'Private projected selection is model-owned and has no cross-root announcement proof.',
      status: 'degraded',
    },
    spellcheck: {
      proof:
        'Browser spellcheck remains root-local to mounted editable DOM, not projected spans.',
      status: 'degraded',
    },
  });

export const getProjectedNativeAffordanceMatrix =
  (): ProjectedNativeAffordanceMatrix => PROJECTED_NATIVE_AFFORDANCE_MATRIX;
