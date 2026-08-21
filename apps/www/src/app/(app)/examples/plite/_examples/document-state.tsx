import {
  defineExtension,
  defineStateField,
  type EditorCommit,
  valueCodecs,
} from '@platejs/plite';
import { history } from '@platejs/plite-history';
import {
  Editable,
  Plite,
  PliteReactUpdatePolicy,
  useEditor,
  useEditorState,
  useSetStateField,
  usePliteEditor,
  useStateFieldValue,
} from '@platejs/plite-react';
import { type ChangeEvent, type KeyboardEvent, useRef } from 'react';

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
  persist: valueCodecs.string,
});

const spellcheck = defineStateField({
  key: 'document.settings.spellcheck',
  collab: 'shared',
  history: 'push',
  initial: () => true,
  persist: valueCodecs.boolean,
});

const HistoryExtension = history();
const DocumentStateExtension = defineExtension('documentState', {
  stateFields: [documentTitle, spellcheck],
});
const formatList = (items: readonly string[]) =>
  items.length === 0 ? 'none' : items.join(',');

const changedKinds = [
  'document',
  'text',
  'structure',
  'properties',
  'replace',
  'root-order',
  'selection',
  'marks',
  'state',
] as const;

const formatCommit = (commit: EditorCommit | null) => {
  if (!commit) {
    return 'commit:none;changed:none;state:none;tags:none';
  }

  return [
    `commit:${commit.version}`,
    `changed:${formatList(
      changedKinds.filter((kind) => commit.changed.has(kind))
    )}`,
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
  const editor = useEditor();
  const historyPortal = editor.extension(HistoryExtension);
  const title = useStateFieldValue(documentTitle);
  const setTitle = useSetStateField(documentTitle);
  const spellcheckEnabled = useStateFieldValue(spellcheck);
  const setSpellcheckEnabled = useSetStateField(spellcheck);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const commitSummary = useEditorState((state) =>
    formatCommit(state.lastCommit())
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

    const hasHistoryBatch =
      direction === 'undo'
        ? historyPortal.read.undos().length > 0
        : historyPortal.read.redos().length > 0;

    event.preventDefault();
    event.stopPropagation();

    if (!hasHistoryBatch) {
      restoreTitleFocus();
      return;
    }

    if (direction === 'undo') {
      historyPortal.update(PliteReactUpdatePolicy.preserveSelection).undo();
    } else {
      historyPortal.update(PliteReactUpdatePolicy.preserveSelection).redo();
    }
    restoreTitleFocus();
  };

  const receiveRemoteTitle = () => {
    const previousValue = editor.read.getField(documentTitle);

    editor.update(
      {
        history: 'skip',
        tags: [
          ...PliteReactUpdatePolicy.preserveSelection.tags,
          'collaboration',
          'remote-state',
        ],
      },
      (tx) => {
        tx.effects.emit(documentTitle.effect, {
          previousValue,
          value: 'Remote Q2 Brief',
        });
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
            historyPortal.update.undo();
          }}
          type="button"
          variant="outline"
        >
          Undo document change
        </Button>
        <Button
          onClick={() => {
            historyPortal.update.redo();
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
    extensions: [HistoryExtension, DocumentStateExtension],
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
      meta: {
        [documentTitle.key]: documentTitle.serialize('Q2 Planning Brief'),
        [spellcheck.key]: spellcheck.serialize(true),
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
