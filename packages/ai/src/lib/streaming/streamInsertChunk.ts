import type { PlateEditor } from '@udecode/plate/react';

import { type SlateEditor, NodeApi, PathApi } from '@udecode/plate';

import { AIChatPlugin } from '../../react';
import { streamDeserializeInlineMd } from './streamDeserializeInlineMd';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';
import { isSameNode } from './utils/isSameNode';
import { nodesWithProps } from './utils/nodesWithProps';

export interface SteamInsertChunkOptions {
  elementProps?: any;
  textProps?: any;
}

/** @experimental */
export function streamInsertChunk(
  editor: PlateEditor,
  chunk: string,
  options: SteamInsertChunkOptions = {}
) {
  const { _blockChunks, _blockPath } = editor.getOptions(AIChatPlugin);

  if (_blockPath === null) {
    const blocks = streamDeserializeMd(editor, chunk);
    const path = getCurrentBlockPath(editor);
    const startInEmptyParagraph =
      NodeApi.string(editor.api.node(path)![0]).length === 0;

    // if start in empty paragraph, remove it
    if (startInEmptyParagraph) {
      editor.tf.removeNodes({ at: path });
    }

    if (blocks.length > 0) {
      editor.tf.insertNodes(nodesWithProps(editor, [blocks[0]], options), {
        at: path,
        nextBlock: !startInEmptyParagraph,
        select: true,
      });

      editor.setOption(AIChatPlugin, '_blockPath', getCurrentBlockPath(editor));
      editor.setOption(AIChatPlugin, '_blockChunks', chunk);

      if (blocks.length > 1) {
        const nextBlocks = blocks.slice(1);

        const nextPath = getCurrentBlockPath(editor);

        editor.tf.insertNodes(nodesWithProps(editor, nextBlocks, options), {
          at: nextPath,
          nextBlock: true,
          select: true,
        });

        const lastBlock =
          editor.api.node(nextBlocks.at(-1)) ??
          editor.api.node([nextPath[0] + nextBlocks.length])!;

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
        editor.tf.insertNodes(nodesWithProps(editor, chunkNodes, options), {
          at: editor.api.end(_blockPath),
          select: true,
        });

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
            nodesWithProps(editor, [tempBlocks[0]], options),
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
            tempBlocks[0].type === 'code_block' ||
              tempBlocks[0].type === 'table' ||
              tempBlocks[0].type === 'equation'
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
          nodesWithProps(editor, [tempBlocks[0]], options),
          {
            at: _blockPath,
            select: true,
          }
        );

        editor.setOption(AIChatPlugin, '_blockChunks', serializedBlock);
      }
    } else {
      editor.tf.replaceNodes(nodesWithProps(editor, [tempBlocks[0]], options), {
        at: _blockPath,
        select: true,
      });

      if (tempBlocks.length > 1) {
        const newEndBlockPath = [_blockPath[0] + tempBlocks.length - 1];

        editor.tf.insertNodes(
          nodesWithProps(editor, tempBlocks.slice(1), options),
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
  const anchorNode = editor.getApi(AIChatPlugin).aiChat.node({ anchor: true });

  if (anchorNode) {
    return PathApi.previous(anchorNode[1])!;
  }

  return editor.selection?.focus.path.slice(0, 1) ?? [0];
};
