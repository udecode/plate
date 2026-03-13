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
} from '../utils';
import { commonGenerateRules } from './common';

function buildGenerateFreeformPrompt(messages: ChatMessage[]) {
  return buildStructuredPrompt({
    examples: [
      dedent`
        <instruction>
        Write a paragraph about AI ethics
        </instruction>

        <output>
        AI ethics is a critical field that examines the moral implications of artificial intelligence systems. As AI becomes more prevalent in decision-making processes, questions arise about fairness, transparency, and accountability.
        </output>
      `,
      dedent`
        <instruction>
        Write three tips for better sleep
        </instruction>

        <output>
        1. Maintain a consistent sleep schedule.
        2. Create a relaxing bedtime routine and avoid screens before sleep.
        3. Keep your bedroom cool, dark, and quiet.
        </output>
      `,
      dedent`
        <instruction>
        What is the difference between machine learning and deep learning?
        </instruction>

        <output>
        Machine learning is a subset of AI where algorithms learn patterns from data. Deep learning uses neural networks with many layers to automatically learn complex features from raw data.
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: commonGenerateRules,
    task: dedent`
      You are an advanced content generation assistant.
      Generate content based on the user's instructions.
      Directly produce the final result without asking for additional information.
    `,
  });
}

function buildGenerateContextPrompt(
  editor: SlateEditor,
  messages: ChatMessage[]
) {
  if (!isMultiBlocks(editor)) {
    addSelection(editor);
  }

  const selectingMarkdown = getMarkdownWithSelection(editor);

  return buildStructuredPrompt({
    context: selectingMarkdown,
    examples: [
      dedent`
        <instruction>
        Summarize the following text.
        </instruction>

        <context>
        Artificial intelligence has transformed multiple industries, from healthcare to finance, improving efficiency and enabling data-driven decisions.
        </context>

        <output>
        AI improves efficiency and decision-making across many industries.
        </output>
      `,
      dedent`
        <instruction>
        List three key takeaways from this text.
        </instruction>

        <context>
        Remote work increases flexibility but also requires better communication and time management.
        </context>

        <output>
        - Remote work enhances flexibility.
        - Communication becomes critical.
        - Time management determines success.
        </output>
      `,
      dedent`
        <instruction>
        Generate a comparison table of the tools mentioned.
        </instruction>

        <context>
        Tool A: free, simple UI
        Tool B: paid, advanced analytics
        </context>

        <output>
        | Tool | Pricing | Features |
        |------|---------|----------|
        | A | Free | Simple UI |
        | B | Paid | Advanced analytics |
        </output>
      `,
      dedent`
        <instruction>
        Explain the meaning of the selected phrase.
        </instruction>

        <context>
        Deep learning relies on neural networks to extract patterns from data, a process called <Selection>feature learning</Selection>.
        </context>

        <output>
        "Feature learning" means automatically discovering useful representations from raw data without manual intervention.
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      ${commonGenerateRules}
      - DO NOT remove or alter custom MDX tags such as <u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video> unless explicitly requested.
      - Preserve indentation and line breaks when editing within columns or structured layouts.
      - <Selection> tags are input-only markers. They must NOT appear in the output.
    `,
    task: dedent`
      You are an advanced content generation assistant.
      Generate content based on the user's instructions, using <context> as the sole source material.
      If the instruction requests creation or transformation (e.g., summarize, translate, rewrite, create a table), directly produce the final result.
      Do not ask the user for additional content.
    `,
  });
}

export function getGeneratePrompt(
  editor: SlateEditor,
  { isSelecting, messages }: { isSelecting: boolean; messages: ChatMessage[] }
) {
  // Freeform generation: open-ended creation without context
  if (!isSelecting) {
    return buildGenerateFreeformPrompt(messages);
  }
  // Context-based generation: use selected text as context
  return buildGenerateContextPrompt(editor, messages);
}
