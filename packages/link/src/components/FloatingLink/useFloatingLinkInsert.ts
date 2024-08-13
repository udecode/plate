import React from 'react';

import { getPluginOptions } from '@udecode/plate-common';
import {
  focusEditor,
  useComposedRef,
  useEditorReadOnly,
  useEditorRef,
  useHotkeys,
  useOnClickOutside,
} from '@udecode/plate-common/react';
import {
  type UseVirtualFloatingOptions,
  getSelectionBoundingClientRect,
} from '@udecode/plate-floating';
import { useFocused } from 'slate-react';

import { LinkPlugin, type LinkPluginOptions } from '../../LinkPlugin';
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
  const editor = useEditorRef();
  const { triggerFloatingLinkHotkeys } = getPluginOptions<LinkPluginOptions>(
    editor,
    LinkPlugin.key
  );
  const readOnly = useEditorReadOnly();
  const focused = useFocused();
  const mode = useFloatingLinkSelectors().mode();
  const isOpen = useFloatingLinkSelectors().isOpen(editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: getSelectionBoundingClientRect,
    open: isOpen && mode === 'insert',
    whileElementsMounted: () => {},
    ...floatingOptions,
  });

  return {
    editor,
    floating,
    focused,
    isOpen,
    readOnly,
    triggerFloatingLinkHotkeys,
  };
};

export const useFloatingLinkInsert = ({
  editor,
  floating,
  focused,
  isOpen,
  readOnly,
  triggerFloatingLinkHotkeys,
}: ReturnType<typeof useFloatingLinkInsertState>) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
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
  React.useEffect(() => {
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

  const updated = floatingLinkSelectors.updated();
  const updatedValue = React.useCallback(
    (el: HTMLInputElement) => {
      if (el && updated) {
        el.value = floatingLinkSelectors.text();
      }
    },
    [updated]
  );

  return {
    hidden: readOnly,
    props: {
      style: {
        ...floating.style,
        zIndex: 50,
      },
    },
    ref: useComposedRef<HTMLDivElement>(floating.refs.setFloating, ref),
    textInputProps: {
      defaultValue: floatingLinkSelectors.text(),
      onChange,
      ref: updatedValue,
    },
  };
};
