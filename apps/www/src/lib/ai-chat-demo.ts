import type { AiSeedConfig, Json } from '@emulators/ai';
import { NodeApi } from 'platejs';
import type { AIChatRequestContext } from 'platejs/ai';

import { getCommentBlocks } from '@/registry/app/api/ai/command/prompt/getCommentPrompt';
import type {
  ChatMessage,
  ToolName,
} from '@/registry/components/editor/use-chat';

type DemoRules = NonNullable<AiSeedConfig['rules']>;

type DemoScenario = {
  chosenTool: ToolName;
  rules: (ctx: AIChatRequestContext) => DemoRules;
};

const markdownSample = `Make text **bold**, *italic*, __underlined__, or apply a ***combination*** of these styles for a visually striking effect.

Add ~~strikethrough~~ to indicate deleted or outdated content.

Write code snippets with inline \`code\` formatting for easy readability.

Add [links](https://example.com) to external resources or references.

Use inline math equations like $E = mc^2$ for scientific notation.

# Heading 1

## Heading 2

### Heading 3

> Blockquote

- Unordered list item 1
- Unordered list item 2

1. Ordered list item 1
2. Ordered list item 2

- [ ] Task list item 1
- [x] Task list item 2

![Alt text](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

### Advantage blocks:

$$
a^2 + b^2 = c^2
$$

\`\`\`python
# Code block
print("Hello, World!")
\`\`\`

Horizontal rule

---

| Header 1 | Header 2 |
|----------|----------|
| Row 1    | Data     |
| Row 2    | Data     |`;

const demoProse = `Plate turns a plain text box into an editor your users can shape: headings, lists, tables and media all live in one document model.

The AI menu works on that same model, so a draft, an edit or a comment lands as ordinary blocks you can undo, review and keep editing.

Add your own AI Gateway key to see a real model answer here instead of this scripted demo.`;

const demoComments = [
  'Consider opening with the main point so readers know where this is going.',
  'A short example here would make this easier to follow.',
  'This sentence could be tighter without losing its meaning.',
];

const demoCellTexts = [
  'Updated with a clearer summary.',
  'Rewritten to match the column heading.',
  'Shortened to fit the table.',
];

const copilotCompletions = [
  ' and the rest of the paragraph follows naturally from here.',
  ' which makes the idea easier to picture.',
  ' so the next step is to try it in your own editor.',
  ' while keeping the original meaning intact.',
];

const toolRules = (
  tool: 'comment' | 'table',
  elements: Json[],
  textContains?: string
): DemoRules => [
  {
    id: tool,
    match: { tool },
    reply: [{ arguments: {}, name: tool, type: 'tool_call' }],
    times: 1,
  },
  {
    id: `${tool}-elements`,
    match: { stream: true, textContains },
    reply: [{ type: 'object', value: { elements } }],
    timing: { chunkDelayMs: 50 },
    times: 1,
  },
];

const textRules = (text: string, chunkDelayMs: number): DemoRules => [
  {
    id: 'text',
    match: { stream: true },
    reply: [{ text, type: 'text' }],
    timing: { chunkDelayMs },
    times: 1,
  },
];

const demoScenarios: Record<
  'comment' | 'continue-writing' | 'markdown' | 'table' | 'text',
  DemoScenario
> = {
  comment: {
    chosenTool: 'comment',
    rules: (ctx) =>
      toolRules(
        'comment',
        getCommentBlocks({
          children: ctx.children,
          refs: ctx.refs.blocks,
          selection: ctx.nodeSelection ? null : ctx.selection,
        })
          .map(({ block, ref }) => ({ ref, text: NodeApi.string(block) }))
          .filter(({ text }) => text.trim())
          .filter((_, index) => index % 2 === 0)
          .map(({ ref, text }, index) => ({
            blockRef: ref,
            comment: demoComments[index % demoComments.length],
            content: text.includes('.')
              ? text.slice(0, text.indexOf('.'))
              : text,
          }))
      ),
  },
  'continue-writing': {
    chosenTool: 'generate',
    rules: () =>
      textRules(
        'AI can help turn an initial idea into a clear and useful first draft.',
        40
      ),
  },
  markdown: {
    chosenTool: 'generate',
    rules: () => textRules(markdownSample, 8),
  },
  table: {
    chosenTool: 'edit',
    rules: (ctx) => [
      ...toolRules(
        'table',
        ctx.refs.tableCells
          .filter(({ path }) =>
            NodeApi.getIf({ children: ctx.children, type: '' }, path)
          )
          .map(({ ref }, index) => ({
            content: demoCellTexts[index % demoCellTexts.length],
            ref,
          })),
        '<CellRef'
      ),
      ...textRules(demoProse, 30),
    ],
  },
  text: {
    chosenTool: 'generate',
    rules: () => textRules(demoProse, 30),
  },
};

const pickScenario = (
  ctx: AIChatRequestContext,
  messages: ChatMessage[]
): keyof typeof demoScenarios => {
  const text = messages
    .at(-1)
    ?.parts.find((part) => part.type === 'text')?.text;
  const manyCells = ctx.refs.tableCells.length > 1;

  if (ctx.toolName === 'comment') return 'comment';
  if (ctx.toolName === 'edit') return manyCells ? 'table' : 'text';
  if (text === 'Generate a markdown sample') return 'markdown';
  if (
    text?.includes('Continue writing AFTER <Block>') ||
    text?.includes('Start writing a new paragraph AFTER <Document>')
  ) {
    return 'continue-writing';
  }
  if (!ctx.toolName && text?.includes('comment')) return 'comment';
  if (!ctx.toolName && manyCells) return 'table';

  return 'text';
};

export function commandDemoConfig({
  ctx,
  messages,
}: {
  ctx: AIChatRequestContext;
  messages: ChatMessage[];
}): AiSeedConfig {
  const scenario = demoScenarios[pickScenario(ctx, messages)];
  const [first, ...rest]: DemoRules = [
    ...(ctx.toolName
      ? []
      : [
          {
            id: 'choose',
            match: { stream: false },
            reply: [
              {
                type: 'object' as const,
                value: { result: scenario.chosenTool },
              },
            ],
            times: 1,
          },
        ]),
    ...scenario.rules(ctx),
  ];

  return {
    rules: [{ ...first, timing: { ...first.timing, ttftMs: 400 } }, ...rest],
    strict: true,
  };
}

export function copilotDemoConfig({
  prompt,
}: {
  prompt?: string;
}): AiSeedConfig {
  let hash = 0;
  for (const char of prompt ?? '') {
    hash = (hash * 31 + char.charCodeAt(0)) % 2_147_483_647;
  }

  return {
    rules: [
      {
        id: 'completion',
        match: { stream: false },
        reply: [
          {
            text: copilotCompletions[hash % copilotCompletions.length],
            type: 'text',
          },
        ],
      },
    ],
    strict: true,
  };
}
