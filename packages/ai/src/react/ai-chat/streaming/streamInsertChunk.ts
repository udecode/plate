import type { PlateEditor } from '@platejs/core/react';

import { type Element, type Path, NodeApi, PathApi } from '@platejs/plite';
import { getPluginType } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import {
  AI_PREVIEW_KEY,
  hasAIPreview,
} from '../../../lib/transforms/aiStreamSnapshot';
import { AIChatPlugin } from '../AIChatPlugin';
import { streamDeserializeInlineMd } from './streamDeserializeInlineMd';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';
import { isSameNode } from './utils/isSameNode';
import { nodesWithProps } from './utils/nodesWithProps';

export type SteamInsertChunkOptions = {
  elementProps?: Record<string, unknown>;
  textProps?: Record<string, unknown>;
};

const getNextPath = (path: Path, length: number) => {
  let result = path;

  for (let i = 0; i < length; i++) {
    result = PathApi.next(result);
  }
  return result;
};

const withPreviewElementProps = (
  editor: PlateEditor,
  options: SteamInsertChunkOptions
): SteamInsertChunkOptions => {
  if (!hasAIPreview(editor)) return options;

  return {
    ...options,
    elementProps: {
      ...options.elementProps,
      [AI_PREVIEW_KEY]: true,
    },
  };
};

export const getInsertPreviewStart = (editor: PlateEditor) => {
  const path = getCurrentBlockPath(editor);
  const startBlock = editor.read.nodes.get<Element>(path)?.[0];

  return {
    path,
    startBlock,
    startInEmptyParagraph:
      !!startBlock &&
      NodeApi.string(startBlock).length === 0 &&
      startBlock.type === getPluginType(editor, KEYS.p),
  };
};

/** @experimental */
export function streamInsertChunk(
  editor: PlateEditor,
  chunk: string,
  options: SteamInsertChunkOptions = {}
) {
  const insertOptions = withPreviewElementProps(editor, options);
  const { _blockChunks, _blockPath } = editor.plugin(AIChatPlugin).getOptions();

  if (_blockPath === null) {
    const blocks = streamDeserializeMd(editor, chunk);
    const { path, startInEmptyParagraph } = getInsertPreviewStart(editor);

    if (blocks.length > 0) {
      const insertPath = startInEmptyParagraph ? path : PathApi.next(path);
      const insertedBlocks = nodesWithProps(editor, blocks, insertOptions);

      editor.update.history.skip((tx) => {
        if (startInEmptyParagraph) {
          tx.nodes.replace(insertedBlocks, {
            at: path,
            select: true,
          });
        } else {
          tx.blocks.insertAfter(insertedBlocks, { at: path, select: true });
        }
      });

      const lastPath = getNextPath(insertPath, blocks.length - 1);
      const lastBlock = editor.read.nodes.get<Element>(lastPath);

      if (!lastBlock) return;

      const lastBlockChunks =
        blocks.length > 1
          ? streamSerializeMd(editor, { value: [lastBlock[0]] }, chunk)
          : chunk;

      editor.plugin(AIChatPlugin).setOptions({
        _blockChunks: lastBlockChunks,
        _blockPath: lastPath,
      });
    }
  } else {
    const tempBlockChunks = _blockChunks + chunk;
    const tempBlocks = streamDeserializeMd(editor, tempBlockChunks);

    // console.log(
    //   JSON.stringify(chunk),
    //   'chunk',
    //   '-------------------------------------------------------------------------------------------'
    // );
    // console.log(
    //   '🚀 ~ Streaming ~ tempBlockChunks:',
    //   JSON.stringify(tempBlockChunks)
    // );

    // console.log('🚀 ~ Streaming ~ tempBlocks:', JSON.stringify(tempBlocks));

    if (tempBlocks.length === 0) {
      return console.warn(
        `unsupport md nodes: ${JSON.stringify(tempBlockChunks)}`
      );
    }

    let nextBlockChunks = _blockChunks;
    let nextBlockPath = _blockPath;

    editor.update.history.skip((tx) => {
      if (tempBlocks.length === 1) {
        const currentBlock = tx.nodes.get<Element>(_blockPath)?.[0];

        if (!currentBlock) return;

        if (isSameNode(editor, currentBlock, tempBlocks[0])) {
          const chunkNodes = streamDeserializeInlineMd(editor, chunk);
          const endPoint = tx.points.end(_blockPath);

          if (!endPoint) return;

          tx.nodes.insert(nodesWithProps(editor, chunkNodes, insertOptions), {
            at: endPoint,
            select: true,
          });

          const updatedBlock = tx.nodes.get<Element>(_blockPath);

          if (!updatedBlock) return;

          const serializedBlock = streamSerializeMd(
            editor,
            { value: [updatedBlock[0]] },
            tempBlockChunks
          );
          const blockText = NodeApi.string(tempBlocks[0]);

          if (
            serializedBlock === tempBlockChunks &&
            blockText === serializedBlock
          ) {
            nextBlockChunks = tempBlockChunks;
          } else {
            tx.nodes.replace(
              nodesWithProps(editor, [tempBlocks[0]], insertOptions),
              { at: _blockPath, select: true }
            );

            const replacement = streamSerializeMd(
              editor,
              { value: [tempBlocks[0]] },
              tempBlockChunks
            );

            nextBlockChunks =
              tempBlocks[0].type === getPluginType(editor, KEYS.codeBlock) ||
              tempBlocks[0].type === getPluginType(editor, KEYS.table) ||
              tempBlocks[0].type === getPluginType(editor, KEYS.equation)
                ? tempBlockChunks
                : replacement;
          }
        } else {
          nextBlockChunks = streamSerializeMd(
            editor,
            { value: [tempBlocks[0]] },
            tempBlockChunks
          );
          tx.nodes.replace(
            nodesWithProps(editor, [tempBlocks[0]], insertOptions),
            { at: _blockPath, select: true }
          );
        }

        return;
      }

      tx.nodes.replace(nodesWithProps(editor, tempBlocks, insertOptions), {
        at: _blockPath,
        select: true,
      });

      nextBlockPath = getNextPath(_blockPath, tempBlocks.length - 1);
      const endBlock = tx.nodes.get<Element>(nextBlockPath);

      if (!endBlock) return;

      nextBlockChunks = streamSerializeMd(
        editor,
        { value: [endBlock[0]] },
        tempBlockChunks
      );
    });

    editor.plugin(AIChatPlugin).setOptions({
      _blockChunks: nextBlockChunks,
      _blockPath: nextBlockPath,
    });
  }
}

export const getCurrentBlockPath = (editor: PlateEditor) => {
  const getAnchorPreviousPath = (editor: PlateEditor): Path | undefined => {
    const anchorNode = editor.plugin(AIChatPlugin).api.node({ anchor: true });

    if (anchorNode) {
      if (anchorNode[1].at(-1) === 0) return;

      return PathApi.previous(anchorNode[1]);
    }
  };

  const getFocusPath = (editor: PlateEditor): Path | undefined =>
    editor.read.selection()?.focus.path.slice(0, 1);

  const path = getAnchorPreviousPath(editor) ?? getFocusPath(editor) ?? [0];

  const entry = editor.read.nodes.get<Element>(path);

  // streaming in table or columns shouldn't remove them
  if (
    entry &&
    (entry[0].type === getPluginType(editor, KEYS.columnGroup) ||
      entry[0].type === getPluginType(editor, KEYS.table))
  ) {
    return editor.read.nodes.above()?.[1] ?? path;
  }

  return path;
};
