/**
 * The smallest React DevTools hook that hands each committed root to the
 * board-scale page. React DOM reads the hook once, when it loads, so the
 * Playwright spec installs it with `page.addInitScript` before the page's
 * scripts run. Production React calls `onCommitFiberRoot` after every commit,
 * which lets the production renderer count the shipped shape's renders from
 * outside its compiled body. It runs in the page, so it imports nothing.
 */
export const installCommitHook = () => {
  const target = window as unknown as Record<string, unknown> & {
    __BOARD_SCALE_COMMIT__?: (root: unknown) => void;
  };

  target.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    checkDCE: () => {},
    inject: () => 1,
    isDisabled: false,
    onCommitFiberRoot: (_renderer: number, root: unknown) => {
      target.__BOARD_SCALE_COMMIT__?.(root);
    },
    supportsFiber: true,
  };
};
