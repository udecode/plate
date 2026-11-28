'use client';

import { type EditorReference, NodeApi } from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import type { InkLine, InkSample } from 'platejs/ink';
import { InkPlugin } from 'platejs/ink/react';
import { BaseLintPlugin } from 'platejs/lint';
import { MarkdownPlugin } from 'platejs/markdown';
import {
  BoldPlugin,
  CodePlugin,
  type Editor,
  EditorRoot,
  FontBackgroundColorPlugin,
  FontColorPlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  useEditor,
  useEditorSelector,
  useViewStore,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { getInkBrushPrefs } from '@/registry/components/editor/draw-toolbar-button';
import { useLintFindings } from '@/registry/components/editor/lint';

import type { SinkKit } from './sink-types';
import {
  AI_QUICK_PROMPTS,
  INITIAL_AI_DRAFT,
  INK_BLOCK_ID,
  SLASH_COMMANDS,
  TURN_INTO_OPTIONS,
} from './sink-values';

const PEN_BRUSH = { color: '#dc2626', opacity: 1, size: 2.5 } as const;
const HIGHLIGHTER_BRUSH = {
  color: '#facc15',
  opacity: 0.42,
  size: 16,
} as const;
const UNDERLINE_BRUSH = { color: '#2563eb', opacity: 1, size: 2.5 } as const;

export function SinkFixedToolbarButtons({ kit }: { kit: SinkKit }) {
  const {
    AIToolbarButton,
    AlignToolbarButton,
    BulletedListToolbarButton,
    CommentToolbarButton,
    defaultColors,
    FontColorToolbarButton,
    FontSizeToolbarButton,
    Icon,
    InsertToolbarButton,
    LinkToolbarButton,
    MarkToolbarButton,
    ModeToolbarButton,
    RedoToolbarButton,
    TableToolbarButton,
    TodoListToolbarButton,
    ToolbarGroup,
    TurnIntoToolbarButton,
    UndoToolbarButton,
  } = kit;

  return (
    <div className="flex w-max min-w-full shrink-0 items-center">
      <ToolbarGroup>
        <UndoToolbarButton />
        <RedoToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <AIToolbarButton tooltip="AI commands">
          <Icon name="wandSparkles" />
        </AIToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <InsertToolbarButton />
        <TurnIntoToolbarButton />
        <FontSizeToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
          <Icon name="bold" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
          <Icon name="italic" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
          <Icon name="underline" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={StrikethroughPlugin} tooltip="Strikethrough">
          <Icon name="strikethrough" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
          <Icon name="code" />
        </MarkToolbarButton>
        <FontColorToolbarButton
          colors={defaultColors}
          plugin={FontColorPlugin}
          tooltip="Text color"
        >
          <Icon name="baseline" />
        </FontColorToolbarButton>
        <FontColorToolbarButton
          colors={defaultColors}
          plugin={FontBackgroundColorPlugin}
          tooltip="Background color"
        >
          <Icon name="paintBucket" />
        </FontColorToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <AlignToolbarButton />
        <BulletedListToolbarButton />
        <TodoListToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkToolbarButton />
        <TableToolbarButton />
      </ToolbarGroup>

      <div className="grow" />

      <ToolbarGroup>
        <MarkToolbarButton plugin={HighlightPlugin} tooltip="Highlight">
          <Icon name="highlighter" />
        </MarkToolbarButton>
        <CommentToolbarButton />
      </ToolbarGroup>

      <ToolbarGroup>
        <ModeToolbarButton />
      </ToolbarGroup>
    </div>
  );
}

export function SinkFloatingToolbarButtons({ kit }: { kit: SinkKit }) {
  const {
    AIToolbarButton,
    CommentToolbarButton,
    Icon,
    LinkToolbarButton,
    MarkToolbarButton,
    ToolbarGroup,
  } = kit;

  return (
    <>
      <ToolbarGroup>
        <AIToolbarButton tooltip="AI commands">
          <Icon name="wandSparkles" />
          Ask AI
        </AIToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
          <Icon name="bold" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic">
          <Icon name="italic" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline">
          <Icon name="underline" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={StrikethroughPlugin} tooltip="Strikethrough">
          <Icon name="strikethrough" />
        </MarkToolbarButton>
        <MarkToolbarButton plugin={CodePlugin} tooltip="Code">
          <Icon name="code" />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarGroup>
        <LinkToolbarButton />
        <CommentToolbarButton />
      </ToolbarGroup>
    </>
  );
}

export function ExpandFirstDetails() {
  const editor = useEditor();

  React.useEffect(() => {
    const firstDetails = editor.read
      .children()
      .find((node) => 'type' in node && node.type === 'details');

    if (!firstDetails) return;

    const detailsKey = editor.key(firstDetails);

    if (detailsKey !== undefined) {
      editor.plugin(BaseDetailsPlugin).api.setOpen(detailsKey, true);
    }
  }, [editor]);

  return null;
}

function findTextNodeAt(root: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let seen = 0;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.textContent?.length ?? 0;

    if (offset <= seen + length) {
      return { node, offset: offset - seen };
    }
    seen += length;
  }

  return null;
}

