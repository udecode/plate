import type { BaseEditor } from '@platejs/core';
import type { EditorUpdateTransaction, Path, Point } from '@platejs/plite';

type FootnoteNavigationOptions = {
  focus: boolean;
  scroll: boolean;
  scrollTarget: Point;
  select: Point;
  target: {
    path: Path;
    type: 'node';
  };
};

type NavigationTransaction = {
  navigation: {
    navigate: (options: FootnoteNavigationOptions) => boolean;
  };
};

const hasNavigationTransaction = (
  tx: EditorUpdateTransaction
): tx is EditorUpdateTransaction & NavigationTransaction => {
  if (!('navigation' in tx)) return false;

  const { navigation } = tx;

  return (
    typeof navigation === 'object' &&
    navigation !== null &&
    'navigate' in navigation &&
    typeof navigation.navigate === 'function'
  );
};

export const navigateToFootnote = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  { point, targetPath }: { point: Point; targetPath: Path }
) => {
  const options = {
    focus: true,
    scroll: true,
    scrollTarget: point,
    select: point,
    target: {
      path: targetPath,
      type: 'node',
    },
  } satisfies FootnoteNavigationOptions;

  if (hasNavigationTransaction(tx)) {
    return tx.navigation.navigate(options);
  }

  tx.selection.set({
    anchor: point,
    focus: point,
  });
  editor.api.dom.focus();
  editor.api.dom.scrollIntoView(point);

  return true;
};
