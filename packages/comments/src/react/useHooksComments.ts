import { useEffect } from 'react';

import {
  type UseHooks,
  useEditorContainerRef,
  useHotkeys,
} from '@udecode/plate/react';
import debounce from 'lodash/debounce.js';

import type { CommentsPluginConfig } from '../lib';

import { CommentsPlugin } from './CommentsPlugin';

export const useHooksComments: UseHooks<CommentsPluginConfig> = ({
  editor,
  getOptions,
}) => {
  const { hotkey } = getOptions();

  const editorContainerRef = useEditorContainerRef();

  useEffect(() => {
    if (!editorContainerRef.current) return;

    const editable = editor.api.toDOMNode(editor);

    if (!editable) return;

    const handleResize = debounce(() => {
      const styles = window.getComputedStyle(editable);
      const isOverlap = Number.parseInt(styles.paddingRight) < 80 + 288;

      editor.setOption(CommentsPlugin, 'isOverlapWithEditor', isOverlap);
    }, 100);

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel();
    };
  }, [editor, editorContainerRef]);

  // const focused = useFocused();
  // const selectionActiveId = useCommentId();
  // useEffect(() => {
  //   editor.setOption(CommentsPlugin, 'activeId', selectionActiveId ?? null);
  // }, [editor, focused, selectionActiveId]);

  useHotkeys(
    hotkey!,
    (e) => {
      if (!editor.selection) return;

      e.preventDefault();

      if (!editor.api.isExpanded()) return;
    },
    {
      enableOnContentEditable: true,
    }
  );
};
