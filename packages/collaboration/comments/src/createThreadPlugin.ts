import { createPluginFactory } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { findSelectedThreadNodeEntry } from './findSelectedThreadNodeEntry';
import { findThreadNodeEntries } from './findThreadNodeEntries';
import { ThreadNode, ThreadPlugin } from './types.js';

export const ELEMENT_THREAD = 'thread';

export const createThreadPlugin = createPluginFactory<ThreadPlugin>({
  key: ELEMENT_THREAD,
  isElement: true,
  isInline: true,
  handlers: {
    onChange(editor) {
      return () => {
        const threadNodeEntries = findThreadNodeEntries(editor);
        for (const threadNodeEntry of threadNodeEntries) {
          Transforms.setNodes<ThreadNode>(
            editor,
            {
              selected: false,
            },
            {
              at: threadNodeEntry[1],
            }
          );
        }

        const threadNodeEntry = findSelectedThreadNodeEntry(editor);
        if (threadNodeEntry) {
          const { thread } = threadNodeEntry[0];
          if (thread) {
            Transforms.setNodes<ThreadNode>(
              editor,
              {
                selected: true,
              },
              {
                at: threadNodeEntry[1],
              }
            );
          }
        }
      };
    },
  },
});
