export const runWithoutNormalizing = (
  tx: { withoutNormalizing?: (fn: () => void) => void },
  fn: () => void
) => {
  if (tx.withoutNormalizing) {
    tx.withoutNormalizing(fn);
    return;
  }

  fn();
};
