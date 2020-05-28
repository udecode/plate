import { useEffect } from 'react';
import { isSelectionExpanded } from 'common/queries';
import { getSelectionText } from 'common/queries/getSelectionText';
import { Editor } from 'slate';
import { setPositionAtSelection } from 'components/Toolbar/BalloonToolbar/setPositionAtSelection';

/**
 * Move when the selection changes.
 */
export const useBalloonMove = ({
  editor,
  ref,
  direction,
}: {
  editor: Editor;
  ref: any;
  direction: 'top' | 'bottom';
}) => {
  const selectionExpanded = isSelectionExpanded(editor);
  const selectionText = getSelectionText(editor);

  useEffect(() => {
    ref.current &&
      selectionExpanded &&
      setPositionAtSelection(ref.current, direction);
  }, [direction, selectionText.length, selectionExpanded, ref]);
};
