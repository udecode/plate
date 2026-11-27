type Entries = Record<string, unknown>;

const isPlainObject = (value: unknown): value is Entries => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);

  return proto === Object.prototype || proto === null;
};

const isElement = (value: Entries) =>
  typeof value.type === 'string' && Array.isArray(value.children);

const eachAgainst = (
  actual: unknown,
  expected: unknown,
  compare: (actual: unknown, expected: unknown) => unknown
) => {
  if (!Array.isArray(actual) || !Array.isArray(expected)) return actual;
  let changed = false;
  const items = actual.map((item, at) => {
    const next = compare(item, expected[at]);

    if (next !== item) changed = true;

    return next;
  });

  return changed ? items : actual;
};

const rebuildNodeLists = (actual: Entries, expected: Entries): Entries => {
  const next: Entries = {};
  const children = eachAgainst(actual.children, expected.children, node);

  if (children !== actual.children) next.children = children;
  const { roots } = actual;
  const askedRoots = expected.roots;

  if (isPlainObject(roots) && isPlainObject(askedRoots)) {
    const lists = Object.entries(roots).map(
      ([key, list]) => [key, eachAgainst(list, askedRoots[key], node)] as const
    );

    if (lists.some(([key, list]) => list !== roots[key])) {
      next.roots = Object.fromEntries(lists);
    }
  }

  return Object.keys(next).length === 0 ? actual : { ...actual, ...next };
};

const node = (actual: unknown, expected: unknown): unknown => {
  if (
    !isPlainObject(actual) ||
    !isPlainObject(expected) ||
    !isElement(actual)
  ) {
    return actual;
  }
  const rebuilt = rebuildNodeLists(actual, expected);

  if (!Object.hasOwn(actual, 'id') || Object.hasOwn(expected, 'id')) {
    return rebuilt;
  }
  const { id: _id, ...unasked } = rebuilt;

  return unasked;
};

const withoutUnaskedIds = (actual: unknown, expected: unknown): unknown => {
  if (Array.isArray(actual)) {
    return eachAgainst(actual, expected, withoutUnaskedIds);
  }
  if (!isPlainObject(actual) || !isPlainObject(expected)) return actual;

  return isElement(actual)
    ? node(actual, expected)
    : rebuildNodeLists(actual, expected);
};

const installed = Symbol.for('plate.withoutUnaskedIds');

// A runner that keeps a module across test files runs its setup once per
// file, so a second install must not wrap the first.
const installOnce = (target: object, install: () => void) => {
  const marked = target as { [installed]?: true };

  if (marked[installed]) return;
  marked[installed] = true;
  install();
};

const equalityMatchers = ['toEqual', 'toStrictEqual'] as const;

type Matcher = (this: object, expected: unknown) => unknown;

export const leaveUnaskedIdsOutOfVitest = (chai: {
  Assertion: { prototype: object };
  util: {
    flag: (assertion: object, key: string, value?: unknown) => unknown;
    overwriteMethod: (
      prototype: object,
      name: string,
      wrap: (builtin: Matcher) => Matcher
    ) => void;
  };
}) => {
  const { Assertion, util } = chai;

  installOnce(Assertion.prototype, () => {
    for (const name of equalityMatchers) {
      util.overwriteMethod(
        Assertion.prototype,
        name,
        (builtin) =>
          function compareAsked(this: object, expected: unknown) {
            util.flag(
              this,
              'object',
              withoutUnaskedIds(util.flag(this, 'object'), expected)
            );

            return builtin.call(this, expected);
          }
      );
    }
  });
};

type BunExpect = {
  (actual: unknown): object;
  extend: (
    matchers: Record<
      string,
      (
        received: unknown,
        expected: unknown
      ) => { message: () => string; pass: boolean }
    >
  ) => void;
};

export const leaveUnaskedIdsOutOfBun = (expect: BunExpect) => {
  const prototype = Object.getPrototypeOf(expect(null)) as Record<
    string,
    Matcher
  >;

  installOnce(prototype, () => {
    const builtins = {
      toEqual: prototype.toEqual,
      toStrictEqual: prototype.toStrictEqual,
    };
    const outcome = (
      name: (typeof equalityMatchers)[number],
      assertion: object,
      expected: unknown
    ) => {
      try {
        builtins[name].call(assertion, expected);

        return null;
      } catch (error) {
        return (error as Error).message;
      }
    };

    expect.extend(
      Object.fromEntries(
        equalityMatchers.map((name) => [
          name,
          (received: unknown, expected: unknown) => {
            const actual = withoutUnaskedIds(received, expected);
            const failure = outcome(name, expect(actual), expected);

            return {
              message: () =>
                failure ??
                outcome(
                  name,
                  (expect(actual) as { not: object }).not,
                  expected
                ) ??
                '',
              pass: failure === null,
            };
          },
        ])
      )
    );
  });
};

export const leaveUnaskedIdsOutOfAssert = async () => {
  const { default: strict } = await import('node:assert/strict');
  const methods = strict as unknown as Record<
    string,
    (actual: unknown, expected: unknown, ...rest: unknown[]) => void
  >;

  installOnce(strict, () => {
    for (const name of [
      'deepEqual',
      'deepStrictEqual',
      'notDeepEqual',
      'notDeepStrictEqual',
    ]) {
      const builtin = methods[name];

      methods[name] = (actual, expected, ...rest) =>
        builtin(withoutUnaskedIds(actual, expected), expected, ...rest);
    }
  });
};
