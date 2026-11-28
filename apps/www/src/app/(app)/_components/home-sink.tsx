'use client';

import {
  BaselineIcon,
  BoldIcon,
  CheckIcon,
  ChevronRightIcon,
  Code2Icon,
  CopyIcon,
  Heading1Icon,
  HighlighterIcon,
  ItalicIcon,
  LightbulbIcon,
  ListIcon,
  ListPlusIcon,
  PaintBucketIcon,
  PenLineIcon,
  PilcrowIcon,
  QuoteIcon,
  RadicalIcon,
  SparklesIcon,
  StrikethroughIcon,
  TableIcon,
  UnderlineIcon,
  WandIcon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import {
  AIAssistantCard,
  BlockMenuCard,
  BoardCard,
  ExpandFirstDetails,
  FindReplaceCard,
  InkMarkupCard,
  LintCard,
  MarkdownOutputCard,
  ReviewCard,
  SinkFixedToolbarButtons,
  SinkFloatingToolbarButtons,
  SlashCommandCard,
} from '@/components/sink/sink-cards';
import type {
  SinkIconName,
  SinkKit,
  SinkSurface,
} from '@/components/sink/sink-types';
import {
  BOARD_VALUE,
  CALLOUT_DETAILS_VALUE,
  CODE_VALUE,
  DOC_VALUE,
  FOOTNOTE_VALUE,
  INK_VALUE,
  LINT_VALUE,
  MATH_VALUE,
  SUGGESTION_VALUE,
  TABLE_VALUE,
} from '@/components/sink/sink-values';
import { Avatar, AvatarFallback, AvatarGroup } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AIToolbarButton } from '@/registry/components/editor/ai-toolbar-button';
import { AlignToolbarButton } from '@/registry/components/editor/align-toolbar-button';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import { BoardKit } from '@/registry/components/editor/board';
import { CalloutKit } from '@/registry/components/editor/callout';
import { BaseCodeBlockKit } from '@/registry/components/editor/code-block-static';
import { CommentToolbarButton } from '@/registry/components/editor/comment-toolbar-button';
import { DetailsKit } from '@/registry/components/editor/details';
import { DiscussionKit } from '@/registry/components/editor/discussion';
import { Editor } from '@/registry/components/editor/editor';
import { EditorStatic } from '@/registry/components/editor/editor-static';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';
import {
  DEFAULT_COLORS,
  FontColorToolbarButton,
} from '@/registry/components/editor/font-color-toolbar-button';
import { FontSizeToolbarButton } from '@/registry/components/editor/font-size-toolbar-button';
import { BaseFootnoteKit } from '@/registry/components/editor/footnote-static';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/registry/components/editor/history-toolbar-button';
import { InkKit } from '@/registry/components/editor/ink';
import { InsertToolbarButton } from '@/registry/components/editor/insert-toolbar-button';
import { LinkToolbarButton } from '@/registry/components/editor/link-toolbar-button';
import { LintKit } from '@/registry/components/editor/lint';
import {
  BulletedListToolbarButton,
  TodoListToolbarButton,
} from '@/registry/components/editor/list-toolbar-button';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';
import { BaseMathKit } from '@/registry/components/editor/math-static';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { SuggestionKit } from '@/registry/components/editor/suggestion';
import { BaseTableKit } from '@/registry/components/editor/table-static';
import { TableToolbarButton } from '@/registry/components/editor/table-toolbar-button';
import { Toolbar, ToolbarGroup } from '@/registry/components/editor/toolbar';
import { TurnIntoToolbarButton } from '@/registry/components/editor/turn-into-toolbar-button';

const HOME_SINK_ICONS: Record<
  SinkIconName,
  React.ComponentType<{ className?: string }>
> = {
  baseline: BaselineIcon,
  bold: BoldIcon,
  check: CheckIcon,
  chevronRight: ChevronRightIcon,
  code: Code2Icon,
  copy: CopyIcon,
  heading1: Heading1Icon,
  highlighter: HighlighterIcon,
  italic: ItalicIcon,
  lightbulb: LightbulbIcon,
  list: ListIcon,
  listPlus: ListPlusIcon,
  paintBucket: PaintBucketIcon,
  penLine: PenLineIcon,
  pilcrow: PilcrowIcon,
  quote: QuoteIcon,
  radical: RadicalIcon,
  sparkles: SparklesIcon,
  strikethrough: StrikethroughIcon,
  table: TableIcon,
  underline: UnderlineIcon,
  wand: WandIcon,
  wandSparkles: WandSparklesIcon,
  x: XIcon,
};

function HomeSinkIcon({
  className,
  name,
}: {
  className?: string;
  name: SinkIconName;
}) {
  const Icon = HOME_SINK_ICONS[name];

  return <Icon className={className} />;
}

