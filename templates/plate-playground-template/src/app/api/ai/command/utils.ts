import type { ChatMessage } from '@/components/editor/use-chat';
import type { UIMessage } from 'ai';

import { getMarkdown } from '@platejs/ai';
import { serializeMd } from '@platejs/markdown';
import dedent from 'dedent';
import { type SlateEditor, KEYS, RangeApi } from 'platejs';

/**
 * Tag content split by newlines
 *
 * @example
 *   <tools>
 *   {content}
 *   </tools>
 */
export const tag = (tag: string, content?: string | null) => {
  if (!content) return '';

  return [`<${tag}>`, content, `</${tag}>`].join('\n');
};

/**
 * Tag content inline
 *
 * @example
 *   <tools>{content}</tools>
 */
export const inlineTag = (tag: string, content?: string | null) => {
  if (!content) return '';

  return [`<${tag}>`, content, `</${tag}>`].join('');
};

// Sections split by double newlines
export const sections = (sections: (boolean | string | null | undefined)[]) =>
  sections.filter(Boolean).join('\n\n');

// List items split by newlines
export const list = (items: string[] | undefined) =>
  items
    ? items
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join('\n')
    : '';

export type StructuredPromptSections = {
  context?: string;
  examples?: string[] | string;
  history?: string;
  instruction?: string;
  outputFormatting?: string;
  prefilledResponse?: string;
  rules?: string;
  task?: string;
  taskContext?: string;
  thinking?: string;
  tone?: string;
};

/**
 * Build a structured prompt following best practices for AI interactions.
 *
 * @example
 *   https://imgur.com/carbon-Db5tDUh
 *   1. Task context - You will be acting as an AI career coach named Joe created by the company
 *   AdAstra Careers. Your goal is to give career advice to users. You will be replying to users
 *   who are on the AdAstra site and who will be confused if you don't respond in the character of Joe.
 *   2. Tone context - You should maintain a friendly customer service tone.
 *   3. Background data - Here is the career guidance document you should reference when answering the user: <guide>{DOCUMENT}</guide>
 *   3b. Tools - Available tool descriptions
 *   4. Rules - Here are some important rules for the interaction:
 *   - Always stay in character, as Joe, an AI from AdAstra careers
 *   - If you are unsure how to respond, say "Sorry, I didn't understand that. Could you repeat the question?"
 *   - If someone asks something irrelevant, say, "Sorry, I am Joe and I give career advice..."
 *   5. Examples - Here is an example of how to respond in a standard interaction:
 *   <example>
 *   User: Hi, how were you created and what do you do?
 *   Joe: Hello! My name is Joe, and I was created by AdAstra Careers to give career advice...
 *   </example>
 *   6. Conversation history - Here is the conversation history (between the user and you) prior to the question. <history>{HISTORY}</history>
 *   6b. Question - Here is the user's question: <question>{QUESTION}</question>
 *   7. Immediate task - How do you respond to the user's question?
 *   8. Thinking - Think about your answer first before you respond.
 *   9. Output formatting - Put your response in <response></response> tags.
 *   11. Prefilled response - Optional response starter
 */
export const buildStructuredPrompt = ({
  context,
  examples,
  history,
  instruction,
  outputFormatting,
  prefilledResponse,
  rules,
  task,
  taskContext,
  thinking,
  tone,
}: StructuredPromptSections) => {
  const formattedExamples = Array.isArray(examples)
    ? examples
        .map((example) => {
          // Indent content inside example tag (4 spaces)
          const indentedContent = example
            .split('\n')
            .map((line) => (line ? `    ${line}` : ''))
            .join('\n');

          return ['  <example>', indentedContent, '  </example>'].join('\n');
        })
        .join('\n')
    : examples;

  return sections([
    taskContext,
    tone,

    task && tag('task', task),

    instruction &&
      dedent`
        Here is the user's instruction (this is what you need to respond to):
        ${tag('instruction', instruction)}
      `,

    context &&
      dedent`
        Here is the context you should reference when answering the user:
        ${tag('context', context)}
      `,

    rules && tag('rules', rules),

    formattedExamples &&
      'Here are some examples of how to respond in a standard interaction:\n' +
        tag('examples', formattedExamples),

    history &&
      dedent`
        Here is the conversation history (between the user and you) prior to the current instruction:
        ${tag('history', history)}
      `,

    // or <reasoningSteps>
    thinking && tag('thinking', thinking),
    // Not needed with structured output
    outputFormatting && tag('outputFormatting', outputFormatting),
    // Not needed with structured output
    (prefilledResponse ?? null) !== null &&
      tag('prefilledResponse', prefilledResponse ?? ''),
  ]);
};

