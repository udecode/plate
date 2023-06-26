import {
  getPluginType,
  someNode,
  usePlateEditorRef,
  usePlateEditorState,
} from '@udecode/plate-common';
import { ELEMENT_LINK, triggerFloatingLink } from '../index';

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
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        triggerFloatingLink(editor, { focused: true });
      },
    },
  };
};
