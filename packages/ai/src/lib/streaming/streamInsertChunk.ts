import type { PlateEditor } from '@udecode/plate/react';

import {
  type Path,
  type SlateEditor,
  createZustandStore,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import { AIChatPlugin } from '../../react';
import { streamDeserializeInlineMd } from './streamDeserializeInlineMd';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';
import { nodesWithProps } from './utils/nodesWithProps';

export const streamingStore = createZustandStore(
  {
    blockChunks: '' as string,
    blockPath: null as Path | null,
  },
  {
    name: 'streaming',
  }
);

export interface SteamInsertChunkOptions {
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
    editor.setOption(AIChatPlugin, '_blockChunks', chunk);
    const blocks = streamDeserializeMd(editor, chunk);

    // TOOD
    // if (
    // PathApi.equals(getNextBlockPath(editor), [0]) &&
    // NodeApi.string(editor.api.node([0])![0]).length === 0
    // ) {
    // editor.tf.removeNodes({ at: path });
    // }
    if (blocks.length > 0) {
      const path = getCurrentBlockPath(editor);

      editor.tf.insertNodes(nodesWithProps([blocks[0]], options), {
        at: path,
        nextBlock: true,
        select: true,
      });

      editor.setOption(AIChatPlugin, '_blockPath', getCurrentBlockPath(editor));
      editor.setOption(AIChatPlugin, '_blockChunks', chunk);

      if (blocks.length > 1) {
        const nextBlocks = blocks.slice(1);

        editor.tf.insertNodes(nodesWithProps(nextBlocks, options), {
          at: PathApi.next(path),
          nextBlock: true,
        });

        const lastBlock = editor.api.node(nextBlocks.at(-1))!;

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
      if (currentBlock.type === tempBlocks[0].type) {
        const chunkNodes = streamDeserializeInlineMd(editor as any, chunk);

        // Deserialize the chunk and add it to the end of the current block
        editor.tf.insertNodes(nodesWithProps(chunkNodes, options), {
          at: editor.api.end(_blockPath),
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
          editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
            at: _blockPath,
          });

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

        editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
          at: _blockPath,
        });

        editor.setOption(AIChatPlugin, '_blockChunks', serializedBlock);
      }
    } else {
      editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
        at: _blockPath,
      });

      if (tempBlocks.length > 1) {
        const newEndBlockPath = [_blockPath[0] + tempBlocks.length - 1];

        editor.tf.insertNodes(nodesWithProps(tempBlocks.slice(1), options), {
          at: PathApi.next(_blockPath),
        });

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
  return editor.selection!.focus.path.slice(0, 1);
};
