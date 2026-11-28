'use client';

import type { EditorValueInput, Value } from 'platejs';
import type { SavedComments } from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import {
  AllCommentsButton,
  CommentToolbarButton,
} from '@/registry/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/registry/components/editor/discussion';
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
import { DigitizeAllToolbarButton } from '@/registry/components/editor/ink-dock';
import { InkSwitchToolbarButton } from '@/registry/components/editor/ink-switch-toolbar-button';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { SettingsDialog } from '@/registry/components/editor/settings-dialog';
import { ToolbarGroup } from '@/registry/components/editor/toolbar';
import {
  UserDirectoryProvider,
  type UserProfile,
} from '@/registry/components/editor/user-directory';

const VALUE_KEY = 'ink-demo-value';

const INK_USERS: Readonly<Record<string, UserProfile>> = {
  alice: { id: 'alice', name: 'Alice' },
};

type SavedInkDemoState = Readonly<{
  comments: SavedComments;
  document: EditorValueInput<Value>;
}>;

const EMPTY_COMMENTS: SavedComments = {
  ranges: {},
  threads: [],
};

const initialValue = [
  { children: [{ text: 'Pen markup' }], level: 2, type: 'heading' },
  {
    children: [
      {
        text: 'Turn on Draw and mark these words with a pen or the mouse. Ask ',
      },
      {
        children: [{ text: '' }],
        label: 'Ada Lovelace',
        ref: 'ada',
        type: 'mention',
      },
      {
        text: ' to review a circled word, strike through a phrase, or write a note in the margin. A finger still scrolls, and typing keeps working while Draw is on.',
      },
    ],
    type: 'paragraph',
  },
  {
    children: [{ text: '' }],
    type: 'image',
    url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    width: '50%',
  },
  {
    children: [
      {
        text: 'Ink is saved in the document alongside comment threads. Marks stay attached as you edit text or resize the photo, and deleting marked text or the photo deletes its ink cleanly with Cmd+Z undo. Use Digitize to convert rough text markup into edits, suggestions, comments, or answers.',
      },
    ],
    type: 'paragraph',
  },
] as Value;

const stripLegacyInkGone = (
  document: EditorValueInput<Value>
): EditorValueInput<Value> => {
  if (
    !document ||
    typeof document !== 'object' ||
    Array.isArray(document) ||
    !('records' in document)
  ) {
    return document;
  }

  const { records } = document as { records?: Record<string, unknown> };

  if (!records || !('ink-gone' in records)) return document;

  const { 'ink-gone': _dropped, ...rest } = records;

  return { ...document, records: rest } as EditorValueInput<Value>;
};

const parseSavedInkDemo = (raw: string | null): SavedInkDemoState => {
  if (!raw) {
    return { comments: EMPTY_COMMENTS, document: initialValue };
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      parsed &&
      typeof parsed === 'object' &&
      !Array.isArray(parsed) &&
      'document' in parsed
    ) {
      const state = parsed as {
        comments?: SavedComments;
        document: EditorValueInput<Value>;
      };

      return {
        comments: state.comments ?? EMPTY_COMMENTS,
        document: stripLegacyInkGone(state.document),
      };
    }

    return {
      comments: EMPTY_COMMENTS,
      document: stripLegacyInkGone(parsed as EditorValueInput<Value>),
    };
  } catch {
    return { comments: EMPTY_COMMENTS, document: initialValue };
  }
};

const subscribe = () => () => {};
const getServerSnapshot = () => undefined;

export default function InkDemo() {
  const saved = React.useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(VALUE_KEY),
    getServerSnapshot
  );

  if (saved === undefined) return null;

  return <InkDemoEditor initialState={parseSavedInkDemo(saved)} />;
}

function InkDemoEditor({ initialState }: { initialState: SavedInkDemoState }) {
  const editor = useCreateEditor({
    initialValue: initialState.document,
    plugins: [
      ...EditorKit.filter((plugin) => plugin !== FixedToolbarPlugin),
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          initialComments: initialState.comments,
        },
      }),
      ...InkKit,
    ],
    userId: 'alice',
  });

  const persist = React.useCallback(() => {
    const comments = editor.plugin(CommentsPlugin).api;

    localStorage.setItem(
      VALUE_KEY,
      JSON.stringify({
        comments: {
          ranges: comments.ranges(),
          threads: comments.getThreads(),
        },
        document: editor.read.value(),
      })
    );
  }, [editor]);

  React.useEffect(() => {
    const comments = editor.plugin(CommentsPlugin).api;
    const stopThreads = comments.subscribeThreads(persist);
    const stopRanges = comments.subscribeRanges(persist);

    return () => {
      stopThreads();
      stopRanges();
    };
  }, [editor, persist]);

  return (
    <div className="flex h-full flex-col">
      <UserDirectoryProvider initialUsers={INK_USERS}>
        <EditorRoot editor={editor} onValueChange={persist}>
          <FixedToolbar className="justify-start rounded-none">
            <ToolbarGroup>
              <DrawToolbarButton />
              <DigitizeAllToolbarButton />
              <InkSwitchToolbarButton />
              <ModeToolbarButton />
              <CommentToolbarButton />
              <AllCommentsButton />
            </ToolbarGroup>
          </FixedToolbar>
          <EditorFrame className="min-h-0 flex-1">
            <EditorContainer>
              <Editor />
            </EditorContainer>
          </EditorFrame>
          <SettingsDialog />
        </EditorRoot>
      </UserDirectoryProvider>
    </div>
  );
}
