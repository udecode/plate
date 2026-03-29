import { MarkdownPlugin, markdownToAstProcessor } from '@platejs/markdown';
import type { PlateEditor } from 'platejs/react';

import {
  type Path,
  type SlateEditor,
  TextApi,
  getPluginType,
  KEYS,
  NodeApi,
  PathApi,
  type TElement,
} from 'platejs';

import { AIChatPlugin } from '../AIChatPlugin';
import { remarkStreamdownPendingTail } from './remarkStreamdownPendingTail';
import { streamDeserializeMd } from './streamDeserializeMd';
import { nodesWithProps } from './utils/nodesWithProps';

export type SteamInsertChunkOptions = {
  elementProps?: any;
  textProps?: any;
};

type StreamingBlock = TElement & {
  children: any[];
  listRestartPolite?: number;
  listStart?: number;
  listStyleType?: string;
};

type StreamInsertRuntimeState = {
  replayStartOffset: number;
  source: string;
  stableBlockCount: number;
  startPath: Path;
};

const streamInsertRuntime = new WeakMap<
  SlateEditor,
  StreamInsertRuntimeState
>();

const getNextPath = (path: Path, length: number) => {
  let result = path;

  for (let i = 0; i < length; i++) {
    result = PathApi.next(result);
  }

  return result;
};

function cloneBlock<TValue>(value: TValue): TValue {
  return JSON.parse(JSON.stringify(value)) as TValue;
}

function pushTextNode(
  children: Array<Record<string, unknown>>,
  text: string,
  props: Record<string, unknown> = {}
) {
  if (text.length === 0) return;

  const lastChild = children.at(-1);

  if (lastChild && TextApi.isText(lastChild)) {
    const { text: lastText, ...lastProps } = lastChild;

    if (areNodesEqual(lastProps, props)) {
      lastChild.text = `${String(lastText)}${text}`;
      return;
    }
  }

  children.push({
    ...props,
    text,
  });
}

function transformUnderlineChildren(children: any[]) {
  const result: any[] = [];

  let underlineActive = false;
  let underlineText = '';

  const flushPendingUnderlineAsLiteral = () => {
    pushTextNode(result, `<u>${underlineText}`);
    underlineActive = false;
    underlineText = '';
  };

  for (const child of children) {
    if (
      !TextApi.isText(child) ||
      Object.keys(child).some((key) => key !== 'text')
    ) {
      if (underlineActive) {
        flushPendingUnderlineAsLiteral();
      }

      if (child && typeof child === 'object' && Array.isArray(child.children)) {
        result.push({
          ...child,
          children: transformUnderlineChildren(child.children),
        });
      } else {
        result.push(child);
      }

      continue;
    }

    let remaining = child.text;

    while (remaining.length > 0) {
      if (!underlineActive) {
        const openIndex = remaining.indexOf('<u>');

        if (openIndex === -1) {
          pushTextNode(result, remaining);
          break;
        }

        if (openIndex > 0) {
          pushTextNode(result, remaining.slice(0, openIndex));
        }

        remaining = remaining.slice(openIndex + 3);
        underlineActive = true;
        underlineText = '';
        continue;
      }

      const closeIndex = remaining.indexOf('</u>');

      if (closeIndex === -1) {
        underlineText += remaining;
        break;
      }

      underlineText += remaining.slice(0, closeIndex);
      pushTextNode(result, underlineText, { underline: true });
      remaining = remaining.slice(closeIndex + 4);
      underlineActive = false;
      underlineText = '';
    }
  }

  if (underlineActive) {
    flushPendingUnderlineAsLiteral();
  }

  return result;
}

function applyStreamingPostProcessing(blocks: TElement[]): StreamingBlock[] {
  const transformedBlocks: StreamingBlock[] = blocks.map((block) => {
    if (block.listStyleType && block.listStyleType !== 'decimal') {
      const { listRestartPolite, listStart, ...rest } = block as StreamingBlock;

      return {
        ...rest,
        children: transformUnderlineChildren(block.children),
      };
    }

    return {
      ...block,
      children: transformUnderlineChildren(block.children),
    };
  });

  return transformedBlocks.map((block, index) => {
    if (!block.listStyleType || !block.listStart || block.listStart === 1) {
      return block;
    }

    const previousBlock = transformedBlocks[index - 1];

    if (previousBlock?.listStyleType && previousBlock?.listStart) {
      return block;
    }

    return {
      ...block,
      listRestartPolite: block.listStart,
    };
  });
}