const HOME_SINK_SURFACE: SinkSurface = {
  badge:
    'inline-flex h-5 items-center gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all',
  badgeDefault: 'bg-primary text-primary-foreground',
  badgeOutline: 'border-border text-foreground',
  badgeSecondary: 'bg-secondary text-secondary-foreground',
  card: 'overflow-hidden rounded-xl text-sm ring-1 ring-foreground/10',
  menuContent:
    'min-w-32 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',
  menuItem:
    'gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive [&_svg:not([class*="size-"])]:size-4',
  menuLabel: 'px-1.5 py-1 text-xs font-medium text-muted-foreground',
  menuSeparator: '-mx-1 my-1 h-px bg-border',
  menuShortcut: 'ml-auto text-xs tracking-widest text-muted-foreground',
  menuSubContent:
    'min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10',
  menuSubTrigger:
    'gap-1.5 rounded-md px-1.5 py-1 text-sm focus:bg-accent focus:text-accent-foreground [&_svg:not([class*="size-"])]:size-4',
  popover: 'ring-1 ring-foreground/10',
};

const HOME_SINK_KIT: SinkKit = {
  AIToolbarButton,
  AlignToolbarButton,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  boardPlugins: [...BasicBlocksKit, ...BasicMarksKit, ...BoardKit],
  BulletedListToolbarButton,
  Button,
  calloutDetailsPlugins: [...BasicMarksKit, ...CalloutKit, ...DetailsKit],
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommentToolbarButton,
  defaultColors: DEFAULT_COLORS,
  docPlugins: [
    ...EditorKit.filter(
      (plugin) =>
        plugin.name !== 'fixedToolbar' && plugin.name !== 'floatingToolbar'
    ),
    ...DiscussionKit,
    CommentsPlugin,
  ],
  Editor,
  FixedToolbar,
  FontColorToolbarButton,
  FontSizeToolbarButton,
  Icon: HomeSinkIcon,
  inkPlugins: [...BasicMarksKit, ...InkKit],
  Input,
  InsertToolbarButton,
  LinkToolbarButton,
  lintPlugins: [...BasicMarksKit, ...LintKit],
  MarkToolbarButton,
  ModeToolbarButton,
  RedoToolbarButton,
  Separator,
  suggestionPlugins: [...SuggestionKit],
  surface: HOME_SINK_SURFACE,
  TableToolbarButton,
  TodoListToolbarButton,
  Toggle,
  Toolbar,
  ToolbarGroup,
  TooltipProvider,
  TurnIntoToolbarButton,
  UndoToolbarButton,
};