function measurePhraseRect(
  root: HTMLElement,
  blockRect: DOMRect,
  start: number,
  end: number
) {
  const from = findTextNodeAt(root, start);
  const to = findTextNodeAt(root, end);

  if (!from || !to) return null;

  const range = document.createRange();

  range.setStart(from.node, from.offset);
  range.setEnd(to.node, to.offset);
  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0
  );

  if (rects.length === 0) return null;

  const first = rects[0];

  return {
    height: first.height,
    left: first.left - blockRect.left,
    top: first.top - blockRect.top,
    width: first.width,
  };
}

function measureTextLines(
  root: HTMLElement,
  blockRect: DOMRect,
  text: string
): InkLine[] {
  const lines: InkLine[] = [];
  let current: {
    bottom: number;
    end: number;
    left: number;
    right: number;
    top: number;
  } | null = null;

  for (let i = 0; i < text.length; i += 1) {
    const box = measurePhraseRect(root, blockRect, i, i + 1);

    if (!box) continue;

    if (current && Math.abs(box.top - current.top) <= 4) {
      current.end = i + 1;
      current.left = Math.min(current.left, box.left);
      current.right = Math.max(current.right, box.left + box.width);
      current.top = Math.min(current.top, box.top);
      current.bottom = Math.max(current.bottom, box.top + box.height);
    } else {
      if (current) {
        lines.push({
          end: current.end,
          height: current.bottom - current.top,
          left: current.left,
          top: current.top,
          width: current.right - current.left,
        });
      }
      current = {
        bottom: box.top + box.height,
        end: i + 1,
        left: box.left,
        right: box.left + box.width,
        top: box.top,
      };
    }
  }

  if (current) {
    lines.push({
      end: text.length,
      height: current.bottom - current.top,
      left: current.left,
      top: current.top,
      width: current.right - current.left,
    });
  }

  return lines;
}

function seedDemoInkMarks(editor: Editor) {
  const ink = editor.plugin(InkPlugin);

  if (ink.read.marks().length > 0) return;

  const firstBlock = editor.read.children()[0];

  if (!firstBlock) return;

  const key = editor.key(firstBlock);

  if (key === undefined) return;

  const blockEl = editor.api.dom.resolveDOMNode(key);

  if (!(blockEl instanceof HTMLElement)) return;

  const blockRect = blockEl.getBoundingClientRect();

  if (blockRect.width <= 0 || blockRect.height <= 0) return;

  const text = NodeApi.string(firstBlock);
  const lines = measureTextLines(blockEl, blockRect, text);

  if (lines.length === 0) return;

  const addStroke = (
    phrase: string,
    brush: { color: string; opacity: number; size: number },
    makeSamples: (box: {
      height: number;
      left: number;
      top: number;
      width: number;
    }) => InkSample[]
  ) => {
    const start = text.indexOf(phrase);

    if (start === -1) return;

    const end = start + phrase.length;
    const box = measurePhraseRect(blockEl, blockRect, start, end);

    if (!box) return;

    ink.update.add({
      at: Date.now(),
      blocks: [
        {
          block: INK_BLOCK_ID,
          height: blockRect.height,
          left: 0,
          lines,
          runs: [{ end, left: box.left, start, width: box.width }],
          text,
          top: 0,
          width: blockRect.width,
        },
      ],
      brush,
      direction: 'ltr',
      samples: makeSamples(box),
    });
  };

  addStroke('key words', PEN_BRUSH, (box) => {
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const rx = box.width / 2 + 3;
    const ry = box.height / 2 + 2;
    const steps = 20;

    return Array.from({ length: steps + 1 }, (_, i) => {
      const angle = (i / steps) * Math.PI * 2.08 - 0.35;

      return [
        cx + Math.cos(angle) * rx,
        cy + Math.sin(angle) * ry,
        0.55,
        i * 12,
      ] as InkSample;
    });
  });

  addStroke('highlight a phrase', HIGHLIGHTER_BRUSH, (box) => {
    const y = box.top + box.height * 0.54;
    const steps = 8;

    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;

      return [
        box.left - 2 + t * (box.width + 4),
        y + Math.sin(t * Math.PI) * 0.8,
        0.7,
        i * 16,
      ] as InkSample;
    });
  });

  addStroke('stays attached', UNDERLINE_BRUSH, (box) => {
    const y = box.top + box.height + 1.5;
    const steps = 10;

    return Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;

      return [
        box.left + t * box.width,
        y + Math.sin(t * Math.PI) * 1.4,
        0.6,
        i * 14,
      ] as InkSample;
    });
  });
}

