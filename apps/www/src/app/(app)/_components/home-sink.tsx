'use client';

import './home-sink.css';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import {
  ExpandFirstDetails,
  SinkFixedToolbarButtons,
  SinkFloatingToolbarButtons,
} from '@/app/(view)/create-preview/create-sink';
import { BASE_SINK_KIT } from '@/app/(view)/create-preview/create-sink-base';
import {
  AIAssistantCard,
  BlockMenuCard,
  BoardCard,
  FindReplaceCard,
  InkMarkupCard,
  LintCard,
  MarkdownOutputCard,
  ReviewCard,
  SlashCommandCard,
} from '@/app/(view)/create-preview/create-sink-cards';
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
} from '@/app/(view)/create-preview/create-sink-values';
import { IconLibraryContext } from '@/app/(view)/create-preview/icon-placeholder';
import { BaseBasicMarksKit } from '@/registry/components/editor/basic-marks-static';
import { BaseCodeBlockKit } from '@/registry/components/editor/code-block-static';
import { EditorStatic } from '@/registry/components/editor/editor-static';
import { BaseFootnoteKit } from '@/registry/components/editor/footnote-static';
import { BaseMathKit } from '@/registry/components/editor/math-static';
import { BaseTableKit } from '@/registry/components/editor/table-static';

export function HomeSink() {
  const {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    boardPlugins,
    Button,
    calloutDetailsPlugins,
    docPlugins,
    Editor,
    FixedToolbar,
    inkPlugins,
    lintPlugins,
    suggestionPlugins,
    Toolbar,
    TooltipProvider,
  } = BASE_SINK_KIT;

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
    <IconLibraryContext value="lucide">
      <TooltipProvider>
        <div
          className="style-nova mx-auto flex max-w-[1520px] flex-col gap-4"
          data-slot="home-sink"
        >
          <EditorRoot editor={docEditor}>
            <div
              className="cn-card gap-0 overflow-hidden bg-card py-0 text-card-foreground"
              data-slot="card"
            >
              <FixedToolbar className="rounded-none border-b-0 bg-transparent px-1.5 py-1">
                <SinkFixedToolbarButtons kit={BASE_SINK_KIT} />
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
                  <EditorStatic
                    className="min-h-0 px-0 py-0 text-xs [&_pre]:my-0"
                    editor={codeStaticEditor}
                    variant="none"
                  />
                </section>

                <section
                  className="cn-card flex flex-col gap-2 overflow-hidden bg-card p-4 text-card-foreground"
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

                <LintCard kit={BASE_SINK_KIT} lintEditor={lintEditor} />

                <MarkdownOutputCard kit={BASE_SINK_KIT} />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <Toolbar className="no-scrollbar max-w-full overflow-x-auto rounded-lg border bg-popover p-1 whitespace-nowrap shadow-md">
                    <SinkFloatingToolbarButtons kit={BASE_SINK_KIT} />
                  </Toolbar>
                </div>

                <section
                  className="cn-card flex flex-col gap-2 bg-card p-4 text-card-foreground"
                  data-slot="card"
                >
                  <div className="text-xs font-medium">Footnotes</div>
                  <EditorStatic
                    className="min-h-0 px-0 py-1 text-sm"
                    editor={footnoteStaticEditor}
                    variant="none"
                  />
                </section>

                <InkMarkupCard inkEditor={inkEditor} kit={BASE_SINK_KIT} />

                <AIAssistantCard
                  kit={BASE_SINK_KIT}
                  onInsert={appendParagraph}
                />

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

                <FindReplaceCard kit={BASE_SINK_KIT} />
              </div>

              <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
                <ReviewCard
                  kit={BASE_SINK_KIT}
                  suggestionEditor={suggestionEditor}
                />

                <BoardCard boardEditor={boardEditor} kit={BASE_SINK_KIT} />

                <SlashCommandCard
                  kit={BASE_SINK_KIT}
                  onPickCommand={handlePickCommand}
                />

                <BlockMenuCard />

                <section
                  className="cn-card gap-0 overflow-hidden bg-card px-3 py-2 text-card-foreground"
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
    </IconLibraryContext>
  );
}
