import type { KeyboardEvent } from 'react';

import type { PlateEditor } from '@udecode/plate-core/react';

import {
  getAncestorNode,
  getNodeString,
  isEndPoint,
  isExpanded,
} from '@udecode/plate-common';
import debounce from 'lodash/debounce';

import { AIPlugin } from '../ai';
import { CopilotPlugin } from './CopilotPlugin';

export const generateCopilotText = async (
  editor: PlateEditor,
  options: {
    event?: KeyboardEvent<Element>;
    isDebounce?: boolean;
  }
) => {
  const { copilotState, fetchSuggestion, query } =
    editor.getOptions(CopilotPlugin);

  if (copilotState === 'completed') return;

  const aiState = editor.getOption(AIPlugin, 'aiState');

  if (aiState !== 'idle') return;

  const nodeEntry = getAncestorNode(editor);

  if (!nodeEntry) return;
  if (isExpanded(editor.selection)) return;

  const isEnd = isEndPoint(editor, editor.selection?.focus, nodeEntry[1]);

  if (!isEnd) return;

  options.event?.preventDefault();

  const [node] = nodeEntry;

  if (!query?.allow?.includes(node.type as string)) return;

  const prompt = getNodeString(node);

  if (prompt.length === 0) return;

  const abortController = new AbortController();

  const { abortCopilot, setCopilot } = editor.getApi(CopilotPlugin).copilot;

  // abort the last request
  abortCopilot();

  editor.setOptions(CopilotPlugin, { abortController });

  if (!fetchSuggestion) {
    throw new Error('fetchSuggestion is not defined');
  }

  const suggestion = await fetchSuggestion({
    abortSignal: abortController,
    prompt,
  });

  if (!suggestion) {
    console.warn('No suggestion was generated for the given prompt.');

    return;
  }

  return setCopilot(node.id, suggestion);
};

export const generateCopilotTextDebounce = debounce(generateCopilotText, 500);
