import type { Path } from 'slate';

import {
  type ExtendConfig,
  type OmitFirst,
  bindFirst,
} from '@udecode/plate-common';
import { toTPlatePlugin } from '@udecode/plate-common/react';

import { type BaseAIPluginConfig, BaseAIPlugin } from '../../lib';
import { streamAINodes } from '../ai-chat/transforms/streamAINodes';
import { removeAIMarks } from './transforms';
import { insertAINodes } from './transforms/insertAINodes';
import { removeAINodes } from './transforms/removeAINodes';
import { stripMarkdown } from './utils';
import { streamText } from './utils/streamText';

export interface AIStreamProps {
  abortSignal: AbortController;
  prompt: string;
  system?: string;
}

export type AIOptions = {
  // unused
  startPath: Path;
};

export type AIApi = {
  streamText: typeof streamText;
  stripText: typeof stripMarkdown;
};

export type AITransforms = {
  insertNodes: OmitFirst<typeof insertAINodes>;
  removeMarks: OmitFirst<typeof removeAIMarks>;
  removeNodes: OmitFirst<typeof removeAINodes>;
  streamNodes: OmitFirst<typeof streamAINodes>;
};

export type AIPluginConfig = ExtendConfig<
  BaseAIPluginConfig,
  AIOptions,
  { ai: AIApi },
  { ai: AITransforms }
>;

export const AIPlugin = toTPlatePlugin<AIPluginConfig>(BaseAIPlugin, {
  options: {
    startPath: [],
  },
})
  .extendTransforms(({ editor }) => ({
    insertNodes: bindFirst(insertAINodes, editor),
    removeMarks: bindFirst(removeAIMarks, editor),
    removeNodes: bindFirst(removeAINodes, editor),
    streamNodes: bindFirst(streamAINodes, editor),
    // Function to reload the last AI chat response for the given chat history. If the last message isn't from the assistant, it will request the API to generate a new response.
    // reload
  }))
  .extendApi<AIApi>(() => ({
    streamText: streamText,
    stripText: stripMarkdown,
  }));
