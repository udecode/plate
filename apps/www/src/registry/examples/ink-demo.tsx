'use client';

import type { EditorValueInput, Value } from 'platejs';
import { AuthoredPlugin } from 'platejs/authored';
import type {
  CommentsPluginState,
  CommentUser,
  SavedComments,
} from 'platejs/comments';
import { CommentsPlugin } from 'platejs/comments/react';
import {
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorViewState,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
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
import {
  InkSwitchToolbarButton,
  ShowDigitizedToolbarButton,
} from '@/registry/components/editor/ink-switch-toolbar-button';
import { ModeToolbarButton } from '@/registry/components/editor/mode-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { SettingsDialog } from '@/registry/components/editor/settings-dialog';
import {
  ToolbarButton,
  ToolbarGroup,
} from '@/registry/components/editor/toolbar';

const VALUE_KEY = 'ink-demo-value';
const SECOND_USER_KEY = 'ink-demo-second-user';

const INK_USERS: Readonly<Record<string, CommentUser>> = {
  alice: { id: 'alice', name: 'Alice' },
  bob: { id: 'bob', name: 'Bob' },
};

type SavedInkDemoState = Readonly<{
  comments: SavedComments;
  document: EditorValueInput<Value>;
}>;

const EMPTY_COMMENTS: SavedComments = {
  ranges: {},
  threads: [],
};

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
  paragraph(
    'The arrow beside Draw picks the pen, the highlighter, the eraser or the lasso. The eraser removes every mark it touches, and Backspace removes the marks the lasso picks. Hide ink hides every mark and sign until you show them again.'
  ),
  paragraph('In Suggesting, a stroke is saved as ink, not as a suggestion.'),
  paragraph(
    'Scroll down: the ink layer covers the whole document, not just its first screen.'
  ),
  paragraph('The last paragraph of the document, far below the first screen.'),
] as Value;

const parseSavedInkDemo = (raw: string | null): SavedInkDemoState => {
  if (!raw) {
    return { comments: EMPTY_COMMENTS, document: initialValue };
  }

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
      document: state.document,
    };
  }

  return {
    comments: EMPTY_COMMENTS,
    document: parsed as EditorValueInput<Value>,
  };
};

