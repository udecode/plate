'use client';

import { Bot, Bold, LinkIcon, List, Sparkles } from 'lucide-react';
import * as React from 'react';

import { SiteRegistryProvider } from '@/components/site-registry/provider';
import type { PlateCreateEditor } from '@/lib/plate-create';
import type {
  PlateRegistryBase,
  PlateRegistryStyleName,
} from '@/lib/plate-registry-styles';
import { cn } from '@/lib/utils';
import {
  FloatingPopover,
  FloatingPopoverContent,
  FloatingPopoverTrigger,
} from '@/registry/components/editor/floating-popover';
import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
} from '@/registry/components/editor/toolbar';

const editorContent: Record<PlateCreateEditor, React.ReactNode> = {
  'editor-ai': (
    <>
      <h2>Plan the launch</h2>
      <p>
        Draft the announcement, assign reviewers, and ask AI to tighten the
        final copy.
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
        <Sparkles className="size-4" />
        Ask AI to continue writing…
      </div>
    </>
  ),
  'editor-basic': (
    <>
      <h2>Weekly notes</h2>
      <p>A clean editor for documents, notes, and long-form content.</p>
      <ul>
        <li>Review the product brief</li>
        <li>Share the first draft</li>
      </ul>
    </>
  ),
  'editor-select': (
    <>
      <p className="text-muted-foreground">Project summary</p>
      <p>Rich text that fits naturally inside a form.</p>
    </>
  ),
};

export function CreatePreview({
  base,
  editor,
  style,
}: {
  base: PlateRegistryBase;
  editor: PlateCreateEditor;
  style: PlateRegistryStyleName;
}) {
  const [bold, setBold] = React.useState(false);
  const styleClassName = `style-${style}`;

  React.useEffect(() => {
    const previousStyleClasses = [...document.body.classList].filter((name) =>
      name.startsWith('style-')
    );

    document.body.classList.remove(...previousStyleClasses);
    document.body.classList.add(styleClassName);

    return () => {
      document.body.classList.remove(styleClassName);
      document.body.classList.add(...previousStyleClasses);
    };
  }, [styleClassName]);

  return (
    <SiteRegistryProvider base={base} style={style}>
      <main
        className={cn(
          styleClassName,
          'flex min-h-svh items-center justify-center bg-muted/40 p-4 sm:p-8'
        )}
        data-preview-base={base}
        data-preview-editor={editor}
        data-preview-style={style}
      >
        <section className="w-full max-w-3xl overflow-hidden rounded-xl border bg-background shadow-sm">
          <Toolbar className="min-h-11 gap-1 border-b bg-background px-2">
            <ToolbarGroup>
              <ToolbarButton
                aria-label="Bold"
                pressed={bold}
                onClick={() => setBold((value) => !value)}
              >
                <Bold className="size-4" />
              </ToolbarButton>
              <ToolbarButton aria-label="List">
                <List className="size-4" />
              </ToolbarButton>
              <ToolbarButton aria-label="AI">
                <Bot className="size-4" />
              </ToolbarButton>
            </ToolbarGroup>

            <FloatingPopover>
              <FloatingPopoverTrigger>
                <ToolbarButton aria-label="Insert link">
                  <LinkIcon className="size-4" />
                </ToolbarButton>
              </FloatingPopoverTrigger>
              <FloatingPopoverContent>
                <p className="text-sm font-medium">Insert link</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Provider-specific popover behavior, shared Plate API.
                </p>
              </FloatingPopoverContent>
            </FloatingPopover>
          </Toolbar>

          <article
            className={cn(
              'prose prose-neutral dark:prose-invert max-w-none p-6 sm:p-10',
              editor === 'editor-select' && 'min-h-44',
              editor !== 'editor-select' && 'min-h-80',
              bold && 'font-semibold'
            )}
          >
            {editorContent[editor]}
          </article>
        </section>
      </main>
    </SiteRegistryProvider>
  );
}
