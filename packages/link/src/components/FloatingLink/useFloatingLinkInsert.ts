import { ChangeEventHandler, useCallback, useEffect } from 'react';
import {
  focusEditor,
  getPluginOptions,
  useComposedRef,
  useHotkeys,
  useOnClickOutside,
  usePlateEditorRef,
  usePlateReadOnly,
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

export type LinkFloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
};

export const useFloatingLinkInsertState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const editor = usePlateEditorRef();
  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPlugin>(
    editor,
    ELEMENT_LINK
  );
  const readOnly = usePlateReadOnly();
  const focused = useFocused();
  const mode = useFloatingLinkSelectors().mode();
  const isOpen = useFloatingLinkSelectors().isOpen(editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    open: isOpen && mode === 'insert',
    getBoundingClientRect: getSelectionBoundingClientRect,
    whileElementsMounted: () => {},
    ...floatingOptions,
  });

  return {
    editor,
    triggerFloatingLinkHotkeys,
    floating,
    focused,
    isOpen,
    readOnly,
  };
};

export const useFloatingLinkInsert = ({
  editor,
  triggerFloatingLinkHotkeys,
  floating,
  focused,
  isOpen,
  readOnly,
}: ReturnType<typeof useFloatingLinkInsertState>) => {
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
      disabled: !isOpen,
    }
  );

  // wait for update before focusing input
  useEffect(() => {
    if (isOpen) {
      floating.update();
      floatingLinkActions.updated(true);
    } else {
      floatingLinkActions.updated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, floating.update]);

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
    hidden: readOnly,
    textInputProps: {
      onChange,
      defaultValue: floatingLinkSelectors.text(),
    },
  };
};
