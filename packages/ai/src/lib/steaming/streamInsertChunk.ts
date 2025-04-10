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
import {
  deserializeInlineMd,
  deserializeMd,
  MarkdownPlugin,
  serializeMd,
} from '@udecode/plate-markdown';

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
  options: StreamInsertChunkOptions
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

interface StreamInsertChunkOptions {
  textProps?: any;
}

/** @experimental */
export function streamInsertChunk(
  editor: PlateEditor,
  chunk: string,
  options: StreamInsertChunkOptions = {}
) {
  const blockPath = streamingStore.get('blockPath');
  const blockChunks = streamingStore.get('blockChunks');

  if (blockPath === null) {
    streamingStore.set('blockChunks', chunk);
    const blocks = deserializeMd(editor, chunk);

    const insertPath = getNextBlockPath(editor);
    const existingNode = editor.api.node(insertPath);

    // If the insertion point is an empty paragraph, remove it
    if (existingNode && NodeApi.string(existingNode[0]).length === 0) {
      editor.tf.removeNodes({ at: insertPath });
    }

    if (blocks.length > 0) {
      // Insert all blocks at once to maintain order
      editor.tf.insertNodes(nodesWithProps(blocks, options), {
        at: insertPath,
      });

      // Set the block path to the last inserted block
      const lastBlockPath = [insertPath[0] + blocks.length - 1];
      const lastBlock = editor.api.node(lastBlockPath)![0];

      streamingStore.set('blockPath', lastBlockPath);

      const serializedBlock = serializeMd(editor, {
        value: [lastBlock],
      });

      const blockText = trimEndUtils(
        serializedBlock,
        lastBlock.type as string
      ).replaceAll(/\\([\\`*_{}[\]()#+\-.!~<>])/g, '$1');

      const nextBlockChunks =
        lastBlock.type === 'code_block' ? blockText.slice(0, -3) : blockText;

      streamingStore.set(
        'blockChunks',
        nextBlockChunks + getChunkTrimmed(chunk, lastBlock.type as string)
      );
    }
  } else {
    const tempBlockChunks = blockChunks + chunk;
    const tempBlocks = deserializeMd(editor, tempBlockChunks);

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

        // Check if the block still exists at the expected path
        const blockExists = editor.api.node(blockPath);
        if (!blockExists) {
          // If block doesn't exist, treat this as a new insertion
          streamingStore.set('blockPath', null);
          streamingStore.set('blockChunks', '');
          return streamInsertChunk(editor, chunk, options);
        }

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
      // Check if the block still exists at the expected path
      const blockExists = editor.api.node(blockPath);
      if (!blockExists) {
        // If block doesn't exist, treat this as a new insertion
        streamingStore.set('blockPath', null);
        streamingStore.set('blockChunks', '');
        return streamInsertChunk(editor, chunk, options);
      }

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
  const cursorBlock = editor.selection!.focus.path.slice(0, 1);

  const nodeAbove = editor.api.above();

  if (nodeAbove && editor.api.string(nodeAbove[0]).length > 0) {
    return PathApi.next(cursorBlock);
  }

  return cursorBlock;
};