export function HomeSink() {
  const {
    boardPlugins,
    calloutDetailsPlugins,
    docPlugins,
    inkPlugins,
    lintPlugins,
    suggestionPlugins,
    surface,
  } = HOME_SINK_KIT;

  const [published, setPublished] = React.useState(false);

  const docEditor = useCreateEditor({
    initialValue: DOC_VALUE,
    plugins: [...docPlugins],
    userId: 'alice',
  });
  const calloutDetailsEditor = useCreateEditor({
    initialValue: CALLOUT_DETAILS_VALUE,
    plugins: [...calloutDetailsPlugins],
  });
  const inkEditor = useCreateEditor({
    initialValue: INK_VALUE,
    plugins: [...inkPlugins],
    userId: 'alice',
  });
  const lintEditor = useCreateEditor({
    initialValue: LINT_VALUE,
    plugins: [...lintPlugins],
  });
  const boardEditor = useCreateEditor({
    initialValue: BOARD_VALUE,
    plugins: [...boardPlugins],
  });
  const suggestionEditor = useCreateEditor({
    initialValue: SUGGESTION_VALUE,
    plugins: [...suggestionPlugins],
    userId: 'alice',
  });

  const codeStaticEditor = useCreateEditor({
    initialValue: CODE_VALUE,
    plugins: [...BaseCodeBlockKit],
  });
  const footnoteStaticEditor = useCreateEditor({
    initialValue: FOOTNOTE_VALUE,
    plugins: [...BaseBasicMarksKit, ...BaseFootnoteKit],
  });
  const mathStaticEditor = useCreateEditor({
    initialValue: MATH_VALUE,
    plugins: [...BaseBasicMarksKit, ...BaseMathKit],
  });
  const tableStaticEditor = useCreateEditor({
    initialValue: TABLE_VALUE,
    plugins: [...BaseBasicMarksKit, ...BaseTableKit],
  });

  const appendParagraph = React.useCallback(
    (text: string) => {
      docEditor.update.nodes.insert(
        { children: [{ text }], type: 'paragraph' },
        { at: [docEditor.read.children().length] }
      );
    },
    [docEditor]
  );

  const handlePickCommand = React.useCallback(
    (label: string) => {
      if (label === 'Heading 1') {
        docEditor.update.nodes.insert(
          { children: [{ text: 'New section' }], level: 2, type: 'heading' },
          { at: [docEditor.read.children().length] }
        );
        return;
      }

      if (label === 'Callout') {
        docEditor.update.nodes.insert(
          {
            children: [{ text: 'Inserted from the Slash command menu.' }],
            icon: '✨',
            type: 'callout',
            variant: 'info',
          },
          { at: [docEditor.read.children().length] }
        );
        return;
      }

      if (label === 'Equation') {
        docEditor.update.nodes.insert(
          {
            children: [{ text: '' }],
            latex: 'E = mc^2',
            type: 'equation',
          },
          { at: [docEditor.read.children().length] }
        );
        return;
      }

      appendParagraph(`Inserted ${label.toLowerCase()} block.`);
    },
    [appendParagraph, docEditor]
  );

  return (
    <TooltipProvider>
      <div
        className="mx-auto flex max-w-[1520px] flex-col gap-4"
        data-slot="home-sink"
      >
        <EditorRoot editor={docEditor}>
          <div
            className={cn(
              surface.card,
              'gap-0 overflow-hidden bg-card py-0 text-card-foreground'
            )}
            data-slot="card"
          >
            <FixedToolbar className="rounded-none border-b-0 bg-transparent px-1.5 py-1">
              <SinkFixedToolbarButtons kit={HOME_SINK_KIT} />
            </FixedToolbar>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-4">
              <section
                className={cn(
                  surface.card,
                  'flex flex-col gap-0 overflow-hidden bg-card py-0 text-card-foreground'
                )}
                data-slot="card"
              >
                <div className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <AvatarGroup>
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
                          A
                        </AvatarFallback>
                      </Avatar>
                      <Avatar size="sm">
                        <AvatarFallback className="text-xs font-medium">
                          B
                        </AvatarFallback>
                      </Avatar>
                    </AvatarGroup>
                    <span className="truncate text-xs font-medium text-muted-foreground">
                      Q4 Release Spec
                    </span>
                  </div>
                  <Button
                    onClick={() => setPublished((prev) => !prev)}
                    size="xs"
                    type="button"
                    variant={published ? 'secondary' : 'default'}
                  >
                    {published ? 'Published' : 'Publish'}
                  </Button>
                </div>
                <div className="px-5 py-4">
                  <Editor
                    className="min-h-0 px-0 py-0 text-sm [&_h1]:mt-0 [&_h1]:text-xl [&_h1]:font-semibold"
                    variant="none"
                  />
                </div>
              </section>

              <section
                className={cn(
                  surface.card,
                  'gap-0 overflow-hidden bg-card p-2 text-card-foreground'
                )}
                data-slot="card"
              >
                <EditorStatic
                  className="min-h-0 px-0 py-0 text-xs [&_pre]:my-0"
                  editor={codeStaticEditor}
                  variant="none"
                />
              </section>

              <section
                className={cn(
                  surface.card,
                  'flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground'
                )}
                data-slot="card"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Math &amp; LaTeX</span>
                  <span className="text-muted-foreground">KaTeX</span>
                </div>
                <EditorStatic
                  className="min-h-0 px-0 py-0 text-sm"
                  editor={mathStaticEditor}
                  variant="none"
                />
              </section>

              <LintCard kit={HOME_SINK_KIT} lintEditor={lintEditor} />

              <MarkdownOutputCard kit={HOME_SINK_KIT} />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Toolbar className="no-scrollbar max-w-full overflow-x-auto rounded-lg border bg-popover p-1 whitespace-nowrap shadow-md">
                  <SinkFloatingToolbarButtons kit={HOME_SINK_KIT} />
                </Toolbar>
              </div>

              <section
                className={cn(
                  surface.card,
                  'flex flex-col gap-2 bg-card p-4 text-card-foreground'
                )}
                data-slot="card"
              >
                <div className="text-xs font-medium">Footnotes</div>
                <EditorStatic
                  className="min-h-0 px-0 py-1 text-sm"
                  editor={footnoteStaticEditor}
                  variant="none"
                />
              </section>

              <InkMarkupCard inkEditor={inkEditor} kit={HOME_SINK_KIT} />

              <AIAssistantCard kit={HOME_SINK_KIT} onInsert={appendParagraph} />

              <section
                className={cn(
                  surface.card,
                  'flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground'
                )}
                data-slot="card"
              >
                <div className="text-xs font-medium">
                  Callouts &amp; details
                </div>
                <EditorRoot editor={calloutDetailsEditor}>
                  <ExpandFirstDetails />
                  <Editor
                    className="min-h-0 px-0 py-0 text-sm"
                    variant="none"
                  />
                </EditorRoot>
              </section>

              <FindReplaceCard kit={HOME_SINK_KIT} />
            </div>

            <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
              <ReviewCard
                kit={HOME_SINK_KIT}
                suggestionEditor={suggestionEditor}
              />

              <BoardCard boardEditor={boardEditor} kit={HOME_SINK_KIT} />

              <SlashCommandCard
                kit={HOME_SINK_KIT}
                onPickCommand={handlePickCommand}
              />

              <BlockMenuCard kit={HOME_SINK_KIT} />

              <section
                className={cn(
                  surface.card,
                  'gap-0 overflow-hidden bg-card px-3 py-2 text-card-foreground'
                )}
                data-slot="card"
              >
                <EditorStatic
                  className="min-h-0 px-0 py-0 text-xs"
                  editor={tableStaticEditor}
                  variant="none"
                />
              </section>
            </div>
          </div>
        </EditorRoot>
      </div>
    </TooltipProvider>
  );
}
