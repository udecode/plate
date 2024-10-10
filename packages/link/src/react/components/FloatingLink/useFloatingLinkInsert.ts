import React from 'react';

import {
  focusEditor,
  useComposedRef,
  useEditorPlugin,
  useEditorReadOnly,
  useHotkeys,
  useOnClickOutside,
} from '@udecode/plate-common/react';
import {
  type UseVirtualFloatingOptions,
  getSelectionBoundingClientRect,
} from '@udecode/plate-floating';
import { useFocused } from 'slate-react';

import { LinkPlugin } from '../../LinkPlugin';
import { triggerFloatingLinkInsert } from '../../utils/triggerFloatingLinkInsert';
import { useFloatingLinkEscape } from './useFloatingLinkEscape';
import { useVirtualFloatingLink } from './useVirtualFloatingLink';

export type LinkFloatingToolbarState = {
  floatingOptions?: UseVirtualFloatingOptions;
};

export const useFloatingLinkInsertState = ({
  floatingOptions,
}: LinkFloatingToolbarState = {}) => {
  const { editor, getOptions, useOption } = useEditorPlugin(LinkPlugin);

  const { triggerFloatingLinkHotkeys } = getOptions();
  const readOnly = useEditorReadOnly();
  const focused = useFocused();
  const mode = useOption('mode');
  const isOpen = useOption('isOpen', editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: () => getSelectionBoundingClientRect(editor),
    open: isOpen && mode === 'insert',
    whileElementsMounted: () => () => {},
    ...floatingOptions,
  });

  return {
    floating,
    focused,
    isOpen,
    readOnly,
    triggerFloatingLinkHotkeys,
  };
};

export const useFloatingLinkInsert = ({
  floating,
  focused,
  isOpen,
  readOnly,
  triggerFloatingLinkHotkeys,
}: ReturnType<typeof useFloatingLinkInsertState>) => {
  const { api, editor, getOptions, setOption } = useEditorPlugin(LinkPlugin);

  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (e) => {
        setOption('text', e.target.value);
      },
      [setOption]
    );

  const ref = useOnClickOutside(
    () => {
      if (getOptions().mode === 'insert') {
        api.floatingLink.hide();
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
      setOption('updated', true);
    } else {
      setOption('updated', false);
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

  const { text, updated } = getOptions();

  const updatedValue = React.useCallback(
    (el: HTMLInputElement) => {
      if (el && updated) {
        el.value = getOptions().text;
      }
    },
    [getOptions, updated]
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
      defaultValue: text,
      ref: updatedValue,
      onChange,
    },
  };
};
