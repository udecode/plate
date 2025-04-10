import type { PlateEditor } from '@udecode/plate/react';

import {
  type Descendant,
  type Path,
  type SlateEditor,
  createZustandStore,
  ElementApi,
  NodeApi,
  PathApi,
} from '@udecode/plate';
import { deserializeInlineMd, deserializeMd, MarkdownPlugin, serializeMd } from '@udecode/plate-markdown';


export const streamingStore = createZustandStore(
  {
    blockChunks: '' as string,
    blockPath: null as Path | null,
  },
  {
    name: 'streaming',
  }
);

export const resetStreamingStore = () => {
  console.log('rest');

  streamingStore.set('blockChunks', '');
  streamingStore.set('blockPath', null);
};

/**
 * Deserialize the sting like `123\n\n` will be `123` base on markdown spec but
 * we want to keep the `\n\n`
 */
export function getChunkTrimmed(chunk: string, blockType: string) {
  if (blockType === 'code_block') return '';

  const trimmed = chunk.trimEnd();

  return chunk.slice(trimmed.length);
}

/**
 * After serialize the chunk, it always have a `\n` at the end of the markdown
 * we should remove it since stream is not finished yet.
 *
 * Can't remove it when codeblock
 *
 * @example
 *   serialize([{type: 'p', children: [{text: '123'}]}]) => '123\n'
 *
 *   This behavior is a standard feature of remark-stringify — it adds a
 *   newline character at the end of the file, which complies with the Markdown
 *   specification. The reasons for this are:
 *
 *   It's a widely accepted best practice to ensure files end with a newline
 *
 *   It helps avoid formatting issues when concatenating multiple Markdown files
 *
 *   It complies with the POSIX standard, which requires text files to end with a
 *   newline character
 */
const trimEndUtils = (string: string, blockType: string) => {
  if (blockType === 'code_block') {
    const _string = string.trimEnd();

    const lastIndex = _string.lastIndexOf('\n');

    if (lastIndex !== -1) {
      return _string.slice(0, lastIndex) + _string.slice(lastIndex + 1);
    }
  }

  return string.trimEnd();
};

const nodesWithProps = (
  nodes: Descendant[],
  options: SteamInsertChunkOptions
): Descendant[] => {
  if (!options.textProps) return nodes;

  return nodes.map((node): Descendant => {
    if (ElementApi.isElement(node)) {
      return {
        ...node,
        ...options.textProps,
        children: nodesWithProps(node.children, options),
      };
    } else {
      return {
        ...options.textProps,
        ...node,
        text: node.text,
      };
    }
  });
};

interface SteamInsertChunkOptions {
  textProps?: any;
}

