import type { PlateEditor } from 'platejs/react';

import {
  type Path,
  type SlateEditor,
  getPluginType,
  KEYS,
  NodeApi,
  PathApi,
} from 'platejs';

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
  elementProps?: any;
  textProps?: any;
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

export const getInsertPreviewStart = (editor: SlateEditor) => {
  const path = getCurrentBlockPath(editor);
  const startBlock = editor.api.node(path)?.[0];

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
  const { _blockChunks, _blockPath } = editor.getOptions(AIChatPlugin);

  if (_blockPath === null) {
    const blocks = streamDeserializeMd(editor, chunk);
    const { path, startInEmptyParagraph } = getInsertPreviewStart(editor);

    // if start in empty paragraph, remove it
    if (startInEmptyParagraph) {
      editor.tf.removeNodes({ at: path });
    }

    if (blocks.length > 0) {
      editor.tf.insertNodes(
        nodesWithProps(editor, [blocks[0]], insertOptions),
        {
          at: path,
          nextBlock: !startInEmptyParagraph,
          select: true,
        }
      );

      editor.setOption(AIChatPlugin, '_blockPath', getCurrentBlockPath(editor));
      editor.setOption(AIChatPlugin, '_blockChunks', chunk);

      if (blocks.length > 1) {
        const nextBlocks = blocks.slice(1);

        const nextPath = getCurrentBlockPath(editor);

        editor.tf.insertNodes(
          nodesWithProps(editor, nextBlocks, insertOptions),
          {
            at: nextPath,
            nextBlock: true,
            select: true,
          }
        );

        const lastBlock = editor.api.node(
          getNextPath(nextPath, nextBlocks.length)
        )!;

        editor.setOption(AIChatPlugin, '_blockPath', lastBlock[1]);

        const lastBlockChunks = streamSerializeMd(
          editor,
          {
            value: [lastBlock[0]],
          },
          chunk
        );

        editor.setOption(AIChatPlugin, '_blockChunks', lastBlockChunks);
      }
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

    if (tempBlocks.length === 1) {
      const currentBlock = editor.api.node(_blockPath)![0];

      // If the types are the same
      if (isSameNode(editor, currentBlock, tempBlocks[0])) {
        const chunkNodes = streamDeserializeInlineMd(editor as any, chunk);

        // Deserialize the chunk and add it to the end of the current block
        editor.tf.insertNodes(
          nodesWithProps(editor, chunkNodes, insertOptions),
          {
            at: editor.api.end(_blockPath),
            select: true,
          }
        );

        const updatedBlock = editor.api.node(_blockPath)!;
        const serializedBlock = streamSerializeMd(
          editor,
          {
            value: [updatedBlock[0]],
          },
          tempBlockChunks
        );

        const blockText = NodeApi.string(tempBlocks[0]);

        // Verify if the editor content matches the chunk
        if (
          serializedBlock === tempBlockChunks &&
          blockText === serializedBlock
        ) {
          editor.setOption(AIChatPlugin, '_blockChunks', tempBlockChunks);
        } else {
          editor.tf.replaceNodes(
            nodesWithProps(editor, [tempBlocks[0]], insertOptions),
            {
              at: _blockPath,
              select: true,
            }
          );

          const serializedBlock = streamSerializeMd(
            editor,
            {
              value: [tempBlocks[0]],
            },
            tempBlockChunks
          );

          editor.setOption(
            AIChatPlugin,
            '_blockChunks',
            // one block includes multiple children
            tempBlocks[0].type === getPluginType(editor, KEYS.codeBlock) ||
              tempBlocks[0].type === getPluginType(editor, KEYS.table) ||
              tempBlocks[0].type === getPluginType(editor, KEYS.equation)
              ? tempBlockChunks
              : serializedBlock
          );
        }
      } else {
        const serializedBlock = streamSerializeMd(
          editor,
          {
            value: [tempBlocks[0]],
          },
          tempBlockChunks
        );

        editor.tf.replaceNodes(
          nodesWithProps(editor, [tempBlocks[0]], insertOptions),
          {
            at: _blockPath,
            select: true,
          }
        );

        editor.setOption(AIChatPlugin, '_blockChunks', serializedBlock);
      }
    } else {
      editor.tf.replaceNodes(
        nodesWithProps(editor, [tempBlocks[0]], insertOptions),
        {
          at: _blockPath,
          select: true,
        }
      );

      if (tempBlocks.length > 1) {
        const newEndBlockPath = getNextPath(_blockPath, tempBlocks.length - 1);

        editor.tf.insertNodes(
          nodesWithProps(editor, tempBlocks.slice(1), insertOptions),
          {
            at: PathApi.next(_blockPath),
            select: true,
          }
        );

        editor.setOption(AIChatPlugin, '_blockPath', newEndBlockPath);

        const endBlock = editor.api.node(newEndBlockPath)![0];

        const serializedBlock = streamSerializeMd(
          editor,
          {
            value: [endBlock],
          },
          tempBlockChunks
        );

        editor.setOption(AIChatPlugin, '_blockChunks', serializedBlock);
      }
    }
  }
}

export const getCurrentBlockPath = (editor: SlateEditor) => {
  const getAnchorPreviousPath = (editor: SlateEditor): Path | undefined => {
    const anchorNode = editor
      .getApi(AIChatPlugin)
      .aiChat.node({ anchor: true });

    if (anchorNode) {
      return PathApi.previous(anchorNode[1])!;
    }
  };

  const getFocusPath = (editor: SlateEditor): Path | undefined =>
    editor.selection?.focus.path.slice(0, 1);

  const path = getAnchorPreviousPath(editor) ?? getFocusPath(editor) ?? [0];

  const entry = editor.api.node(path);

  // streaming in table or columns shouldn't remove them
  if (
    entry &&
    (entry[0].type === getPluginType(editor, KEYS.columnGroup) ||
      entry[0].type === getPluginType(editor, KEYS.table))
  ) {
    return editor.api.above()?.[1] ?? path;
  }

  return path;
};