type SaveControl = {
  delayNext: boolean;
  rejectNext: boolean;
  releaseDelay: (() => void) | null;
};

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
    state: SavedInkDemoState;
  } | null>(null);
  const [secondView, setSecondView] = React.useState(false);
  const [rejectNext, setRejectNext] = React.useState(false);
  const [delayNext, setDelayNext] = React.useState(false);
  const [delayPending, setDelayPending] = React.useState(false);
  const saveControlRef = React.useRef<SaveControl>({
    delayNext: false,
    rejectNext: false,
    releaseDelay: null,
  });

  if (saved === undefined) return null;

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex flex-wrap gap-2 border-b p-2">
        <Button
          onClick={() => {
            const value = localStorage.getItem(VALUE_KEY);

            setSecondUser((open) => ({
              opening: (open?.opening ?? 0) + 1,
              state: parseSavedInkDemo(value),
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
          aria-pressed={rejectNext}
          onClick={() => {
            const next = !saveControlRef.current.rejectNext;

            saveControlRef.current.rejectNext = next;
            setRejectNext(next);
          }}
          size="sm"
          variant={rejectNext ? 'secondary' : 'outline'}
        >
          Refuse next save
        </Button>
        <Button
          aria-pressed={delayNext}
          onClick={() => {
            const next = !saveControlRef.current.delayNext;

            saveControlRef.current.delayNext = next;
            setDelayNext(next);
          }}
          size="sm"
          variant={delayNext ? 'secondary' : 'outline'}
        >
          Delay next save
        </Button>
        {delayPending && (
          <Button
            onClick={() => {
              const release = saveControlRef.current.releaseDelay;

              saveControlRef.current.releaseDelay = null;
              setDelayPending(false);
              release?.();
            }}
            size="sm"
          >
            Release delayed save
          </Button>
        )}
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
          initialState={parseSavedInkDemo(saved)}
          label="First user"
          onDelayChange={setDelayNext}
          onDelayPendingChange={setDelayPending}
          onRejectChange={setRejectNext}
          saveControlRef={saveControlRef}
          secondView={secondView}
          storageKey={VALUE_KEY}
          userId="alice"
        />
        {secondUser && (
          <InkEditor
            initialState={secondUser.state}
            key={secondUser.opening}
            label="Second user"
            secondView={false}
            storageKey={SECOND_USER_KEY}
            userId="bob"
          />
        )}
      </div>
    </div>
  );
}

function PreviewToolbarButton() {
  const editor = useEditor();
  const preview = useEditorViewState(editor, () => {
    const authored = editor.plugin(AuthoredPlugin);

    return authored.installed && 'preview' in authored.read.view();
  });

  return (
    <ToolbarButton
      aria-label="Preview accepted"
      onClick={() => {
        const authored = editor.plugin(AuthoredPlugin);

        if (!authored.installed) return;
        authored.api.setView(
          preview ? { intent: 'edit' } : { preview: 'accepted' }
        );
      }}
      pressed={preview}
      tooltip="Preview accepted"
    >
      Preview
    </ToolbarButton>
  );
}

function InkEditor({
  initialState,
  label,
  onDelayChange,
  onDelayPendingChange,
  onRejectChange,
  saveControlRef,
  secondView,
  storageKey,
  userId,
}: {
  initialState: SavedInkDemoState;
  label: string;
  onDelayChange?: (next: boolean) => void;
  onDelayPendingChange?: (pending: boolean) => void;
  onRejectChange?: (next: boolean) => void;
  saveControlRef?: React.RefObject<SaveControl>;
  secondView: boolean;
  storageKey: string;
  userId: string;
}) {
  const [mutate] = React.useState(() => {
    const handler: CommentsPluginState['mutate'] = async (request) => {
      const control = saveControlRef?.current;

      if (control?.rejectNext) {
        control.rejectNext = false;
        onRejectChange?.(false);

        return { code: 'simulated-failure', status: 'reject' };
      }
      if (control?.delayNext) {
        control.delayNext = false;
        onDelayChange?.(false);
        onDelayPendingChange?.(true);
        await new Promise<void>((resolve) => {
          control.releaseDelay = resolve;
        });
      }

      return { status: 'commit', thread: request.proposed };
    };

    return handler;
  });

  const editor = useCreateEditor({
    initialValue: initialState.document,
    plugins: [
      ...EditorKit.filter((plugin) => plugin !== FixedToolbarPlugin),
      ...DiscussionKit,
      CommentsPlugin.configure({
        initialState: {
          initialComments: initialState.comments,
          mutate,
          users: INK_USERS,
        },
      }),
      ...InkKit,
    ],
    userId,
  });

  const persist = React.useCallback(() => {
    const comments = editor.plugin(CommentsPlugin).api;

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        comments: {
          ranges: comments.ranges(),
          threads: comments.getThreads(),
        },
        document: editor.read.value(),
      })
    );
  }, [editor, storageKey]);

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
    <section
      aria-label={label}
      className="flex min-h-0 min-w-0 flex-col border-b last:border-b-0"
      data-ink-user={userId}
    >
      <EditorRoot editor={editor} onValueChange={persist}>
        <FixedToolbar className="justify-start rounded-none">
          <ToolbarGroup>
            <DrawToolbarButton />
            <InkSwitchToolbarButton />
            <ShowDigitizedToolbarButton />
            <ModeToolbarButton />
            <PreviewToolbarButton />
            <CommentToolbarButton />
            <AllCommentsButton />
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
        {userId === 'alice' && <SettingsDialog />}
      </EditorRoot>
    </section>
  );
}