function InkMarkupInner({ kit }: { kit: SinkKit }) {
  const { Button, Editor, surface } = kit;
  const editor = useEditor();
  const tool = useViewStore(InkPlugin, (state) => state.tool);

  React.useEffect(() => {
    editor
      .plugin(InkPlugin)
      .api.setTool({ brush: getInkBrushPrefs(editor).pen, type: 'draw' });

    const frame = window.requestAnimationFrame(() => seedDemoInkMarks(editor));

    return () => window.cancelAnimationFrame(frame);
  }, [editor]);

  const resetMarks = () => {
    const ink = editor.plugin(InkPlugin);
    const ids = ink.read.marks().map((mark) => mark.id);

    if (ids.length > 0) ink.update.remove(ids);
    window.requestAnimationFrame(() => seedDemoInkMarks(editor));
  };

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-2.5 overflow-hidden bg-card p-3 text-card-foreground'
      )}
      data-slot="sink-ink-markup"
    >
      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <span className="font-medium">Pen markup</span>
        <div className="flex items-center gap-1">
          {!tool && (
            <Button
              onClick={() =>
                editor.plugin(InkPlugin).api.setTool({
                  brush: getInkBrushPrefs(editor).pen,
                  type: 'draw',
                })
              }
              size="xs"
              type="button"
              variant="secondary"
            >
              Draw
            </Button>
          )}
          <Button onClick={resetMarks} size="xs" type="button" variant="ghost">
            Reset
          </Button>
        </div>
      </div>

      <div className="relative flex min-h-40 flex-col justify-between rounded-lg border bg-background/60 px-1.5 pt-3 pb-2 [&_[data-ink-digitize-ui]]:static [&_[data-ink-digitize-ui]]:mt-3 [&_[data-ink-digitize-ui]]:h-auto [&_[data-ink-digitize-ui]]:px-0 [&_[data-ink-dock]]:gap-0.5 [&_[data-ink-dock]]:px-1.5 [&_[data-ink-dock]_.gap-1\.5]:gap-1 [&_[data-ink-dock]_.size-5]:size-4 [&_[data-ink-dock]_.size-8]:size-7 [&_[data-ink-dock]_.sm\:w-\[13\.5rem\]]:w-auto">
        <Editor
          className="min-h-0 px-2 py-0 text-sm leading-relaxed"
          variant="none"
        />
      </div>
    </section>
  );
}

export function InkMarkupCard({
  inkEditor,
  kit,
}: {
  inkEditor: EditorReference;
  kit: SinkKit;
}) {
  return (
    <EditorRoot editor={inkEditor}>
      <InkMarkupInner kit={kit} />
    </EditorRoot>
  );
}

