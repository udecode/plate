import type { AiSeedConfig, Json } from '@emulators/ai';
import { type Element, ElementApi, NodeApi, type Path, PathApi } from 'platejs';
import {
  type AIChatRequestContext,
  LOCKED_BLOCK_PLACEHOLDER_TAG,
} from 'platejs/ai';

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

const TABLE_CELL_TYPES = new Set(['tableCell', 'tableHeader', 'td', 'th']);

const findTableCellPath = (
  children: AIChatRequestContext['children'],
  pointPath: Path
): Path | null => {
  const root = { children, type: '' };

  for (let depth = pointPath.length; depth >= 1; depth -= 1) {
    const candidatePath = pointPath.slice(0, depth);
    const node = NodeApi.getIf(root, candidatePath);

    if (ElementApi.isElement(node) && TABLE_CELL_TYPES.has(node.type)) {
      return candidatePath;
    }
  }

  return null;
};

const hasMultiCellTableSelection = (ctx: AIChatRequestContext): boolean => {
  if (ctx.refs.tableCells.length > 1) return true;
  if (!ctx.selection) return false;

  const anchorCell = findTableCellPath(ctx.children, ctx.selection.anchor.path);
  const focusCell = findTableCellPath(ctx.children, ctx.selection.focus.path);

  return (
    anchorCell !== null &&
    focusCell !== null &&
    !PathApi.equals(anchorCell, focusCell)
  );
};

const resolveSelectedSiblingEntries = (
  ctx: AIChatRequestContext
): ReadonlyArray<readonly [Element, Path]> => {
  const root = { children: ctx.children, type: '' };

  if (ctx.nodeSelection?.paths.length) {
    return ctx.nodeSelection.paths.toSorted(PathApi.compare).flatMap((path) => {
      const node = NodeApi.getIf(root, path);

      return ElementApi.isElement(node) ? [[node, path] as const] : [];
    });
  }

  const locked = ctx.refs.lockedBlocks;

  const firstLocked = locked?.[0];

  if (!firstLocked || !ctx.selection) return [];

  const parentPath = PathApi.parent(firstLocked.path);
  const depth = parentPath.length;
  const anchorIndex = ctx.selection.anchor.path[depth];
  const focusIndex = ctx.selection.focus.path[depth];

  if (anchorIndex === undefined || focusIndex === undefined) return [];

  const start = Math.min(anchorIndex, focusIndex);
  const end = Math.max(anchorIndex, focusIndex);
  const entries: Array<readonly [Element, Path]> = [];

  for (let index = start; index <= end; index += 1) {
    const path = [...parentPath, index];
    const node = NodeApi.getIf(root, path);

    if (ElementApi.isElement(node)) {
      entries.push([node, path]);
    }
  }

  return entries;
};

const hasEditableLockedSelection = (ctx: AIChatRequestContext): boolean => {
  const locked = ctx.refs.lockedBlocks;

  if (!locked?.length) return false;

  const lockedPaths = new Set(locked.map(({ path }) => path.join(',')));
  const entries = resolveSelectedSiblingEntries(ctx);

  return entries.some(([, path]) => !lockedPaths.has(path.join(',')));
};

const headingPrefix = (node: Element): string | undefined => {
  if (node.type === 'heading') {
    const level =
      typeof node.level === 'number' && node.level >= 1 && node.level <= 6
        ? node.level
        : 2;

    return `${'#'.repeat(level)} `;
  }

  const match = /^h([1-6])$/.exec(node.type);

  return match ? `${'#'.repeat(Number(match[1]))} ` : undefined;
};

const rewriteUnlockedDemoBlock = (node: Element): string => {
  const text = NodeApi.string(node).replaceAll(/\s+/g, ' ').trim();
  const heading = headingPrefix(node);

  if (heading) {
    return `${heading}${text || 'Updated section'}`;
  }

  if (!text) return '';

  const prefix = node.listStyleType ? '- ' : '';
  const rewritten = text.startsWith('Updated:')
    ? text
    : `Updated: ${text.charAt(0).toLowerCase()}${text.slice(1)}`;

  return `${prefix}${rewritten}`;
};

const buildLockedEditMarkdown = (ctx: AIChatRequestContext): string => {
  const lockedByPath = new Map(
    (ctx.refs.lockedBlocks ?? []).map(({ path, ref }) => [path.join(','), ref])
  );
  const entries = resolveSelectedSiblingEntries(ctx);
  const parts: string[] = [];

  for (const [node, path] of entries) {
    const ref = lockedByPath.get(path.join(','));

    if (ref) {
      parts.push(`<${LOCKED_BLOCK_PLACEHOLDER_TAG} ref="${ref}" />`);
      continue;
    }

    const rewritten = rewriteUnlockedDemoBlock(node);

    if (rewritten) parts.push(rewritten);
  }

  return parts.join('\n\n');
};

const demoScenarios: Record<
  | 'comment'
  | 'continue-writing'
  | 'locked-edit'
  | 'markdown'
  | 'table'
  | 'text',
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
  'locked-edit': {
    chosenTool: 'edit',
    rules: (ctx) => textRules(buildLockedEditMarkdown(ctx), 15),
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
  const manyCells = hasMultiCellTableSelection(ctx);
  const hasLockedMix = !manyCells && hasEditableLockedSelection(ctx);

  if (ctx.toolName === 'comment') return 'comment';
  if (ctx.toolName === 'edit') {
    if (manyCells) return 'table';
    return hasLockedMix ? 'locked-edit' : 'text';
  }
  if (text === 'Generate a markdown sample') return 'markdown';
  if (
    text?.includes('Continue writing AFTER <Block>') ||
    text?.includes('Start writing a new paragraph AFTER <Document>')
  ) {
    return 'continue-writing';
  }
  if (!ctx.toolName && text?.includes('comment')) return 'comment';
  if (!ctx.toolName && manyCells) return 'table';
  if (
    !ctx.toolName &&
    hasLockedMix &&
    !/\b(summarize|explain|describe)\b/i.test(text ?? '')
  ) {
    return 'locked-edit';
  }

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

// remark-stringify writes a trailing space as a hex character reference, &#x20;.
const quotedContextEndsWithSpace = (prompt: string) => {
  const quoted = prompt.split('"""');
  const context = (quoted.length > 2 && quoted.at(-2)?.trimEnd()) || prompt;
  const reference = /&#x([\da-f]+);$/i.exec(context);
  const last = reference
    ? String.fromCodePoint(Number.parseInt(reference[1], 16))
    : context.at(-1);

  return /\s/.test(last ?? '');
};

export function copilotDemoConfig({
  prompt = '',
}: {
  prompt?: string;
}): AiSeedConfig {
  let hash = 0;
  for (const char of prompt) {
    hash = (hash * 31 + char.charCodeAt(0)) % 2_147_483_647;
  }
  const completion = copilotCompletions[hash % copilotCompletions.length];

  return {
    rules: [
      {
        id: 'completion',
        match: { stream: false },
        reply: [
          {
            text: quotedContextEndsWithSpace(prompt)
              ? completion.trimStart()
              : completion,
            type: 'text',
          },
        ],
      },
    ],
    strict: true,
  };
}
