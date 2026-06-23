import { type ChangeEvent, type KeyboardEvent, useRef } from 'react';
import { defineStateField, type EditorCommit } from '@platejs/plite';
import {
  Editable,
  type ReactEditor,
  Plite,
  useEditor,
  useEditorState,
  useSetStateField,
  usePliteEditor,
  useStateFieldValue,
} from '@platejs/plite-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: true,
});

const spellcheck = defineStateField({
  key: 'document.settings.spellcheck',
  collab: 'shared',
  history: 'push',
  initial: () => true,
  persist: true,
});

const formatList = (items: readonly string[]) =>
  items.length === 0 ? 'none' : items.join(',');

const formatCommit = (commit: EditorCommit | null) => {
  if (!commit) {
    return 'commit:none;ops:none;state:none;tags:none';
  }

  return [
    `commit:${commit.version}`,
    `ops:${formatList(commit.operations.map((operation) => operation.type))}`,
    `state:${formatList(commit.dirtyStateKeys)}`,
    `tags:${formatList(commit.tags)}`,
  ].join(';');
};

const getHistoryShortcut = (event: KeyboardEvent<HTMLInputElement>) => {
  const key = event.key.toLowerCase();
  const modifier = event.metaKey || event.ctrlKey;

  if (!modifier || event.altKey) {
    return null;
  }

  if (key === 'z') {
    return event.shiftKey ? 'redo' : 'undo';
  }

  if (key === 'y' && !event.shiftKey) {
    return 'redo';
  }

  return null;
};

const DocumentStatePanel = () => {
  const editor = useEditor<ReactEditor>();
  const title = useStateFieldValue(documentTitle);
  const setTitle = useSetStateField(documentTitle);
  const spellcheckEnabled = useStateFieldValue(spellcheck);
  const setSpellcheckEnabled = useSetStateField(spellcheck);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const commitSummary = useEditorState((state) =>
    formatCommit(state.value.lastCommit())
  );

  const updateTitle = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.currentTarget.value);
  };

  const restoreTitleFocus = () => {
    const input = titleInputRef.current;

    if (!input) {
      return;
    }

    const focusInput = () => {
      if (document.activeElement !== input) {
        input.focus({ preventScroll: true });
      }
    };

    queueMicrotask(focusInput);
    requestAnimationFrame(focusInput);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const direction = getHistoryShortcut(event);

    if (!direction) {
      return;
    }

    const hasHistoryBatch = editor.read((state) =>
      direction === 'undo'
        ? state.history.undos().length > 0
        : state.history.redos().length > 0
    );

    event.preventDefault();
    event.stopPropagation();

    if (!hasHistoryBatch) {
      restoreTitleFocus();
      return;
    }

    editor.update(
      (tx) => {
        if (direction === 'undo') {
          tx.history.undo();
        } else {
          tx.history.redo();
        }
      },
      {
        metadata: {
          selection: { dom: 'preserve', focus: false, scroll: false },
        },
      }
    );
    restoreTitleFocus();
  };

  const receiveRemoteTitle = () => {
    const previousValue = editor.read((state) => state.getField(documentTitle));

    editor.update(
      (tx) => {
        tx.statePatches.replay([
          {
            key: documentTitle.key,
            previousValue,
            value: 'Remote Q2 Brief',
          },
        ]);
      },
      {
        metadata: {
          collab: { origin: 'remote', saveToHistory: false },
          history: { mode: 'skip' },
          selection: { dom: 'preserve', focus: false, scroll: false },
        },
        tag: ['collaboration', 'remote-state'],
      }
    );
  };

  return (
    <div className="plite-document-state-panel">
      <div className="plite-document-state-top-bar">
        <Label className="plite-document-state-title-label">
          Document title
          <Input
            aria-label="Document title"
            onChange={updateTitle}
            onKeyDown={handleTitleKeyDown}
            ref={titleInputRef}
            value={title}
          />
        </Label>
        <span className="plite-document-state-toggle-label">
          <Switch
            aria-label="Enable spellcheck"
            checked={spellcheckEnabled}
            id="document-state-spellcheck-toggle"
            onCheckedChange={(checked) => {
              setSpellcheckEnabled(Boolean(checked));
            }}
          />
          <Label htmlFor="document-state-spellcheck-toggle">Spellcheck</Label>
        </span>
      </div>
      <div className="plite-document-state-controls">
        <Button
          onClick={() => setTitle('Q3 Launch Brief')}
          type="button"
          variant="outline"
        >
          Set Q3 title
        </Button>
        <Button
          onClick={() => {
            editor.update((tx) => tx.history.undo());
          }}
          type="button"
          variant="outline"
        >
          Undo document change
        </Button>
        <Button
          onClick={() => {
            editor.update((tx) => tx.history.redo());
          }}
          type="button"
          variant="outline"
        >
          Redo document change
        </Button>
        <Button onClick={receiveRemoteTitle} type="button" variant="outline">
          Receive remote title
        </Button>
      </div>
      <div className="plite-document-state-status">
        <Badge id="document-state-title" variant="default">
          title:{title}
        </Badge>
        <Badge id="document-state-spellcheck" variant="default">
          spellcheck:{spellcheckEnabled ? 'on' : 'off'}
        </Badge>
        <Badge id="document-state-commit" variant="default">
          {commitSummary}
        </Badge>
      </div>
      <div
        className="plite-document-state-editor-surface"
        id="document-state-editor-surface"
      >
        <Editable
          className="plite-document-state-editor"
          id="document-state"
          spellCheck={spellcheckEnabled}
        />
      </div>
    </div>
  );
};

const DocumentStateExample = () => {
  const editor = usePliteEditor({
    extensions: [documentTitle, spellcheck],
    initialValue: {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'The body is still normal Plite content.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Title changes never need invisible nodes.' }],
        },
      ],
      state: {
        [documentTitle.key]: 'Q2 Planning Brief',
        [spellcheck.key]: true,
      },
    },
  });

  return (
    <Plite editor={editor}>
      <DocumentStatePanel />
    </Plite>
  );
};

export default DocumentStateExample;