function LintCardInner({ kit }: { kit: SinkKit }) {
  const { Button, Editor, surface } = kit;
  const editor = useEditor();
  const findings = useLintFindings();
  const firstFixable = findings.find((finding) => finding.fixes.length > 0);

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-2.5 overflow-hidden bg-card p-4 text-card-foreground'
      )}
      data-slot="sink-lint"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">Prose linter</span>
          <span className={cn(surface.badge, surface.badgeSecondary)}>
            {findings.length === 1 ? '1 issue' : `${findings.length} issues`}
          </span>
        </div>
        <Button
          disabled={!firstFixable}
          onClick={() => {
            if (firstFixable) {
              editor.plugin(BaseLintPlugin).update.fix(firstFixable.id);
            }
          }}
          size="xs"
          type="button"
          variant="secondary"
        >
          Fix next
        </Button>
      </div>
      <Editor
        className="min-h-0 px-0 py-0 text-sm leading-relaxed"
        variant="none"
      />
    </section>
  );
}

export function LintCard({
  kit,
  lintEditor,
}: {
  kit: SinkKit;
  lintEditor: EditorReference;
}) {
  return (
    <EditorRoot editor={lintEditor}>
      <LintCardInner kit={kit} />
    </EditorRoot>
  );
}

export function BoardCard({
  boardEditor,
  kit,
}: {
  boardEditor: EditorReference;
  kit: SinkKit;
}) {
  const { Editor, surface } = kit;

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-2 overflow-hidden bg-card p-3 text-card-foreground'
      )}
      data-slot="sink-board"
    >
      <div className="flex items-center justify-between px-1 text-xs">
        <span className="font-medium">Whiteboard</span>
        <span className="text-muted-foreground">BoardKit</span>
      </div>
      <EditorRoot editor={boardEditor}>
        <Editor
          className="min-h-0 px-0 py-0 text-sm [&_.my-4]:my-0"
          variant="none"
        />
      </EditorRoot>
    </section>
  );
}

