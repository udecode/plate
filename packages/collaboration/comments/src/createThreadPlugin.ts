import { createPluginFactory } from '@udecode/plate-core';
import { findSelectedThreadNodeEntry } from './findSelectedThreadNodeEntry';
import { findThreadNodeEntries } from './findThreadNodeEntries';
import { ThreadPlugin } from './types.js';

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
          threadNodeEntry[0].selected = false;
        }

        const threadNodeEntry = findSelectedThreadNodeEntry(editor);
        if (threadNodeEntry) {
          const { thread } = threadNodeEntry[0];
          if (thread) {
            threadNodeEntry[0].selected = true;
          }
        }
      };
    },
  },
});
