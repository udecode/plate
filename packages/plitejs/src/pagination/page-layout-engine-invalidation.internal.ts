type InvalidatableEngine = Readonly<{ invalidate?: () => void }>;

type RegisteredInvalidator = Readonly<{
  local: () => void;
  shared?: () => void;
}>;

const REGISTERED_INVALIDATORS = new WeakMap<object, RegisteredInvalidator>();

export const registerPageLayoutEngineInvalidator = (
  engine: object,
  invalidator: RegisteredInvalidator
) => {
  REGISTERED_INVALIDATORS.set(engine, invalidator);
};

export const invalidatePageLayoutEngines = (
  engines: ReadonlySet<InvalidatableEngine>
) => {
  const sharedInvalidators = new Set<() => void>();

  engines.forEach((engine) => {
    const registered = REGISTERED_INVALIDATORS.get(engine);

    if (!registered) {
      engine.invalidate?.();
      return;
    }

    registered.local();
    if (registered.shared) sharedInvalidators.add(registered.shared);
  });
  sharedInvalidators.forEach((invalidate) => invalidate());
};
