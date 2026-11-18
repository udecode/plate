'use client';

import type { Value } from 'platejs';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { DrawToolbarButton } from '@/registry/components/editor/draw-toolbar-button';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import {
  FixedToolbar,
  FixedToolbarPlugin,
} from '@/registry/components/editor/fixed-toolbar';
import { InkKit } from '@/registry/components/editor/ink';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { ToolbarGroup } from '@/registry/components/editor/toolbar';

const VALUE_KEY = 'ink-demo-value';
const SECOND_USER_KEY = 'ink-demo-second-user';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const initialValue = [
  { children: [{ text: 'Pen markup' }], level: 2, type: 'heading' },
  paragraph(
    'Turn on Draw and mark these words with a pen or the mouse. Circle a word, underline a line or write a note in the margin. A finger still scrolls.'
  ),
  {
    children: [{ text: '' }],
    type: 'image',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '50%',
  },
  paragraph(
    'Ink is saved in the document, so it comes back after a reload and another reader sees it. Each mark remembers the words under it and the lines they sat on. While those words stand where they stood, the ink draws on them. When the text changes, the mark moves to a sign in the margin, and the sign opens the words as they were with their ink.'
  ),
  paragraph('This line ends in a break\n'),
  {
    textAlign: 'justify',
    children: [
      {
        text: 'A justified paragraph spreads its words across each full line, so the space between them grows with the width. Ink drawn on a justified line stays on its words, and the sign shows them where they stood.',
      },
    ],
    type: 'paragraph',
  },
  paragraph(
    'Typing keeps working while Draw is on, and a stroke never moves the caret.'
  ),
  paragraph(
    'Switch to Viewing and the Draw tool turns off, because a mark is a write to the document.'
  ),
  paragraph(
    'Open the saved document as a second user to see the first user’s marks and add your own.'
  ),
  paragraph(
    'A margin note may be as wide as the margin it was drawn in. In a narrower window it shows as its sign.'
  ),
  paragraph(
    'Marks follow their blocks by id, so a paragraph moved elsewhere keeps its ink.'
  ),
  paragraph(
    'A deleted paragraph leaves its sign beside the nearest paragraph still there.'
  ),
  paragraph(
    'Undo takes back one pen contact at a time, and redo puts it back.'
  ),
  paragraph('In Suggesting, a stroke is saved as ink, not as a suggestion.'),
  paragraph(
    'Scroll down: the ink layer covers the whole document, not just its first screen.'
  ),
  paragraph('The last paragraph of the document, far below the first screen.'),
] as Value;

const subscribe = () => () => {};
const getServerSnapshot = () => undefined;

export default function InkDemo() {
  const saved = React.useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(VALUE_KEY),
    getServerSnapshot
  );
  const [secondUser, setSecondUser] = React.useState<{
    opening: number;
    value: Value;
  } | null>(null);
  const [secondView, setSecondView] = React.useState(false);

  if (saved === undefined) return null;

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-wrap gap-2 border-b p-2">
        <Button
          onClick={() => {
            const value = localStorage.getItem(VALUE_KEY);

            setSecondUser((open) => ({
              opening: (open?.opening ?? 0) + 1,
              value: value ? JSON.parse(value) : initialValue,
            }));
          }}
          size="sm"
          variant="outline"
        >
          Open as second user
        </Button>
        <Button
          onClick={() => setSecondView((open) => !open)}
          size="sm"
          variant="outline"
        >
          {secondView ? 'Close second view' : 'Open second view'}
        </Button>
        <Button
          onClick={() => {
            localStorage.removeItem(VALUE_KEY);
            localStorage.removeItem(SECOND_USER_KEY);
            location.reload();
          }}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      </div>
      <div className="grid min-h-0 flex-1 auto-rows-[minmax(0,1fr)]">
        <InkEditor
          label="First user"
          secondView={secondView}
          storageKey={VALUE_KEY}
          userId="alice"
          value={saved ? JSON.parse(saved) : initialValue}
        />
        {secondUser && (
          <InkEditor
            key={secondUser.opening}
            label="Second user"
            secondView={false}
            storageKey={SECOND_USER_KEY}
            userId="bob"
            value={secondUser.value}
          />
        )}
      </div>
    </div>
  );
}

function InkEditor({
  label,
  secondView,
  storageKey,
  userId,
  value,
}: {
  label: string;
  secondView: boolean;
  storageKey: string;
  userId: string;
  value: Value;
}) {
  const editor = useCreateEditor({
    initialValue: value,
    plugins: [
      ...EditorKit.filter((plugin) => plugin !== FixedToolbarPlugin),
      ...InkKit,
    ],
    userId,
  });

  return (
    <section
      aria-label={label}
      className="flex min-h-0 min-w-0 flex-col border-b last:border-b-0"
      data-ink-user={userId}
    >
      <EditorRoot
        editor={editor}
        onValueChange={() => {
          localStorage.setItem(storageKey, JSON.stringify(editor.read.value()));
        }}
      >
        <FixedToolbar className="justify-start rounded-none">
          <ToolbarGroup>
            <DrawToolbarButton />
            <ModeToolbarButton />
          </ToolbarGroup>
        </FixedToolbar>
        <EditorFrame className="min-h-0 flex-1">
          <EditorContainer>
            <Editor />
          </EditorContainer>
          {secondView && (
            <EditorContainer className="border-t" data-ink-second-view="">
              <Editor />
            </EditorContainer>
          )}
        </EditorFrame>
      </EditorRoot>
    </section>
  );
}
