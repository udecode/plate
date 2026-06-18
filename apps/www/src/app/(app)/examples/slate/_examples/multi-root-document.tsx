import type { ChangeEvent } from 'react';
import { defineStateField, type EditorCommit, type Node } from '@platejs/slate';
import {
  Editable,
  Slate,
  useEditorState,
  useSetStateField,
  useSlateEditor,
  useSlateHistory,
  useSlateRootChrome,
  useSlateRootState,
  useStateFieldValue,
} from '@platejs/slate-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const documentTitle = defineStateField({
  key: 'document.title',
  collab: 'shared',
  history: 'push',
  initial: () => 'Untitled',
  persist: true,
});

const rootText = (state: { nodes: { children: () => readonly Node[] } }) =>
  state.nodes
    .children()
    .map((node) => {
      const children =
        'children' in node && Array.isArray(node.children) ? node.children : [];

      return children
        .map((child) =>
          typeof (child as { text?: unknown }).text === 'string'
            ? (child as { text: string }).text
            : ''
        )
        .join('');
    })
    .join(' ');

const formatList = (items: readonly string[]) =>
  items.length === 0 ? 'none' : items.join(',');

const formatExampleRoot = (root: string | undefined) =>
  root === undefined ? 'body' : root;

const formatCommit = (commit: EditorCommit | null) => {
  if (!commit) {
    return 'commit:none;ops:none;state:none;tags:none';
  }

  return [
    `commit:${commit.version}`,
    `ops:${formatList(commit.operations.map((operation) => operation.type))}`,
    `roots:${formatList(
      commit.operations.map((operation) =>
        formatExampleRoot((operation as { root?: string }).root)
      )
    )}`,
    `state:${formatList(commit.dirtyStateKeys)}`,
    `tags:${formatList(commit.tags)}`,
  ].join(';');
};

const RootStatus = ({
  id,
  label,
  root,
}: {
  id: string;
  label: string;
  root?: string;
}) => {
  const text = useSlateRootState(root, rootText);

  return (
    <Badge
      className="min-w-0 max-w-full shrink justify-start truncate font-mono"
      id={id}
      variant="default"
    >
      {label}:{text}
    </Badge>
  );
};

const RootEditor = ({
  className = 'slate-multi-root-document-editor',
  id,
  label,
  placeholder,
  root,
}: {
  className?: string;
  id: string;
  label: string;
  placeholder: string;
  root?: string;
}) => {
  const rootLabel = root ?? 'body';
  const chrome = useSlateRootChrome(root);

  return (
    <section
      className="slate-multi-root-document-root-section"
      id={`${id}-surface`}
      {...chrome.props}
    >
      <div className="slate-multi-root-document-root-header">
        <span>{label}</span>
        <RootStatus id={`${id}-status`} label={rootLabel} root={root} />
      </div>
      <Editable
        aria-label={label}
        autoFocus={root === undefined}
        className={className}
        id={id}
        placeholder={placeholder}
        readOnly={false}
        root={root}
      />
    </section>
  );
};

const MultiRootPanel = () => {
  const history = useSlateHistory();
  const titleHistory = useSlateHistory({ focusPolicy: 'preserve' });
  const title = useStateFieldValue(documentTitle);
  const setTitleField = useSetStateField(documentTitle);
  const commitSummary = useEditorState((state) =>
    formatCommit(state.value.lastCommit())
  );

  const setTitle = (value: string) => {
    setTitleField(value);
  };

  const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.currentTarget.value);
  };

  return (
    <div className="slate-multi-root-document-page">
      <div className="slate-multi-root-document-top-bar">
        <Label className="slate-multi-root-document-title-label">
          Document title
          <Input
            aria-label="Document title"
            onChange={onTitleChange}
            onKeyDown={titleHistory.onKeyDown}
            value={title}
          />
        </Label>
        <Button
          onClick={() => setTitle('Board Review Draft')}
          type="button"
          variant="outline"
        >
          Set review title
        </Button>
        <Button
          disabled={!history.canUndo}
          onClick={history.undo}
          type="button"
          variant="outline"
        >
          Undo document change
        </Button>
        <Button
          disabled={!history.canRedo}
          onClick={history.redo}
          type="button"
          variant="outline"
        >
          Redo document change
        </Button>
      </div>
      <div className="slate-multi-root-document-document">
        <RootEditor
          id="multi-root-header"
          label="Header editor"
          placeholder="Add a running header"
          root="header"
        />
        <RootEditor
          className="slate-multi-root-document-editor slate-multi-root-document-body-editor"
          id="multi-root-body"
          label="Body editor"
          placeholder="Draft the body"
        />
        <RootEditor
          id="multi-root-footer"
          label="Footer editor"
          placeholder="Add a footer note"
          root="footer"
        />
      </div>
      <div className="slate-multi-root-document-status">
        <Badge
          className="min-w-0 max-w-full shrink justify-start truncate font-mono"
          id="multi-root-title"
          variant="default"
        >
          title:{title}
        </Badge>
        <Badge
          className="min-w-0 max-w-full shrink justify-start truncate font-mono"
          id="multi-root-commit"
          variant="default"
        >
          {commitSummary}
        </Badge>
      </div>
    </div>
  );
};

const MultiRootDocumentExample = () => {
  const editor = useSlateEditor({
    extensions: [documentTitle],
    initialValue: {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'The body root carries the document content.' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'Header and footer are editable roots.' }],
        },
      ],
      roots: {
        footer: [
          {
            type: 'paragraph',
            children: [{ text: 'Prepared for leadership review' }],
          },
        ],
        header: [
          {
            type: 'paragraph',
            children: [{ text: 'Confidential quarterly plan' }],
          },
        ],
      },
      state: {
        [documentTitle.key]: 'Q2 Operating Plan',
      },
    },
  });

  return (
    <Slate editor={editor}>
      <MultiRootPanel />
    </Slate>
  );
};

export default MultiRootDocumentExample;
