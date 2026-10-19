type TreeNode = Readonly<{ children?: readonly TreeNode[]; text?: string }>;

/** @internal */
export const survivalUnder = <N extends object>(goes: (node: N) => boolean) => {
  const memo = new WeakMap<N, boolean>();
  const survives = (node: N): boolean => {
    let value = memo.get(node);

    if (value === undefined) {
      const { children, text } = node as TreeNode;

      value =
        typeof text === 'string'
          ? !goes(node)
          : !goes(node) || ((children ?? []) as readonly N[]).some(liveContent);
      memo.set(node, value);
    }

    return value;
  };
  const liveContent = (node: N): boolean => {
    const { text } = node as TreeNode;

    return typeof text === 'string'
      ? !goes(node) && text !== ''
      : survives(node);
  };

  return { liveContent, survives };
};
