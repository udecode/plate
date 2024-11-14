import React, { useEffect } from 'react';

import {
  getAboveNode,
  getEndPoint,
  getStartPoint,
  mergeProps,
} from '@udecode/plate-common';
import {
  useComposedRef,
  useEditorPlugin,
  useOnClickOutside,
} from '@udecode/plate-common/react';
import {
  type UseVirtualFloatingOptions,
  getDOMSelectionBoundingClientRect,
  getRangeBoundingClientRect,
  useVirtualFloating,
} from '@udecode/plate-floating';

import { MediaEmbedPlugin } from '../MediaEmbedPlugin';
import { useMediaEmbedEnter } from './useMediaEmbedEnter';
import { useMediaEmbedEscape } from './useMediaEmbedEscape';

export const useMediaFloatingToolbar = (
  floatingOptions: UseVirtualFloatingOptions
) => {
  const { api, editor, setOption, tf, type, useOption } =
    useEditorPlugin(MediaEmbedPlugin);
  const isOpen = useOption('isFloatingOpen');
  const url = useOption('url');
  const getBoundingClientRect = React.useCallback(() => {
    const entry = getAboveNode(editor, {
      match: { type },
    });

    if (entry) {
      const [, path] = entry;

      return getRangeBoundingClientRect(editor, {
        anchor: getStartPoint(editor, path),
        focus: getEndPoint(editor, path),
      });
    }

    return getDOMSelectionBoundingClientRect();
  }, [editor, type]);

  const clickOutsideRef = useOnClickOutside(() => {
    if (!isOpen) return;

    api.media_embed.hideFloating();
  });

  const floating = useVirtualFloating(
    mergeProps(
      {
        getBoundingClientRect,
        open: isOpen,
      },
      floatingOptions
    )
  );

  const handleCancel = () => {
    api.media_embed.hideFloating();
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
    rootProps: {
      ref: useComposedRef<HTMLElement | null>(
        floating.refs.setFloating,
        clickOutsideRef
      ),
      style: floating.style,
    },
  };
};
