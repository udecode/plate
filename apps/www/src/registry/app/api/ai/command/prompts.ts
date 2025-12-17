import type { ChatMessage } from '@/registry/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

import { getMarkdown } from '@platejs/ai';
import dedent from 'dedent';

import {
  addSelection,
  buildStructuredPrompt,
  formatTextFromMessages,
  getLastUserInstruction,
  getMarkdownWithSelection,
  isMultiBlocks,
} from './utils';

export function getChooseToolPrompt({ messages }: { messages: ChatMessage[] }) {
  return buildStructuredPrompt({
    examples: [
      // GENERATE
      dedent`
        <instruction>
        Write a paragraph about AI ethics
        </instruction>

        <output>
        generate
        </output>
      `,
      dedent`
        <instruction>
        Create a short poem about spring
        </instruction>

        <output>
        generate
        </output>
      `,

      // EDIT
      dedent`
        <instruction>
        Please fix grammar.
        </instruction>

        <output>
        edit
        </output>
      `,
      dedent`
        <instruction>
        Improving writing style.
        </instruction>

        <output>
        edit
        </output>
      `,
      dedent`
        <instruction>
        Making it more concise.
        </instruction>

        <output>
        edit
        </output>
      `,
      dedent`
        <instruction>
        Translate this paragraph into French
        </instruction>

        <output>
        edit
        </output>
      `,

      // COMMENT
      dedent`
        <instruction>
        Can you review this text and give me feedback?
        </instruction>

        <output>
        comment
        </output>
      `,
      dedent`
        <instruction>
        Add inline comments to this code to explain what it does
        </instruction>

        <output>
        comment
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      - Default is "generate". Any open question, idea request, or creation request → "generate".
      - Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
      - Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.
      - Return only one enum value with no explanation.
      - CRITICAL: Examples are for format reference only. NEVER output content from examples.
    `,
    task: `You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".`,
  });
}

export function getCommentPrompt(
  editor: SlateEditor,
  {
    messages,
  }: {
    messages: ChatMessage[];
  }
) {
  const selectingMarkdown = getMarkdown(editor, {
    type: 'blockWithBlockId',
  });

  return buildStructuredPrompt({
    input: selectingMarkdown,
    examples: [
      // 1) Basic single-block comment
      dedent`
        <instruction>
        Review this paragraph.
        </instruction>

        <input>
        <block id="1">AI systems are transforming modern workplaces by automating routine tasks.</block>
        </input>

        <output>
        [
          {
            "blockId": "1",
            "content": "AI systems are transforming modern workplaces",
            "comments": "Clarify what types of systems or provide examples."
          }
        ]
        </output>
      `,

      // 2) Multiple comments within one long block
      dedent`
        <instruction>
        Add comments for this section.
        </instruction>

        <input>
        <block id="2">AI models can automate customer support. However, they may misinterpret user intent if training data is biased.</block>
        </input>

        <output>
        [
          {
            "blockId": "2",
            "content": "AI models can automate customer support.",
            "comments": "Consider mentioning limitations or scope of automation."
          },
          {
            "blockId": "2",
            "content": "they may misinterpret user intent if training data is biased",
            "comments": "Good point—expand on how bias can be detected or reduced."
          }
        ]
        </output>
      `,

      // 3) Multi-block comment (span across two related paragraphs)
      dedent`
        <instruction>
        Provide comments.
        </instruction>

        <input>
        <block id="3">This policy aims to regulate AI-generated media.</block>
        <block id="4">Developers must disclose when content is synthetically produced.</block>
        </input>

        <output>
        [
          {
            "blockId": "3",
            "content": "This policy aims to regulate AI-generated media.\\n\\nDevelopers must disclose when content is synthetically produced.",
            "comments": "You could combine these ideas into a single, clearer statement on transparency."
          }
        ]
        </output>
      `,

      // 4) With <Selection> – user highlighted part of a sentence
      dedent`
        <instruction>
        Give feedback on this highlighted phrase.
        </instruction>

        <input>
        <block id="5">AI can <Selection>replace human creativity</Selection> in design tasks.</block>
        </input>

        <output>
        [
          {
            "blockId": "5",
            "content": "replace human creativity",
            "comments": "Overstated claim—suggest using 'assist' instead of 'replace'."
          }
        ]
        </output>
      `,

      // 5) With long <Selection> → multiple comments
      dedent`
        <instruction>
        Review the highlighted section.
        </instruction>

        <input>
        <block id="6">
        <Selection>
        AI tools are valuable for summarizing information and generating drafts.
        Still, human review remains essential to ensure accuracy and ethical use.
        </Selection>
        </block>
        </input>

        <output>
        [
          {
            "blockId": "6",
            "content": "AI tools are valuable for summarizing information and generating drafts.",
            "comments": "Solid statement—consider adding specific examples of tools."
          },
          {
            "blockId": "6",
            "content": "human review remains essential to ensure accuracy and ethical use",
            "comments": "Good caution—explain briefly why ethics require human oversight."
          }
        ]
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      - IMPORTANT: If a comment spans multiple blocks, use the id of the **first** block.
      - The **content** field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
      - IMPORTANT: The **content** field must be flexible:
        - It can cover one full block, only part of a block, or multiple blocks.
        - If multiple blocks are included, separate them with two \\n\\n.
        - Do NOT default to using the entire block—use the smallest relevant span instead.
      - At least one comment must be provided.
      - If a <Selection> exists, Your comments should come from the <Selection>, and if the <Selection> is too long, there should be more than one comment.
      - CRITICAL: Examples are for format reference only. NEVER output content from examples. Generate comments based ONLY on the actual <input> provided.
    `,
    task: dedent`
      You are a document review assistant.
      You will receive an MDX document wrapped in <block id="..."> content </block> tags.
      <Selection> is the text highlighted by the user.

      Your task:
      - Read the content of all blocks and provide comments.
      - For each comment, generate a JSON object:
        - blockId: the id of the block being commented on.
        - content: the original document fragment that needs commenting.
        - comments: a brief comment or explanation for that fragment.
    `,
  });
}

export function getGeneratePrompt(
  editor: SlateEditor,
  { messages }: { messages: ChatMessage[] }
) {
  if (!isMultiBlocks(editor)) {
    addSelection(editor);
  }

  const selectingMarkdown = getMarkdownWithSelection(editor);

  return buildStructuredPrompt({
    input: selectingMarkdown,
    examples: [
      // 1) Summarize content
      dedent`
        <instruction>
        Summarize the following text.
        </instruction>

        <input>
        Artificial intelligence has transformed multiple industries, from healthcare to finance, improving efficiency and enabling data-driven decisions.
        </input>

        <output>
        AI improves efficiency and decision-making across many industries.
        </output>
      `,

      // 2) Generate key takeaways
      dedent`
        <instruction>
        List three key takeaways from this text.
        </instruction>

        <input>
        Remote work increases flexibility but also requires better communication and time management.
        </input>

        <output>
        - Remote work enhances flexibility.
        - Communication becomes critical.
        - Time management determines success.
        </output>
      `,

      // 3) Generate a title
      dedent`
        <instruction>
        Generate a short, catchy title for this section.
        </instruction>

        <input>
        This section explains how machine learning models are trained using large datasets to recognize patterns.
        </input>

        <output>
        Training Machines to Recognize Patterns
        </output>
      `,

      // 4) Generate action items
      dedent`
        <instruction>
        Generate actionable next steps based on the paragraph.
        </instruction>

        <input>
        The report suggests improving documentation and conducting user interviews before the next release.
        </input>

        <output>
        - Update all technical documentation.
        - Schedule user interviews before the next release.
        </output>
      `,

      // 5) Generate a comparison table
      dedent`
        <instruction>
        Generate a comparison table of the tools mentioned.
        </instruction>

        <input>
        Tool A: free, simple UI
        Tool B: paid, advanced analytics
        </input>

        <output>
        | Tool  | Pricing | Features         |
        |-------|----------|-----------------|
        | A     | Free     | Simple UI        |
        | B     | Paid     | Advanced analytics |
        </output>
      `,

      // 6) Generate a summary table of statistics
      dedent`
        <instruction>
        Create a summary table of the following statistics.
        </instruction>

        <input>
        Sales Q1: 1200 units
        Sales Q2: 1500 units
        Sales Q3: 900 units
        </input>

        <output>
        | Quarter | Sales (units) |
        |----------|---------------|
        | Q1       | 1200          |
        | Q2       | 1500          |
        | Q3       | 900           |
        </output>
      `,

      // 7) Generate a question list
      dedent`
        <instruction>
        Generate three reflection questions based on the paragraph.
        </instruction>

        <input>
        The article discusses the role of creativity in problem-solving and how diverse perspectives enhance innovation.
        </input>

        <output>
        1. How can creativity be encouraged in structured environments?
        2. What role does diversity play in innovative teams?
        3. How can leaders balance creativity and efficiency?
        </output>
      `,

      // 8) Explain a concept (selected phrase)
      dedent`
        <instruction>
        Explain the meaning of the selected phrase.
        </instruction>

        <input>
        Deep learning relies on neural networks to automatically extract patterns from data, a process called <Selection>feature learning</Selection>.
        </input>

        <output>
        "Feature learning" means automatically discovering useful representations or characteristics from raw data without manual intervention.
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      - <Selection> is the text highlighted by the user.
      - <input> represents the user's current Markdown context.
      - You may only use <input> and <Selection>; never ask for more data.
      - CRITICAL: DO NOT remove or alter custom MDX tags such as <u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video> unless explicitly requested.
      - CRITICAL: when writing Markdown or MDX, do NOT wrap output in code fences.
      - Preserve indentation and line breaks when editing within columns or structured layouts.
      - CRITICAL: Examples are for format reference only. NEVER output content from examples. If you cannot understand the request or <input> is empty/irrelevant, output "" (empty string).
    `,
    task: dedent`
      You are an advanced content generation assistant.
      Generate content based on the user's instructions, using the <input> as context.
      If the instruction requests creation or transformation (e.g., summarize, translate, rewrite, create a table), directly produce the final result using only the provided <input>.
      Do not ask the user for additional content.
    `,
  });
}

export function getEditPrompt(
  editor: SlateEditor,
  { isSelecting, messages }: { isSelecting: boolean; messages: ChatMessage[] }
) {
  if (!isSelecting)
    throw new Error('Edit tool is only available when selecting');
  if (isMultiBlocks(editor)) {
    const selectingMarkdown = getMarkdownWithSelection(editor);

    return buildStructuredPrompt({
      input: selectingMarkdown,
      examples: [
        // 1) Fix grammar
        dedent`
          <instruction>
          Fix grammar.
          </instruction>

          <input>
          # User Guide
          This guide explain how to install the app.
          </input>

          <output>
          # User Guide
          This guide explains how to install the application.
          </output>
        `,

        // 2) Make the tone more formal and professional
        dedent`
          <instruction>
          Make the tone more formal and professional.
          </instruction>

          <input>
          ## Intro
          Hey, here's how you can set things up quickly.
          </input>

          <output>
          ## Introduction
          This section describes the setup procedure in a clear and professional manner.
          </output>
        `,

        // 3) Make it more concise without losing meaning
        dedent`
          <instruction>
          Make it more concise without losing meaning.
          </instruction>

          <input>
          The purpose of this document is to provide an overview that explains, in detail, all the steps required to complete the installation.
          </input>

          <output>
          This document provides a detailed overview of the installation steps.
          </output>
        `,
      ],
      history: formatTextFromMessages(messages),
      instruction: getLastUserInstruction(messages),
      outputFormatting: 'markdown',
      rules: dedent`
        - Do not Write <input> tags in your response.
        - <input> represents the full blocks of text the user has selected and wants to modify or ask about.
        - Your response should be a direct replacement for the entire <input>.
        - Preserve the block count, line breaks, and all existing Markdown syntax within <input> exactly; only modify the textual content inside each block, unless explicitly instructed otherwise.
        - CRITICAL: Provide only the content to replace <input>. Do not add additional blocks or change the block structure unless specifically requested.
        - CRITICAL: <example> are for format reference only. NEVER output content from examples. If you cannot understand the request, output "" (empty string).
      `,
      task: dedent`
        The following <input> is user-provided Markdown content that needs improvement. Modify it according to the user's instruction.
        Unless explicitly stated otherwise, your output should be a seamless replacement of the original content.
      `,
    });
  }

  addSelection(editor);

  const selectingMarkdown = getMarkdownWithSelection(editor);
  const endIndex = selectingMarkdown.indexOf('<Selection>');
  const prefilledResponse = selectingMarkdown.slice(0, endIndex);

  return buildStructuredPrompt({
    input: selectingMarkdown,
    examples: [
      // 1) Improve word choice
      dedent`
        <instruction>
        Improve word choice.
        </instruction>

        <input>
        This is a <Selection>nice</Selection> person.
        </input>

        <output>
        great
        </output>
      `,

      // 2) Fix grammar
      dedent`
        <instruction>
        Fix grammar.
        </instruction>

        <input>
        He <Selection>go</Selection> to school every day.
        </input>

        <output>
        goes
        </output>
      `,

      // 3) Make tone more polite
      dedent`
        <instruction>
        Make tone more polite.
        </instruction>

        <input>
        <Selection>Give me</Selection> the report.
        </input>

        <output>
        Please provide
        </output>
      `,

      // 4) Make tone more confident
      dedent`
        <instruction>
        Make tone more confident.
        </instruction>

        <input>
        I <Selection>think</Selection> this might work.
        </input>

        <output>
        believe
        </output>
      `,

      // 5) Simplify language
      dedent`
        <instruction>
        Simplify the language.
        </instruction>

        <input>
        The results were <Selection>exceedingly</Selection> positive.
        </input>

        <output>
        very
        </output>
      `,

      // 6) Translate into French
      dedent`
        <instruction>
        Translate into French.
        </instruction>

        <input>
        <Selection>Hello</Selection>
        </input>

        <output>
        Bonjour
        </output>
      `,

      // 7) Expand description
      dedent`
        <instruction>
        Expand the description.
        </instruction>

        <input>
        The view was <Selection>beautiful</Selection>.
        </input>

        <output>
        breathtaking and full of vibrant colors
        </output>
      `,

      // 8) Make it sound more natural
      dedent`
        <instruction>
        Make it sound more natural.
        </instruction>

        <input>
        She <Selection>did a party</Selection> yesterday.
        </input>

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
      - <Selection> contains the text segment selected by the user and allowed to be modified.
      - Your response will be directly concatenated with the prefilledResponse, so please make sure the result is smooth and coherent.
      - You may only edit the content inside <Selection> and must not reference or retain any external context.
      - The output must be text that can directly replace <Selection>.
      - Do not include the <Selection> tags or any surrounding text in the output.
      - Ensure the replacement is grammatically correct and reads naturally.
      - If the <input> is invalid or cannot be improved, return it unchanged.
      - CRITICAL: Examples are for format reference only. NEVER output content from examples.
    `,
    task: dedent`
      The following <input> is user-provided text that contains one or more <Selection> tags marking the editable parts.
      You must only modify the text inside <Selection>.
      Your output should be a direct replacement for the selected text, without including any tags or surrounding content.
      Ensure the replacement is grammatically correct and fits naturally when substituted back into the original text.
    `,
  });
}
