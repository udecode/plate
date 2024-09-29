'use client';
import { AIPlugin, updateMenuAnchorByPath } from '@udecode/plate-ai/react';
import { type PlateEditor, ParagraphPlugin } from '@udecode/plate-core/react';
import { deserializeMd } from '@udecode/plate-markdown';
import { BlockSelectionPlugin } from '@udecode/plate-selection/react';
import { getEndPoint, insertText, withMerging } from '@udecode/slate';
import {
  getAncestorNode,
  insertEmptyElement,
  replaceNode,
} from '@udecode/slate-utils';
import { Path } from 'slate';

import { getNextPathByNumber } from '@/registry/default/plate-ui/utils/getNextPathByNumber';

import { getAISystem } from './getSystemMessage';
import { streamTraversal } from './streamTraversal';

interface streamInsertTextOptions {
  prompt: string;
  startWritingPath?: Path;
  system?: string;
}

export const streamInsertText = async (
  editor: PlateEditor,
  { prompt, system = getAISystem(), ...options }: streamInsertTextOptions
) => {
  editor.setOptions(AIPlugin, {
    aiState: 'requesting',
    lastPrompt: prompt,
  });

  const initNodeEntry = editor.getOptions(AIPlugin).initNodeEntry;

  if (!initNodeEntry) return;

  let chuck = '';

  let workPath = options?.startWritingPath ?? initNodeEntry[1];
  let lastWorkPath: Path | null = null;

  const effectPath: Path[] = [];

  let matchStartCodeblock = false;
  let matchEndCodeblock = false;

  let isFirst = true;

  let total = '';

  await streamTraversal(
    editor,
    (delta, done) => {
      total += delta;

      if (typeof delta !== 'string') return;
      if (delta.includes('``') && matchStartCodeblock) {
        matchEndCodeblock = true;
      }
      if (delta.includes('```') && !matchEndCodeblock) {
        matchStartCodeblock = true;
      }

      const matchParagraph = !matchStartCodeblock && /\n+/.test(delta);
      const matchCodeblock = matchStartCodeblock && matchEndCodeblock;

      if (matchParagraph || matchCodeblock) {
        const parts = delta.split(/\n+/);
        const nextChunkStart = parts[1] ?? '';
        const previousChunkEnd = parts[0] ?? '';

        if (previousChunkEnd.length > 0) {
          const insert = () => {
            insertText(editor, previousChunkEnd, {
              at: getEndPoint(editor, workPath),
            });
          };

          withMerging(editor, insert);

          chuck += previousChunkEnd;
        }

        matchStartCodeblock = false;
        matchEndCodeblock = false;

        const v = deserializeMd(editor, chuck);

        const nextWorkPath = getNextPathByNumber(workPath, v.length);
        const replace = () => {
          // FIX: replace make the anchor disappear
          editor.setOptions(AIPlugin, {
            openEditorId: null,
          });

          replaceNode(editor, {
            at: workPath,
            nodes: v,
          });

          if (!done) {
            insertEmptyElement(editor, ParagraphPlugin.key, {
              at: nextWorkPath,
            });
          }
        };

        withMerging(editor, replace);

        if (!done) workPath = nextWorkPath;

        chuck = nextChunkStart;

        return;
      } else {
        chuck += delta;
      }
      if (delta) {
        if (lastWorkPath === null || !Path.equals(lastWorkPath, workPath)) {
          updateMenuAnchorByPath(editor, workPath);
          effectPath.push(workPath);
          lastWorkPath = workPath;
        }

        editor.setOption(AIPlugin, 'aiState', 'generating');

        const insert = () => {
          insertText(editor, delta, {
            at: getEndPoint(editor, workPath),
          });
        };

        if (isFirst) {
          insert();
          isFirst = false;
        } else {
          withMerging(editor, insert);
        }
      }
    },
    {
      prompt,
      system,
    }
  );

  /** After the stream */
  updateMenuAnchorByPath(editor, workPath);

  /** Add block selection to all the ai generated blocks */
  effectPath.forEach((path) => {
    setTimeout(() => {
      const nodeEntry = getAncestorNode(editor, path);

      if (nodeEntry) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.addSelectedRow(nodeEntry[0].id, { clear: false });
      }
    }, 0);
  });

  editor.setOptions(AIPlugin, { aiState: 'done', lastGenerate: total });
  editor.getApi(AIPlugin).ai.focusMenu();
};
