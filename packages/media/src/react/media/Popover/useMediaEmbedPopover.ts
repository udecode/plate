import React, { useEffect } from 'react';

import { focusEditor, useEditorPlugin } from '@udecode/plate-common/react';

import { MediaEmbedPlugin } from '../MediaEmbedPlugin';
import { useMediaEmbedEnter } from './useMediaEmbedEnter';
import { useMediaEmbedEscape } from './useMediaEmbedEscape';

export const useMediaEmbedPopover = () => {
  const { editor, setOption, tf, useOption } =
    useEditorPlugin(MediaEmbedPlugin);
  const isOpen = useOption('isOpen');
  const url = useOption('url');

  const handleCancel = () => {
    setOption('isOpen', false);
    focusEditor(editor);
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);
  }, [isOpen]);

  useMediaEmbedEscape();
  useMediaEmbedEnter();

  return {
    acceptProps: {
      onClick: () => tf.media_embed.embed(url!),
    },
    cancelProps: {
      onClick: handleCancel,
    },
    inputProps: {
      ref: inputRef,
      value: useOption('url'),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setOption('url', e.target.value),
    },
  };
};
