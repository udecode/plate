type MergePropsOptions = {
  /** The keys of the handlers to merge. */
  handlerKeys?: readonly string[];
  /**
   * A function that returns true if it's a handler to merge.
   *
   * Default: keys having `on` prefix.
   */
  handlerQuery?: ((key: string) => boolean) | null;
};

/** Merge props by composing handlers. */
export function mergeProps<T extends object>(
  props?: T,
  overrideProps?: T,
  options?: MergePropsOptions
): T;
export function mergeProps(
  props?: object,
  overrideProps?: object,
  {
    handlerKeys,
    handlerQuery = (key) => key.startsWith('on'),
  }: MergePropsOptions = {}
) {
  const handlersByKey = new Map<string, Array<(...args: unknown[]) => void>>();
  const handlerKeySet = handlerKeys ? new Set(handlerKeys) : null;
  const mergedProps: Record<string, unknown> = {};

  const addProps = (_props?: object) => {
    if (!_props) return;

    for (const [key, value] of Object.entries(_props)) {
      if (
        (!handlerKeySet || handlerKeySet.has(key)) &&
        (!handlerQuery || handlerQuery(key)) &&
        typeof value === 'function'
      ) {
        let handlers = handlersByKey.get(key);
        if (!handlers) {
          handlers = [];
          handlersByKey.set(key, handlers);
        }

        handlers.push((...args) => {
          Reflect.apply(value, undefined, args);
        });

        mergedProps[key] = (...args: unknown[]) => {
          const currentHandlers = handlersByKey.get(key);
          if (currentHandlers) {
            for (const handler of currentHandlers) {
              handler(...args);
            }
          }
        };
      } else {
        mergedProps[key] = value;
      }
    }
  };

  addProps(props);
  addProps(overrideProps);

  return mergedProps;
}
