/** Merge props by composing handlers. */
export const mergeProps = <T>(
  props?: T,
  overrideProps?: T,
  {
    handlerKeys,
    handlerQuery = (key) => key.startsWith('on'),
  }: {
    /** The keys of the handlers to merge. */
    handlerKeys?: string[];
    /**
     * A function that returns true if it's a handler to merge.
     *
     * Default: keys having `on` prefix.
     */
    handlerQuery?: ((key: string) => boolean) | null;
  } = {}
): T => {
  const map = new Map<string, ((...args: unknown[]) => void)[]>();

  const acc: any = {};

  const mapProps = (_props?: T) => {
    if (!_props) return;

    Object.entries(_props).forEach(([key, value]) => {
      if (
        (!handlerKeys || handlerKeys.includes(key)) &&
        (!handlerQuery || handlerQuery(key)) &&
        typeof value === 'function'
      ) {
        if (!map.has(key)) {
          map.set(key, []);
        }

        map.get(key)?.push(value as any);

        acc[key] = (...args: unknown[]) => {
          map.get(key)?.forEach((fn) => fn(...args));
        };
      } else {
        acc[key] = value;
      }
    });
  };

  mapProps(props);
  mapProps(overrideProps);

  return acc;
};