function deserializeStreamingMarkdown(
  editor: PlateEditor,
  data: string
): StreamingBlock[] {
  return applyStreamingPostProcessing(streamDeserializeMd(editor, data));
}

function areNodesEqual(left: unknown, right: unknown): boolean {
  if (left === right) return true;

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) return false;

    return left.every((child, index) => areNodesEqual(child, right[index]));
  }

  if (left && right && typeof left === 'object' && typeof right === 'object') {
    const leftEntries = Object.entries(left as Record<string, unknown>);
    const rightEntries = Object.entries(right as Record<string, unknown>);

    if (leftEntries.length !== rightEntries.length) return false;

    return leftEntries.every(
      ([key, value]) =>
        Object.hasOwn(right as Record<string, unknown>, key) &&
        areNodesEqual(value, (right as Record<string, unknown>)[key])
    );
  }

  return false;
}

function getSharedTopLevelPrefixLength(
  currentBlocks: TElement[],
  nextBlocks: TElement[]
) {
  const maxLength = Math.min(currentBlocks.length, nextBlocks.length);

  let index = 0;

  while (
    index < maxLength &&
    areNodesEqual(currentBlocks[index], nextBlocks[index])
  ) {
    index += 1;
  }

  return index;
}

function getNodeStartOffset(node: unknown) {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const startOffset = (
    node as {
      position?: {
        start?: {
          offset?: number;
        };
      };
    }
  ).position?.start?.offset;

  return typeof startOffset === 'number' ? startOffset : 0;
}

function isEmptyParagraphBlock(
  editor: PlateEditor,
  block: TElement | undefined
) {
  if (!block) return false;

  return (
    block.type === getPluginType(editor, KEYS.p) &&
    NodeApi.string(block).length === 0
  );
}

function getStreamdownPendingMetadata(root: unknown) {
  if (!root || typeof root !== 'object') {
    return;
  }

  const streamdown = (
    root as {
      data?: {
        streamdown?: {
          pendingReason?: unknown;
          pendingStart?: unknown;
        };
      };
    }
  ).data?.streamdown;

  if (!streamdown || typeof streamdown !== 'object') {
    return;
  }

  const pendingReason =
    typeof streamdown.pendingReason === 'string'
      ? streamdown.pendingReason
      : undefined;
  const pendingStart =
    typeof streamdown.pendingStart === 'number'
      ? streamdown.pendingStart
      : undefined;

  return {
    pendingReason,
    pendingStart,
  };
}

function buildReplayRuntimeState(
  editor: PlateEditor,
  markdownSource: string,
  nextBlocks: TElement[],
  startPath: Path
): StreamInsertRuntimeState {
  if (markdownSource.length === 0 || nextBlocks.length === 0) {
    return {
      replayStartOffset: 0,
      source: markdownSource,
      stableBlockCount: 0,
      startPath,
    };
  }

  let replayStartOffset = 0;

  try {
    const pluginRemarkPlugins =
      editor.getOptions(MarkdownPlugin).remarkPlugins ?? [];
    const root = markdownToAstProcessor(editor, markdownSource, {
      remarkPlugins: [...pluginRemarkPlugins, remarkStreamdownPendingTail],
    });
    const pending = getStreamdownPendingMetadata(root);

    if (pending?.pendingReason === 'trailing-blank-lines') {
      const trailingPlaceholderCount = isEmptyParagraphBlock(
        editor,
        nextBlocks.at(-1)
      )
        ? 1
        : 0;

      return {
        replayStartOffset: markdownSource.length,
        source: markdownSource,
        stableBlockCount: Math.max(
          0,
          nextBlocks.length - trailingPlaceholderCount
        ),
        startPath,
      };
    }

    replayStartOffset = getNodeStartOffset(root.children.at(-1));
  } catch {
    return {
      replayStartOffset: 0,
      source: markdownSource,
      stableBlockCount: 0,
      startPath,
    };
  }

  if (replayStartOffset <= 0) {
    return {
      replayStartOffset: 0,
      source: markdownSource,
      stableBlockCount: 0,
      startPath,
    };
  }

  if (replayStartOffset >= markdownSource.length) {
    return {
      replayStartOffset: markdownSource.length,
      source: markdownSource,
      stableBlockCount: Math.max(0, nextBlocks.length - 1),
      startPath,
    };
  }

  const replayBlocks = deserializeStreamingMarkdown(
    editor,
    markdownSource.slice(replayStartOffset)
  );

  return {
    replayStartOffset,
    source: markdownSource,
    stableBlockCount: Math.max(0, nextBlocks.length - replayBlocks.length),
    startPath,
  };
}

