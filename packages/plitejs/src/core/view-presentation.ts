declare const viewPresentationBrand: unique symbol;

export type ViewPresentation = { readonly [viewPresentationBrand]: true };

type PresentationLife = {
  listeners: Set<() => void>;
  retainers: number;
};

const LIVES = new WeakMap<ViewPresentation, PresentationLife>();
const BASE_PRESENTATIONS = new WeakMap<object, ViewPresentation>();
const STATE_PRESENTATIONS = new WeakMap<object, ViewPresentation>();

export const setStatePresentation = (
  state: object,
  presentation: ViewPresentation
) => {
  STATE_PRESENTATIONS.set(state, presentation);
};

export const getStateViewPresentation = (
  state: object
): ViewPresentation | undefined => STATE_PRESENTATIONS.get(state);

export const createViewPresentation = () =>
  Object.freeze({}) as ViewPresentation;

export const getBaseViewPresentation = (owner: object) => {
  let presentation = BASE_PRESENTATIONS.get(owner);

  if (!presentation) {
    presentation = createViewPresentation();
    BASE_PRESENTATIONS.set(owner, presentation);
  }

  return presentation;
};

const lifeOf = (presentation: ViewPresentation) => {
  let life = LIVES.get(presentation);

  if (!life) {
    life = { listeners: new Set(), retainers: 0 };
    LIVES.set(presentation, life);
  }

  return life;
};

export const isViewPresentationRetained = (presentation: ViewPresentation) =>
  (LIVES.get(presentation)?.retainers ?? 0) > 0;

export const retainPresentation = (
  presentation: ViewPresentation
): (() => void) => {
  const life = lifeOf(presentation);
  let retained = true;

  life.retainers += 1;

  return () => {
    if (!retained) return;

    retained = false;
    life.retainers -= 1;
    if (life.retainers > 0) return;

    LIVES.delete(presentation);
    for (const listener of life.listeners) listener();
  };
};

export const onPresentationRelease = (
  presentation: ViewPresentation,
  listener: () => void
): (() => void) => {
  const { listeners } = lifeOf(presentation);

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