export function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Format conversation history for prompts. Extracts text from messages and
 * formats as ROLE: text. Returns empty string if only one message (no history needed).
 */
export function formatTextFromMessages(
  messages: ChatMessage[],
  options?: { limit?: number }
): string {
  // No history needed if no messages or only one message
  if (!messages || messages.length <= 1) return '';

  const historyMessages = options?.limit
    ? messages.slice(-options.limit)
    : messages;

  return historyMessages
    .map((message) => {
      const text = getTextFromMessage(message).trim();

      if (!text) return null;

      const role = message.role.toUpperCase();

      return `${role}: ${text}`;
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Get the last user message text from messages array.
 */
export function getLastUserInstruction(messages: ChatMessage[]): string {
  if (!messages || messages.length === 0) return '';

  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === 'user');

  if (!lastUserMessage) return '';

  return getTextFromMessage(lastUserMessage).trim();
}

const SELECTION_START = '<Selection>';
const SELECTION_END = '</Selection>';

export const addSelection = (editor: SlateEditor) => {
  if (!editor.selection) return;
  if (editor.api.isExpanded()) {
    const [start, end] = RangeApi.edges(editor.selection);

    editor.tf.withoutNormalizing(() => {
      editor.tf.insertText(SELECTION_END, {
        at: end,
      });

      editor.tf.insertText(SELECTION_START, {
        at: start,
      });
    });
  }
};

const removeEscapeSelection = (editor: SlateEditor, text: string) => {
  let newText = text
    .replace(`\\${SELECTION_START}`, SELECTION_START)
    .replace(`\\${SELECTION_END}`, SELECTION_END);

  // If the selection is on a void element, inserting the placeholder will fail, and the string must be replaced manually.
  if (!newText.includes(SELECTION_END)) {
    const [_, end] = RangeApi.edges(editor.selection!);

    const node = editor.api.block({ at: end.path });

    if (!node) return newText;
    if (editor.api.isVoid(node[0])) {
      const voidString = serializeMd(editor, { value: [node[0]] });

      const idx = newText.lastIndexOf(voidString);

      if (idx !== -1) {
        newText =
          newText.slice(0, idx) +
          voidString.trimEnd() +
          SELECTION_END +
          newText.slice(idx + voidString.length);
      }
    }
  }

  return newText;
};

/** Check if the current selection fully covers all top-level blocks. */
export const isMultiBlocks = (editor: SlateEditor) => {
  const blocks = editor.api.blocks({ mode: 'lowest' });

  return blocks.length > 1;
};

/** Get markdown with selection markers */
export const getMarkdownWithSelection = (editor: SlateEditor) =>
  removeEscapeSelection(editor, getMarkdown(editor, { type: 'block' }));

/** Check if the current selection is inside a table cell */
export const isSelectionInTable = (editor: SlateEditor): boolean => {
  if (!editor.selection) return false;

  const tableEntry = editor.api.block({
    at: editor.selection,
    match: { type: KEYS.table },
  });

  return !!tableEntry;
};

/** Check if selection is within a single table cell */
export const isSingleCellSelection = (editor: SlateEditor): boolean => {
  if (!editor.selection) return false;

  // Get all td blocks in selection
  const cells = Array.from(
    editor.api.nodes({
      at: editor.selection,
      match: { type: KEYS.td },
    })
  );

  return cells.length === 1;
};
