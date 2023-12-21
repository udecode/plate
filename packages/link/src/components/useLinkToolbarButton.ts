import {
  getPluginType,
  someNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import { ELEMENT_LINK, triggerFloatingLink } from '../index';

export const useLinkToolbarButtonState = () => {
  const pressed = useEditorSelector(
    (editor) =>
      !!editor?.selection &&
      someNode(editor, {
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      }),
    []
  );

  return {
    pressed,
  };
};

export const useLinkToolbarButton = (
  state: ReturnType<typeof useLinkToolbarButtonState>
) => {
  const editor = useEditorRef();

  return {
    props: {
      pressed: state.pressed,
      onClick: () => {
        triggerFloatingLink(editor, { focused: true });
      },
    },
  };
};