function getNextBlocks(
  editor: PlateEditor,
  markdownSource: string,
  currentBlocks: TElement[],
  runtimeState: StreamInsertRuntimeState | undefined
) {
  if (markdownSource.length === 0) {
    return [];
  }

  if (
    runtimeState &&
    markdownSource.startsWith(runtimeState.source) &&
    runtimeState.replayStartOffset <= markdownSource.length &&
    runtimeState.stableBlockCount <= currentBlocks.length
  ) {
    const replayBlocks = deserializeStreamingMarkdown(
      editor,
      markdownSource.slice(runtimeState.replayStartOffset)
    );

    return [
      ...currentBlocks.slice(0, runtimeState.stableBlockCount),
      ...replayBlocks,
    ];
  }

  return deserializeStreamingMarkdown(editor, markdownSource);
}

function removeInitialEmptyParagraph(editor: PlateEditor, path: Path) {
  const startBlock = editor.api.node(path)?.[0];

  const startInEmptyParagraph =
    startBlock &&
    NodeApi.string(startBlock).length === 0 &&
    startBlock.type === getPluginType(editor, KEYS.p);

  if (startInEmptyParagraph) {
    editor.tf.removeNodes({ at: path });
  }
}

/** @experimental */
export function streamInsertChunk(
  editor: PlateEditor,
  chunk: string,
  options: SteamInsertChunkOptions = {}
) {
  const { _blockChunks, _blockPath } = editor.getOptions(AIChatPlugin);
  const isFreshStream = _blockPath === null || _blockChunks.length === 0;
  const previousRuntimeState = streamInsertRuntime.get(editor);

  const startPath =
    isFreshStream || !previousRuntimeState
      ? getCurrentBlockPath(editor)
      : previousRuntimeState.startPath;

  if (isFreshStream) {
    removeInitialEmptyParagraph(editor, startPath);
  }

  const markdownSource = _blockChunks + chunk;
  const startIndex = startPath[0] ?? 0;
  const currentBlocks = ((editor.children as TElement[]) ?? []).slice(
    startIndex
  );
  const nextBlocks = getNextBlocks(
    editor,
    markdownSource,
    currentBlocks,
    isFreshStream ? undefined : previousRuntimeState
  );
  const sharedPrefixLength = getSharedTopLevelPrefixLength(
    currentBlocks,
    nextBlocks
  );
  const nextRuntimeState = buildReplayRuntimeState(
    editor,
    markdownSource,
    nextBlocks,
    startPath
  );

  if (
    sharedPrefixLength === currentBlocks.length &&
    sharedPrefixLength === nextBlocks.length
  ) {
    streamInsertRuntime.set(editor, nextRuntimeState);
    editor.setOption(AIChatPlugin, '_blockChunks', markdownSource);
    editor.setOption(
      AIChatPlugin,
      '_blockPath',
      nextBlocks.length > 0
        ? getNextPath(startPath, nextBlocks.length - 1)
        : startPath
    );
    return;
  }

  if (editor.selection) {
    editor.tf.deselect();
  }

  editor.tf.withoutNormalizing(() => {
    for (
      let index = currentBlocks.length - 1;
      index >= sharedPrefixLength;
      index -= 1
    ) {
      editor.tf.removeNodes({ at: [startIndex + index] });
    }

    for (
      let index = sharedPrefixLength;
      index < nextBlocks.length;
      index += 1
    ) {
      editor.tf.insertNodes(
        nodesWithProps(editor, [cloneBlock(nextBlocks[index]) as any], options),
        {
          at: [startIndex + index],
        }
      );
    }
  });

  streamInsertRuntime.set(editor, nextRuntimeState);
  editor.setOption(AIChatPlugin, '_blockChunks', markdownSource);
  editor.setOption(
    AIChatPlugin,
    '_blockPath',
    nextBlocks.length > 0
      ? getNextPath(startPath, nextBlocks.length - 1)
      : startPath
  );
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