export function SlashCommandCard({
  kit,
  onPickCommand,
}: {
  kit: SinkKit;
  onPickCommand: (label: string) => void;
}) {
  const {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
    Icon,
    surface,
  } = kit;

  return (
    <div
      className={cn(
        surface.popover,
        'overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-sm'
      )}
      data-menu-translucent=""
      data-slot="sink-slash-menu"
    >
      <Command className="bg-transparent">
        <CommandInput placeholder="Filter slash commands..." />
        <CommandList className="max-h-none">
          <CommandEmpty>No matching commands.</CommandEmpty>
          <CommandGroup heading="Insert block">
            {SLASH_COMMANDS.map((item) => (
              <CommandItem
                key={item.label}
                onSelect={() => onPickCommand(item.label)}
                value={item.label}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export function AIAssistantCard({
  kit,
  onInsert,
}: {
  kit: SinkKit;
  onInsert: (text: string) => void;
}) {
  const { Button, Icon, Input, surface } = kit;
  const [prompt, setPrompt] = React.useState('');
  const [draft, setDraft] = React.useState(INITIAL_AI_DRAFT);
  const [status, setStatus] = React.useState<'accepted' | 'ready'>('ready');

  const submitPrompt = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setDraft(trimmed);
    setStatus('ready');
    setPrompt('');
  };

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-3 bg-card p-4 text-card-foreground'
      )}
      data-slot="card"
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <Icon className="size-3.5 text-primary" name="sparkles" />
        <span>Rewrite concisely</span>
        <span
          className={cn(
            surface.badge,
            'ms-auto inline-flex items-center',
            status === 'accepted'
              ? surface.badgeDefault
              : surface.badgeSecondary
          )}
        >
          {status === 'accepted' ? 'Applied' : 'Ready'}
        </span>
      </div>

      <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm leading-relaxed text-foreground">
        {draft}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {AI_QUICK_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            className={cn(
              surface.badge,
              surface.badgeOutline,
              'cursor-pointer hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => {
              setDraft(preset.draft);
              setStatus('ready');
            }}
            type="button"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          onClick={() => {
            onInsert(draft);
            setStatus('accepted');
          }}
          size="sm"
          type="button"
          variant="default"
        >
          <Icon className="size-3.5" name="check" />
          Accept
        </Button>
        <Button
          onClick={() => onInsert(draft)}
          size="sm"
          type="button"
          variant="outline"
        >
          <Icon className="size-3.5" name="penLine" />
          Insert below
        </Button>
        <Button
          onClick={() => {
            setDraft(INITIAL_AI_DRAFT);
            setStatus('ready');
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Discard
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          aria-label="Ask AI prompt"
          className="h-8 text-sm"
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitPrompt();
            }
          }}
          placeholder="Ask AI anything..."
          type="text"
          value={prompt}
        />
        <Button
          onClick={submitPrompt}
          size="sm"
          type="button"
          variant="default"
        >
          Run
        </Button>
      </div>
    </section>
  );
}

export function FindReplaceCard({ kit }: { kit: SinkKit }) {
  const { Button, Input, surface, Toggle } = kit;
  const [query, setQuery] = React.useState('Plate');
  const [replaceText, setReplaceText] = React.useState('Plate v2');
  const [matchCase, setMatchCase] = React.useState(false);

  const documentText = useEditorSelector(
    (editor) =>
      editor.read
        .children()
        .map((node) => NodeApi.string(node))
        .join('\n'),
    { dependsOn: 'document' }
  );
  const matchCount = React.useMemo(() => {
    if (!query.trim()) return 0;

    const haystack = matchCase ? documentText : documentText.toLowerCase();
    const needle = matchCase ? query : query.toLowerCase();

    return haystack.split(needle).length - 1;
  }, [documentText, matchCase, query]);

  return (
    <div
      className={cn(
        surface.popover,
        'flex flex-col gap-2 rounded-xl border bg-popover p-3 text-popover-foreground shadow-sm'
      )}
      data-menu-translucent=""
      data-slot="sink-find-replace"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Find &amp; replace</span>
        <span className="font-mono text-xs text-muted-foreground">
          {matchCount} {matchCount === 1 ? 'match' : 'matches'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          aria-label="Find in editor"
          className="h-8 text-xs"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Find..."
          value={query}
        />
        <Toggle
          aria-label="Match case"
          onPressedChange={setMatchCase}
          pressed={matchCase}
          size="sm"
          variant="outline"
        >
          Aa
        </Toggle>
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          aria-label="Replace with"
          className="h-8 text-xs"
          onChange={(event) => setReplaceText(event.target.value)}
          placeholder="Replace with..."
          value={replaceText}
        />
        <Button size="xs" type="button" variant="secondary">
          Replace
        </Button>
      </div>
    </div>
  );
}

export function BlockMenuCard({ kit }: { kit: SinkKit }) {
  const { Icon, surface } = kit;
  const [selectedBlock, setSelectedBlock] = React.useState('Heading 1');

  return (
    <div
      className="grid grid-cols-1 gap-2 sm:grid-cols-[1.05fr_0.95fr]"
      data-slot="sink-block-menu"
    >
      <div
        className={cn(surface.menuContent, 'flex flex-col gap-0.5')}
        data-menu-translucent=""
      >
        <div
          className={cn(
            surface.menuItem,
            'flex items-center bg-accent text-accent-foreground'
          )}
        >
          <Icon className="size-4" name="wand" />
          <span>Ask AI</span>
        </div>
        <div className={cn(surface.menuSubTrigger, 'flex items-center')}>
          <Icon className="size-4" name="pilcrow" />
          <span>Turn into</span>
          <Icon className="ms-auto size-4 rtl:rotate-180" name="chevronRight" />
        </div>
        <div className={cn(surface.menuItem, 'flex items-center')}>
          <Icon className="size-4" name="listPlus" />
          <span>Duplicate</span>
          <span className={surface.menuShortcut}>⌘D</span>
        </div>
        <div className={surface.menuSeparator} />
        <div
          className={cn(surface.menuItem, 'flex items-center text-destructive')}
          data-variant="destructive"
        >
          <Icon className="size-4" name="x" />
          <span>Delete</span>
          <span className={surface.menuShortcut}>⌫</span>
        </div>
      </div>

      <div
        className={cn(
          surface.menuSubContent,
          'flex flex-col gap-0.5 self-start'
        )}
        data-menu-translucent=""
      >
        <div className={surface.menuLabel}>Turn into</div>
        {TURN_INTO_OPTIONS.map((option) => {
          const active = selectedBlock === option.label;
          return (
            <button
              key={option.label}
              className={cn(
                surface.menuItem,
                'flex w-full items-center text-start',
                active && 'bg-accent text-accent-foreground'
              )}
              onClick={() => setSelectedBlock(option.label)}
              type="button"
            >
              <Icon className="size-4" name={option.icon} />
              <span>{option.label}</span>
              {active && <Icon className="ms-auto size-3.5" name="check" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ReviewCard({
  kit,
  suggestionEditor,
}: {
  kit: SinkKit;
  suggestionEditor: EditorReference;
}) {
  const {
    Avatar,
    AvatarFallback,
    Button,
    Editor,
    Icon,
    Input,
    Separator,
    surface,
  } = kit;
  const [decision, setDecision] = React.useState<
    'accepted' | 'pending' | 'rejected'
  >('pending');
  const [replyText, setReplyText] = React.useState('');
  const [replies, setReplies] = React.useState<string[]>([]);

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setReplies((prev) => [...prev, trimmed]);
    setReplyText('');
  };

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-3 bg-card p-4 text-card-foreground'
      )}
      data-slot="card"
    >
      <EditorRoot editor={suggestionEditor} readOnly>
        <Editor className="min-h-0 px-0 py-0 text-sm" variant="none" />
      </EditorRoot>

      <Separator />

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
              BL
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-foreground">Bob Lee</span>
              <span className="text-muted-foreground">2m ago</span>
            </div>
          </div>
          {decision === 'pending' ? (
            <div className="flex items-center gap-1">
              <Button
                aria-label="Accept suggestion"
                onClick={() => setDecision('accepted')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Icon className="size-3.5" name="check" />
              </Button>
              <Button
                aria-label="Reject suggestion"
                onClick={() => setDecision('rejected')}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <Icon className="size-3.5" name="x" />
              </Button>
            </div>
          ) : (
            <button
              className={cn(
                surface.badge,
                'cursor-pointer',
                decision === 'accepted'
                  ? surface.badgeDefault
                  : surface.badgeSecondary
              )}
              onClick={() => setDecision('pending')}
              type="button"
            >
              {decision === 'accepted' ? 'Accepted' : 'Rejected'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-sm bg-editor-delete/15 px-1.5 py-0.5 text-editor-delete line-through">
            legacy
          </span>
          <span className="text-muted-foreground">to</span>
          <span className="rounded-sm bg-editor-insert/15 px-1.5 py-0.5 text-editor-insert">
            composable
          </span>
        </div>

        {replies.map((reply, index) => (
          <div
            key={`${reply}-${index}`}
            className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-foreground"
          >
            <span className="font-medium">You: </span>
            {reply}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Input
            aria-label="Reply to thread"
            className="h-8 text-xs"
            onChange={(event) => setReplyText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitReply();
              }
            }}
            placeholder="Reply..."
            type="text"
            value={replyText}
          />
          <Button
            onClick={submitReply}
            size="xs"
            type="button"
            variant="default"
          >
            Reply
          </Button>
        </div>
      </div>
    </section>
  );
}

export function MarkdownOutputCard({ kit }: { kit: SinkKit }) {
  const { Button, Icon, surface } = kit;
  const [copied, setCopied] = React.useState(false);
  const { blockCount, markdown } = useEditorSelector(
    (editor) => {
      const result = editor.plugin(MarkdownPlugin).api.serialize();

      return {
        blockCount: editor.read.children().length,
        markdown: result.ok ? result.data : '',
      };
    },
    {
      dependsOn: 'document',
      equalityFn: (prev, next) =>
        prev.blockCount === next.blockCount && prev.markdown === next.markdown,
    }
  );

  const handleCopy = () => {
    void navigator.clipboard?.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className={cn(
        surface.card,
        'flex flex-col gap-2.5 bg-card p-4 text-card-foreground'
      )}
      data-slot="card"
    >
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium">Live Markdown</span>
          <span className={cn(surface.badge, surface.badgeSecondary)}>
            {blockCount} blocks
          </span>
        </div>
        <Button onClick={handleCopy} size="xs" type="button" variant="ghost">
          <Icon className="size-3.5" name={copied ? 'check' : 'copy'} />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre
        className="max-h-56 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground"
        data-slot="sink-markdown"
      >
        {markdown}
      </pre>
    </section>
  );
}
