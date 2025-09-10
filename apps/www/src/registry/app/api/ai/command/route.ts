import type {
  ChatMessage,
  ToolName,
} from '@/registry/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { replacePlaceholders } from '@platejs/ai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamObject,
  streamText,
} from 'ai';
import { NextResponse } from 'next/server';
import { type SlateEditor, createSlateEditor, nanoid, RangeApi } from 'platejs';
import { z } from 'zod';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { markdownJoinerTransform } from '@/registry/lib/markdown-joiner-transform';

export async function POST(req: NextRequest) {
  const { apiKey: key, ctx, messages: messagesRaw } = await req.json();

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  const isSelecting = editor.api.isExpanded();

  const isBlockSelecting = isSelectingAllBlocks(editor);

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        const lastIndex = messagesRaw.findIndex(
          (message: any) => message.role === 'user'
        );

        const messages = [...messagesRaw];

        messages[lastIndex] = replaceMessagePlaceholders(
          editor,
          messages[lastIndex],
          {
            isSelecting,
          }
        );

        const lastUserMessage = messages[lastIndex];

        let toolName = toolNameParam;

        if (!toolName) {
          const { object: AIToolName } = await generateObject({
            enum: ['generate', 'edit', 'comment'],
            model: google('gemini-2.5-flash'),
            output: 'enum',
            prompt: `User message:
            ${JSON.stringify(lastUserMessage)}`,
            system: chooseToolSystem,
          });

          writer.write({
            data: AIToolName as ToolName,
            type: 'data-toolName',
          });

          toolName = AIToolName;
        }

        if (toolName === 'generate') {
          const generateSystem = replacePlaceholders(
            editor,
            systemTemplate({ isBlockSelecting, isSelecting })
          );

          const gen = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: google('gemini-2.5-flash'),
            system: generateSystem,
          });

          writer.merge(gen.toUIMessageStream({ sendFinish: false }));
        }

        if (toolName === 'edit') {
          const editSystem = replacePlaceholders(
            editor,
            systemTemplate({ isBlockSelecting, isSelecting })
          );

          const edit = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: google('gemini-2.5-flash'),
            system: editSystem,
          });

          writer.merge(edit.toUIMessageStream({ sendFinish: false }));
        }

        if (toolName === 'comment') {
          const lastUserMessage = messagesRaw[lastIndex] as ChatMessage;
          const prompt = lastUserMessage.parts.find(
            (p) => p.type === 'text'
          )?.text;

          const commentPrompt = replacePlaceholders(
            editor,
            commentTemplate({ isSelecting }),
            {
              prompt,
            }
          );

          const { elementStream } = streamObject({
            maxOutputTokens: 2048,
            model: openai('gpt-4o'),
            output: 'array',
            prompt: commentPrompt,
            schema: z
              .object({
                blockId: z
                  .string()
                  .describe(
                    'The id of the starting block. If the comment spans multiple blocks, use the id of the first block.'
                  ),
                comment: z
                  .string()
                  .describe(
                    'A brief comment or explanation for this fragment.'
                  ),
                content: z
                  .string()
                  .describe(
                    String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
                  ),
              })
              .describe('A single comment'),
            system: commentSystem,
          });

          // Create a single message ID for the entire comment stream

          for await (const comment of elementStream) {
            const commentDataId = nanoid();
            // Send each comment as a delta

            writer.write({
              id: commentDataId,
              data: comment,
              type: 'data-comment',
            });
          }

          return;
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

const systemTemplate = ({
  isBlockSelecting,
  isSelecting,
}: {
  isBlockSelecting: boolean;
  isSelecting: boolean;
}) => {
  return isBlockSelecting
    ? PROMPT_TEMPLATES.systemBlockSelecting
    : isSelecting
      ? PROMPT_TEMPLATES.systemSelecting
      : PROMPT_TEMPLATES.systemDefault;
};

const promptTemplate = ({ isSelecting }: { isSelecting: boolean }) => {
  return isSelecting
    ? PROMPT_TEMPLATES.userSelecting
    : PROMPT_TEMPLATES.userDefault;
};

const commentTemplate = ({ isSelecting }: { isSelecting: boolean }) => {
  return isSelecting
    ? PROMPT_TEMPLATES.commentSelecting
    : PROMPT_TEMPLATES.commentDefault;
};

const chooseToolSystem = `You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".

Priority rules:
1. Default is "generate". Any open question, idea request, or creation request → "generate".
2. Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
3. Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.

Return only one enum value with no explanation.`;

const commentSystem = `You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  

Your task:  
- Read the content of all blocks and provide comments.  
- For each comment, generate a JSON object:  
  - blockId: the id of the block being commented on.
  - content: the original document fragment that needs commenting.
  - comments: a brief comment or explanation for that fragment.

Rules:
- IMPORTANT: If a comment spans multiple blocks, use the id of the **first** block.
- The **content** field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
- IMPORTANT: The **content** field must be flexible:
  - It can cover one full block, only part of a block, or multiple blocks.  
  - If multiple blocks are included, separate them with two \\n\\n.  
  - Do NOT default to using the entire block—use the smallest relevant span instead.
- At least one comment must be provided.
`;

const systemCommon = `\
You are an advanced AI-powered note-taking assistant, designed to enhance productivity and creativity in note management.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: DO NOT remove or modify the following custom MDX tags: <u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video> in <Selection> unless the user explicitly requests this change.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
- CRITICAL: when asked to write in markdown, do not start with \`\`\`markdown.
- CRITICAL: When writing the column, such line breaks and indentation must be preserved.
<column_group>
  <column>
    1
  </column>
  <column>
    2
  </column>
  <column>
    3
  </column>
</column_group>
`;

const systemDefault = `\
${systemCommon}
- <Block> is the current block of text the user is working on.
- Ensure your output can seamlessly fit into the existing <Block> structure.

<Block>
{block}
</Block>
`;

const systemSelecting = `\
${systemCommon}
- <Block> is the block of text containing the user's selection, providing context.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>.
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
`;

const systemBlockSelecting = `\
${systemCommon}
- <Selection> represents the full blocks of text the user has selected and wants to modify or ask about.
- Your response should be a direct replacement for the entire <Selection>.
- Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
- CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
<Selection>
{block}
</Selection>
`;

const userDefault = `<Reminder>
CRITICAL: NEVER write <Block>.
</Reminder>
{prompt}`;
const userSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>`;

const commentSelecting = `{prompt}:
        
{blockWithBlockId}
`;

const commentDefault = `{prompt}:
        
{editorWithBlockId}
`;

const PROMPT_TEMPLATES = {
  commentDefault,
  commentSelecting,
  systemBlockSelecting,
  systemDefault,
  systemSelecting,
  userDefault,
  userSelecting,
};

const replaceMessagePlaceholders = (
  editor: SlateEditor,
  message: ChatMessage,
  { isSelecting }: { isSelecting: boolean }
): ChatMessage => {
  const template = promptTemplate({ isSelecting });

  const parts = message.parts.map((part) => {
    if (part.type !== 'text' || !part.text) return part;

    const text = replacePlaceholders(editor, template, {
      prompt: part.text,
    });

    return { ...part, text } as typeof part;
  });

  return { ...message, parts };
};

/** Check if the current selection fully covers all top-level blocks. */
const isSelectingAllBlocks = (editor: SlateEditor) => {
  const blocksRange = editor.api.nodesRange(
    editor.api.blocks({ mode: 'highest' })
  );

  return (
    !!blocksRange &&
    !!editor.selection &&
    RangeApi.equals(blocksRange, editor.selection)
  );
};
