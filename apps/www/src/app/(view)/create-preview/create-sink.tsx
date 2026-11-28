'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';
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
import {
  BOARD_VALUE,
  CALLOUT_DETAILS_VALUE,
  CODE_VALUE,
  COLUMN_TOC_VALUE,
  DOC_VALUE,
  FOOTNOTE_VALUE,
  INK_VALUE,
  LINT_VALUE,
  MATH_VALUE,
  MEDIA_VALUE,
  SUGGESTION_VALUE,
  TABLE_VALUE,
} from '@/components/sink/sink-values';

import {
  EmojiPickerCard,
  LinkFloatingCard,
  SelectEditorCard,
  TablePickerCard,
} from './create-sink-cards';
import type { CreateSinkKit, SinkEmojiPick } from './create-sink-types';

export type { CreateSinkKit } from './create-sink-types';

export function CreateSink({ kit }: { kit: CreateSinkKit }) {
  const {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    boardPlugins,
    Button,
    calloutDetailsPlugins,
    codePlugins,
    columnTocPlugins,
    docPlugins,
    Editor,
    FixedToolbar,
    footnotePlugins,
    inkPlugins,
    lintPlugins,
    mathPlugins,
    mediaPlugins,
    suggestionPlugins,
    tablePlugins,
    Toolbar,
    TooltipProvider,
  } = kit;

  const [published, setPublished] = React.useState(false);

  const docEditor = useCreateEditor({
    initialValue: DOC_VALUE,
    plugins: [...docPlugins],
    userId: 'alice',
  });
  const codeEditor = useCreateEditor({
    initialValue: CODE_VALUE,
    plugins: [...codePlugins],
  });
  const mathEditor = useCreateEditor({
    initialValue: MATH_VALUE,
    plugins: [...mathPlugins],
  });
  const calloutDetailsEditor = useCreateEditor({
    initialValue: CALLOUT_DETAILS_VALUE,
    plugins: [...calloutDetailsPlugins],
  });
  const footnoteEditor = useCreateEditor({
    initialValue: FOOTNOTE_VALUE,
    plugins: [...footnotePlugins],
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
  const tableEditor = useCreateEditor({
    initialValue: TABLE_VALUE,
    plugins: [...tablePlugins],
  });
  const columnTocEditor = useCreateEditor({
    initialValue: COLUMN_TOC_VALUE,
    plugins: [...columnTocPlugins],
  });
  const mediaEditor = useCreateEditor({
    initialValue: MEDIA_VALUE,
    plugins: [...mediaPlugins],
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

  const handlePickEmoji = React.useCallback(
    (pick: SinkEmojiPick) => {
      appendParagraph(`${pick.emoji} ${pick.label}`);
    },
    [appendParagraph]
  );

  const handleInsertLink = React.useCallback(
    (url: string, text: string) => {
      docEditor.update.nodes.insert(
        {
          children: [
            { text: 'Reference: ' },
            { children: [{ text }], type: 'link', url },
          ],
          type: 'paragraph',
        },
        { at: [docEditor.read.children().length] }
      );
    },
    [docEditor]
  );

  const handleInsertTable = React.useCallback(
    (rowCount: number, colCount: number) => {
      docEditor
        .plugin(TablePlugin)
        .update.insert(
          { columns: colCount, header: true, rows: rowCount },
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
        className="min-h-screen bg-muted/40 p-4 pb-20 sm:p-5 sm:pb-20 dark:bg-background"
        data-slot="create-sink"
      >
        <EditorRoot editor={docEditor}>
          <div className="mx-auto flex max-w-[1520px] flex-col gap-4">
            <div
              className="cn-card gap-0 overflow-hidden bg-card py-0 text-card-foreground"
              data-slot="card"
            >
              <FixedToolbar className="rounded-none border-b-0 bg-transparent px-1.5 py-1">
                <SinkFixedToolbarButtons kit={kit} />
              </FixedToolbar>
            </div>

            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-4">
                <section
                  className="cn-card flex flex-col gap-0 overflow-hidden bg-card py-0 text-card-foreground"
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
                  className="cn-card gap-0 overflow-hidden bg-card p-2 text-card-foreground"
                  data-slot="card"
                >
                  <EditorRoot editor={codeEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs [&_pre]:my-0"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <section
                  className="cn-card flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground"
                  data-slot="card"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Math &amp; LaTeX</span>
                    <span className="text-muted-foreground">Click to edit</span>
                  </div>
                  <EditorRoot editor={mathEditor}>
                    <Editor
                      className="min-h-0 px-0 py-0 text-sm"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <section
                  className="cn-card flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground"
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

                <section
                  className="cn-card flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground"
                  data-slot="card"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">Media &amp; caption</span>
                    <span className="text-muted-foreground">MediaKit</span>
                  </div>
                  <EditorRoot editor={mediaEditor}>
                    <Editor
                      className="min-h-0 px-0 py-0 text-sm"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <LintCard kit={kit} lintEditor={lintEditor} />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <Toolbar className="no-scrollbar max-w-full overflow-x-auto rounded-lg border bg-popover p-1 whitespace-nowrap shadow-md">
                    <SinkFloatingToolbarButtons kit={kit} />
                  </Toolbar>
                </div>

                <section
                  className="cn-card flex flex-col gap-2 bg-card p-4 text-card-foreground"
                  data-slot="card"
                >
                  <div className="text-xs font-medium">Footnotes</div>
                  <EditorRoot editor={footnoteEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-1 text-sm"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <InkMarkupCard inkEditor={inkEditor} kit={kit} />

                <AIAssistantCard kit={kit} onInsert={appendParagraph} />

                <SlashCommandCard kit={kit} onPickCommand={handlePickCommand} />

                <EmojiPickerCard kit={kit} onPickEmoji={handlePickEmoji} />

                <FindReplaceCard kit={kit} />

                <TablePickerCard onInsertTable={handleInsertTable} />
              </div>

              <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
                <ReviewCard kit={kit} suggestionEditor={suggestionEditor} />

                <BoardCard boardEditor={boardEditor} kit={kit} />

                <BlockMenuCard kit={kit} />

                <LinkFloatingCard kit={kit} onInsertLink={handleInsertLink} />

                <section
                  className="cn-card gap-0 overflow-hidden bg-card px-3 py-2 text-card-foreground"
                  data-slot="card"
                >
                  <EditorRoot editor={tableEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-xs"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <section
                  className="cn-card flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground"
                  data-slot="card"
                >
                  <div className="text-xs font-medium">
                    Outline &amp; columns
                  </div>
                  <EditorRoot editor={columnTocEditor} readOnly>
                    <Editor
                      className="min-h-0 px-0 py-0 text-sm [&_h2]:mt-0 [&_h2]:text-base [&_h3]:mt-0 [&_h3]:text-sm"
                      variant="none"
                    />
                  </EditorRoot>
                </section>

                <MarkdownOutputCard kit={kit} />

                <SelectEditorCard kit={kit} />
              </div>
            </div>
          </div>
        </EditorRoot>
      </div>
    </TooltipProvider>
  );
}
