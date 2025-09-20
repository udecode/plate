import type {
  ChatMessage,
  ToolName,
} from '@/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import { google } from '@ai-sdk/google';
import { replacePlaceholders } from '@platejs/ai';
import { serializeMd } from '@platejs/markdown';
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

import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import { markdownJoinerTransform } from '@/lib/markdown-joiner-transform';

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

  const isSelecting = editor.api.isExpanded();

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
            enum: isSelecting
              ? ['generate', 'edit', 'comment']
              : ['generate', 'comment'],
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
            generateSystemTemplate({ isSelecting })
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
          if (!isSelecting)
            throw new Error('Edit tool is only available when selecting');

          const editSystem = replacePlaceholders(editor, editSystemTemplate());

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
            commentPromptTemplate({ isSelecting }),
            {
              prompt,
            }
          );

          const { elementStream } = streamObject({
            maxOutputTokens: 2048,
            model: google('gemini-2.5-flash'),
            output: 'array',
            prompt: removeEscapeSelection(editor, commentPrompt),
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

const generateSystemTemplate = ({ isSelecting }: { isSelecting: boolean }) => {
  return isSelecting
    ? PROMPT_TEMPLATES.generateSystemDefault
    : PROMPT_TEMPLATES.generateSystemSelecting;
};

const editSystemTemplate = () => {
  return PROMPT_TEMPLATES.editSystemSelecting;
};

const promptTemplate = ({ isSelecting }: { isSelecting: boolean }) => {
  return isSelecting
    ? PROMPT_TEMPLATES.promptSelecting
    : PROMPT_TEMPLATES.promptDefault;
};

const commentPromptTemplate = ({ isSelecting }: { isSelecting: boolean }) => {
  return isSelecting
    ? PROMPT_TEMPLATES.commentPromptSelecting
    : PROMPT_TEMPLATES.commentPromptDefault;
};

const chooseToolSystem = `You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".

Priority rules:
1. Default is "generate". Any open question, idea request, or creation request → "generate".
2. Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
3. Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.

Return only one enum value with no explanation.`;

const commentSystem = `You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  
<Selection> is the text highlighted by the user.

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
- If a <Selection> exists, Your comments should come from the <Selection>, and if the <Selection> is too long, there should be more than one comment.
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

const generateSystemDefault = `\
${systemCommon}
- <Block> is the current block of text the user is working on.

<Block>
{block}
</Block>
`;

const generateSystemSelecting = `\
${systemCommon}
- <Block> contains the text context. You will always receive one <Block>.
- <selection> is the text highlighted by the user.
`;

const editSystemSelecting = `\
- <Block> shows the full sentence or paragraph, only for context. 
- <Selection> is the exact span of text inside <Block> that must be replaced. 
- Your output MUST be only the replacement string for <Selection>, with no tags. 
- Never output <Block> or <Selection> tags, and never output surrounding text. 
- The replacement must be grammatically correct when substituted back into <Block>. 
- Ensure the replacement fits seamlessly so the whole <Block> reads naturally. 
- Output must be limited to the replacement string itself.
- Do not remove the \\n in the original text
`;

const promptDefault = `<Reminder>
CRITICAL: NEVER write <Block>.
</Reminder>
{prompt}`;

const promptSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>

<Block>
{block}
</Block>
`;

const commentPromptSelecting = `
Comment on the content within the <Selection>.
Never write <Selection>.
{prompt}:
        
{blockWithBlockId}
`;

const commentPromptDefault = `{prompt}:
        
{editorWithBlockId}
`;

const PROMPT_TEMPLATES = {
  commentPromptDefault,
  commentPromptSelecting,
  editSystemSelecting,
  generateSystemDefault,
  generateSystemSelecting,
  promptDefault,
  promptSelecting,
};

const replaceMessagePlaceholders = (
  editor: SlateEditor,
  message: ChatMessage,
  { isSelecting }: { isSelecting: boolean }
): ChatMessage => {
  if (isSelecting) addSelection(editor);

  const template = promptTemplate({ isSelecting });

  const parts = message.parts.map((part) => {
    if (part.type !== 'text' || !part.text) return part;

    let text = replacePlaceholders(editor, template, {
      prompt: part.text,
    });

    if (isSelecting) text = removeEscapeSelection(editor, text);

    return { ...part, text } as typeof part;
  });

  return { ...message, parts };
};

const SELECTION_START = '<Selection>';
const SELECTION_END = '</Selection>';

const addSelection = (editor: SlateEditor) => {
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
