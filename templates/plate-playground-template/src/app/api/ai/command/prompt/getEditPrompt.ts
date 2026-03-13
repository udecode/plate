import type { ChatMessage } from '@/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

import dedent from 'dedent';

import {
  addSelection,
  buildStructuredPrompt,
  formatTextFromMessages,
  getLastUserInstruction,
  getMarkdownWithSelection,
  isMultiBlocks,
  isSelectionInTable,
  isSingleCellSelection,
} from '../utils';

import { buildEditTableMultiCellPrompt } from './getEditTablePrompt';
import { commonEditRules } from './common';
function buildEditMultiBlockPrompt(
  editor: SlateEditor,
  messages: ChatMessage[]
) {
  const selectingMarkdown = getMarkdownWithSelection(editor);

  return buildStructuredPrompt({
    context: selectingMarkdown,
    examples: [
      dedent`
        <instruction>
        Fix grammar.
        </instruction>

        <context>
        # User Guide
        This guide explain how to install the app.
        </context>

        <output>
        # User Guide
        This guide explains how to install the application.
        </output>
      `,
      dedent`
        <instruction>
        Make the tone more formal and professional.
        </instruction>

        <context>
        ## Intro
        Hey, here's how you can set things up quickly.
        </context>

        <output>
        ## Introduction
        This section describes the setup procedure in a clear and professional manner.
        </output>
      `,
      dedent`
        <instruction>
        Make it more concise without losing meaning.
        </instruction>

        <context>
        The purpose of this document is to provide an overview that explains, in detail, all the steps required to complete the installation.
        </context>

        <output>
        This document provides a detailed overview of the installation steps.
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    outputFormatting: 'markdown',
    rules: dedent`
      ${commonEditRules}
      - Preserve the block count, line breaks, and all existing Markdown syntax exactly; only modify the textual content inside each block.
      - Do not change heading levels, list markers, link URLs, or add/remove blank lines unless explicitly instructed.
    `,
    task: dedent`
      The following <context> is user-provided Markdown content that needs improvement.
      Your output should be a seamless replacement of the original content.
    `,
  });
}

function buildEditSelectionPrompt(
  editor: SlateEditor,
  messages: ChatMessage[]
) {
  addSelection(editor);

  const selectingMarkdown = getMarkdownWithSelection(editor);
  const endIndex = selectingMarkdown.indexOf('<Selection>');
  const prefilledResponse =
    endIndex === -1 ? '' : selectingMarkdown.slice(0, endIndex);

  return buildStructuredPrompt({
    context: selectingMarkdown,
    examples: [
      dedent`
        <instruction>
        Improve word choice.
        </instruction>

        <context>
        This is a <Selection>nice</Selection> person.
        </context>

        <output>
        great
        </output>
      `,
      dedent`
        <instruction>
        Fix grammar.
        </instruction>

        <context>
        He <Selection>go</Selection> to school every day.
        </context>

        <output>
        goes
        </output>
      `,
      dedent`
        <instruction>
        Make tone more polite.
        </instruction>

        <context>
        <Selection>Give me</Selection> the report.
        </context>

        <output>
        Please provide
        </output>
      `,
      dedent`
        <instruction>
        Make tone more confident.
        </instruction>

        <context>
        I <Selection>think</Selection> this might work.
        </context>

        <output>
        believe
        </output>
      `,
      dedent`
        <instruction>
        Simplify the language.
        </instruction>

        <context>
        The results were <Selection>exceedingly</Selection> positive.
        </context>

        <output>
        very
        </output>
      `,
      dedent`
        <instruction>
        Translate into French.
        </instruction>

        <context>
        <Selection>Hello</Selection>
        </context>

        <output>
        Bonjour
        </output>
      `,
      dedent`
        <instruction>
        Expand the description.
        </instruction>

        <context>
        The view was <Selection>beautiful</Selection>.
        </context>

        <output>
        breathtaking and full of vibrant colors
        </output>
      `,
      dedent`
        <instruction>
        Make it sound more natural.
        </instruction>

        <context>
        She <Selection>did a party</Selection> yesterday.
        </context>

        <output>
        had a party
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    outputFormatting: 'markdown',
    prefilledResponse,
    rules: dedent`
      ${commonEditRules}
      - Your response will be directly concatenated with the prefilledResponse, so ensure the result is smooth and coherent.
      - You may use surrounding text in <context> to ensure the replacement fits naturally.
    `,
    task: dedent`
      The following <context> contains <Selection> tags marking the editable part.
      Output only the replacement for the selected text.
    `,
  });
}

export function getEditPrompt(
  editor: SlateEditor,
  { isSelecting, messages }: { isSelecting: boolean; messages: ChatMessage[] }
): [string, 'table' | 'multi-block' | 'selection'] {
  if (!isSelecting)
    throw new Error('Edit tool is only available when selecting');

  // Handle selection inside table cell
  if (isSelectionInTable(editor) && !isSingleCellSelection(editor)) {
    return [buildEditTableMultiCellPrompt(editor, messages), 'table'];
  }
  // Handle multi-block selection
  if (isMultiBlocks(editor)) {
    return [buildEditMultiBlockPrompt(editor, messages), 'multi-block'];
  }

  // Handle single block with selection
  return [buildEditSelectionPrompt(editor, messages), 'selection'];
}
