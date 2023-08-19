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
  getSelectionBoundingClientRect,
  UseVirtualFloatingOptions,
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

  return {
    floating,
    focused,
  };
};

export const useFloatingLinkInsert = ({
  floating,
  focused,
}: ReturnType<typeof useFloatingLinkInsertState>) => {
  const editor = usePlateEditorRef();
  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );

  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    floatingLinkActions.text(e.target.value);
  }, []);

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

  useFloatingLinkEscape();

  return {
    ref: useComposedRef<HTMLDivElement>(floating.refs.setFloating, ref),
    props: {
      style: {
        ...floating.style,
        zIndex: 1,
      },
    },
    textInputProps: {
      onChange,
      defaultValue: floatingLinkSelectors.text(),
    },
  };
};
