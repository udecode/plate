import { ChangeEventHandler, useCallback, useEffect } from 'react';
import {
  focusEditor,
  getPluginOptions,
  useComposedRef,
  useHotkeys,
  useOnClickOutside,
  usePlateEditorRef,
} from '@udecode/plate-common';
import {
  UseVirtualFloatingOptions,
  getSelectionBoundingClientRect,
} from '@udecode/plate-floating';
import { useFocused } from 'slate-react';

import { ELEMENT_LINK, LinkPlugin } from '../../createLinkPlugin';
import { triggerFloatingLinkInsert } from '../../utils/triggerFloatingLinkInsert';
import {
  floatingLinkActions,
  floatingLinkSelectors,
  useFloatingLinkSelectors,
} from './floatingLinkStore';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export const useFloatingLinkInsertState = ({
  floatingOptions,
}: {
  floatingOptions?: UseVirtualFloatingOptions;
} = {}) => {
  const editor = usePlateEditorRef();
  const focused = useFocused();
  const mode = useFloatingLinkSelectors().mode();
  const open = useFloatingLinkSelectors().isOpen(editor.id);

  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );

  useHotkeys(
    triggerFloatingLinkHotkeys!,
    (e) => {
      if (triggerFloatingLinkInsert(editor, { focused })) {
        e.preventDefault();
      }
    },
    {
      enableOnContentEditable: true,
    },
    [focused]
  );

  const ref = useOnClickOutside(
    () => {
      if (floatingLinkSelectors.mode() === 'insert') {
        floatingLinkActions.hide();
        focusEditor(editor, editor.selection!);
      }
    },
    {
      disabled: !open,
    }
  );

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    open: open && mode === 'insert',
    getBoundingClientRect: getSelectionBoundingClientRect,
    whileElementsMounted: () => {},
    ...floatingOptions,
  });
  const { update } = floating;

  // wait for update before focusing input
  useEffect(() => {
    if (open) {
      update();
      floatingLinkActions.updated(true);
    } else {
      floatingLinkActions.updated(false);
    }
  }, [open, update]);

  useFloatingLinkEscape();

  return {
    floating,
    refClickOutside: ref,
  };
};

export const useFloatingLinkInsert = (
  state: ReturnType<typeof useFloatingLinkInsertState>
) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.text(e.target.value);
  }, []);

  return {
    ref: useComposedRef<HTMLDivElement>(
      state.floating.refs.setFloating,
      state.refClickOutside
    ),
    props: {
      style: {
        ...state.floating.style,
        zIndex: 1,
      },
    },
    textInputProps: {
      onChange,
      defaultValue: floatingLinkSelectors.text(),
    },
  };
};
