import { getPluginType } from '@udecode/plate';
import {
  someNode,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '@udecode/plate-link';

export const useLinkToolbarButtonState = () => {
  const editor = usePlateEditorState();
  const pressed =
    !!editor?.selection &&
    someNode(editor, { match: { type: getPluginType(editor, ELEMENT_LINK) } });

  return {
    pressed,
  };
};

export const useLinkToolbarButton = (
  state: ReturnType<typeof useLinkToolbarButtonState>
) => {
  const editor = usePlateEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();

        triggerFloatingLink(editor, { focused: true });
      },
    },
  };
};
