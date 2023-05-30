import {
  someNode,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';

export const useLinkToolbarButtonProps = () => {
  const type = ELEMENT_LINK;
  const editor = usePlateEditorState(useEventPlateId());
  const isLink = !!editor?.selection && someNode(editor, { match: { type } });

  return {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();

      triggerFloatingLink(editor, { focused: true });
    },
    pressed: isLink,
  };
};