/** @experimental */
export function streamInsertChunk(
  editor: PlateEditor,
  chunk: string,
  options: SteamInsertChunkOptions = {}
) {
  const blockPath = streamingStore.get('blockPath');
  const blockChunks = streamingStore.get('blockChunks');

  // console.log('🚀 ~ Streaming ~ chunk:', chunk);
  // console.log('🚀 ~ Streaming ~ blockPath:', blockPath);
  // console.log('🚀 ~ Streaming ~ blockChunks:', blockChunks);

  if (blockPath === null) {
    streamingStore.set('blockChunks', chunk);
    const blocks = deserializeMd(editor, chunk);

    if (
      PathApi.equals(getNextBlockPath(editor), [0]) &&
      NodeApi.string(editor.api.node([0])![0]).length === 0
    ) {
      editor.tf.removeNodes({ at: getNextBlockPath(editor) });
    }
    if (blocks.length > 0) {
      editor.tf.insertNodes(nodesWithProps([blocks[0]], options), {
        at: getNextBlockPath(editor),
        nextBlock: true,
      });
      streamingStore.set('blockPath', getNextBlockPath(editor));

      if (blocks.length > 1) {
        const nextBlocks = blocks.slice(1);

        editor.tf.insertNodes(nodesWithProps(nextBlocks, options), {
          at: getNextBlockPath(editor),
          nextBlock: true,
        });

        const blockNode = editor.api.node(getNextBlockPath(editor))!;

        const _blockText = serializeMd(editor, {
          value: [blockNode[0]],
        });

        const blockText = trimEndUtils(_blockText, blockNode[0].type as string) // tests `should correctly handle incomplete marks with newlines`
          .replaceAll(/\\([\\`*_{}[\]()#+\-.!~<>])/g, '$1');

        const nextBlockChunks =
          blockNode[0].type === 'code_block'
            ? blockText.slice(0, -3)
            : blockText;

        streamingStore.set('blockPath', blockNode[1]);

        streamingStore.set(
          'blockChunks',
          nextBlockChunks + getChunkTrimmed(chunk, blockNode[0].type as string)
        );
      }
    }
  } else {
    const tempBlockChunks = blockChunks + chunk;
    const tempBlocks = deserializeMd(editor, tempBlockChunks);

    // console.log('🚀 ~ Streaming ~ tempBlocks:', JSON.stringify(tempBlocks));
    // console.log('🚀 ~ Streaming ~ tempBlockChunks:', tempBlockChunks);

    if (tempBlocks.length === 1) {
      const currentBlock = editor.api.node(blockPath)![0];

      // If the types are the same
      if (currentBlock.type === tempBlocks[0].type) {
        // FIXME: if user use remark-mdx as the function name it will fail
        const remarkPluginsWithoutMdx = editor
          .getOption(MarkdownPlugin, 'remarkPlugins')
          .filter((p) => {
            return p.name !== 'remarkMdx';
          });

        const chunkNodes = deserializeInlineMd(editor as any, chunk, {
          remarkPlugins:
            currentBlock.type === 'code_block'
              ? remarkPluginsWithoutMdx
              : undefined,
        });

        // Deserialize the chunk and add it to the end of the current block
        editor.tf.insertNodes(nodesWithProps(chunkNodes, options), {
          at: editor.api.end(blockPath),
        });

        const updatedBlock = editor.api.node(blockPath)![0];
        const serializedBlock = trimEndUtils(
          serializeMd(editor, {
            value: [updatedBlock],
          }),
          updatedBlock.type as string
        );

        const blockText = NodeApi.string(tempBlocks[0]);

        // Verify if the editor content matches the chunk
        if (
          serializedBlock === tempBlockChunks &&
          blockText === serializedBlock
        ) {
          streamingStore.set('blockChunks', tempBlockChunks);
        } else {
          editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
            at: blockPath,
          });

          const serializedBlock = trimEndUtils(
            serializeMd(editor, {
              value: [tempBlocks[0]],
            }),
            tempBlocks[0].type as string
          );

          // prevent the end ``` from being added to the block chunks
          const nextBlockChunks =
            tempBlocks[0].type === 'code_block'
              ? tempBlockChunks
              : serializedBlock;

          streamingStore.set(
            'blockChunks',
            nextBlockChunks +
              getChunkTrimmed(tempBlockChunks, tempBlocks[0].type as string)
          );
        }
      } else {
        editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
          at: blockPath,
        });

        streamingStore.set('blockChunks', chunk);
      }
    } else {
      editor.tf.replaceNodes(nodesWithProps([tempBlocks[0]], options), {
        at: blockPath,
      });

      if (tempBlocks.length > 1) {
        const newEndBlockPath = [blockPath[0] + tempBlocks.length - 1];

        editor.tf.insertNodes(nodesWithProps(tempBlocks.slice(1), options), {
          at: PathApi.next(blockPath),
        });

        streamingStore.set('blockPath', newEndBlockPath);

        const endBlock = editor.api.node(newEndBlockPath)![0];

        const serializedBlock = serializeMd(editor, {
          value: [endBlock],
        }).trimEnd();

        const nextBlockChunks =
          endBlock.type === 'code_block'
            ? serializedBlock.slice(0, -3)
            : serializedBlock;

        streamingStore.set(
          'blockChunks',
          nextBlockChunks +
            getChunkTrimmed(tempBlockChunks, endBlock.type as string)
        );
      } else {
        const serializedBlock = trimEndUtils(
          serializeMd(editor, {
            value: [tempBlocks[0]],
          }),
          tempBlocks[0].type as string
        );

        streamingStore.set(
          'blockChunks',
          serializedBlock +
            getChunkTrimmed(tempBlockChunks, tempBlocks[0].type as string)
        );
      }
    }
  }
}

export const useStreamingPath = () => {
  return streamingStore.useStore((state) => state.blockPath);
};

export const getNextBlockPath = (editor: SlateEditor) => {
  // return PathApi.next(editor.selection?.focus.path.slice(0, 1) ?? [0]);
  return [Math.max(editor.children.length - 1, 0)];
};
