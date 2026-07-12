import React from 'react';

import {
  type UseVirtualFloatingOptions,
  getDOMSelectionBoundingClientRect,
} from '@platejs/floating';
import {
  useEditorFocused,
  useEditorPlugin,
  useEditorReadOnly,
  usePluginOption,
} from '@platejs/core/react';
import { useHotkeys } from '@udecode/react-hotkeys';
import { useComposedRef, useOnClickOutside } from '@udecode/react-utils';

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
  const { editor, getOptions } = useEditorPlugin(LinkPlugin);

  const { triggerFloatingLinkHotkeys } = getOptions();
  const readOnly = useEditorReadOnly();
  const focused = useEditorFocused();
  const mode = usePluginOption(LinkPlugin, 'mode');
  const isOpen = usePluginOption(LinkPlugin, 'isOpen', editor.id);

  const floating = useVirtualFloatingLink({
    editorId: editor.id,
    getBoundingClientRect: getDOMSelectionBoundingClientRect,
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

export type FloatingLinkInsertProps = {
  hidden: boolean;
  props: { style: React.CSSProperties };
  ref: React.RefCallback<HTMLDivElement>;
  textInputProps: {
    defaultValue: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    ref: (element: HTMLInputElement) => void;
  };
};

export const useFloatingLinkInsert = ({
  floating,
  focused,
  isOpen,
  readOnly,
  triggerFloatingLinkHotkeys,
}: ReturnType<typeof useFloatingLinkInsertState>): FloatingLinkInsertProps => {
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
        editor.api.dom.focus();
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
    triggerFloatingLinkHotkeys ?? 'meta+k, ctrl+k',
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
    hidden: readOnly || !isOpen,
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
