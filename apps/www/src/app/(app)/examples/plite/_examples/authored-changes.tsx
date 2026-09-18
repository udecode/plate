'use client';

import { standardKeymap } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { createCodeMirrorAdapter } from 'platejs/code-block/codemirror';
import { defineEditorSchema, property, schema } from 'plitejs';
import { authored, type AuthoredPlugin } from 'plitejs/authored';
import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  type RenderElementProps,
  type RenderVoidProps,
  useEditor,
  useEditorContext,
  useEditorReadOnly,
  useEditorSelector,
  useElementSelected,
} from 'plitejs/react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';

import { textareaAdapter } from './external-text';

const historyPlugin = history();
const codeMirrorAdapter = createCodeMirrorAdapter({
  extensions: keymap.of(standardKeymap),
});
const inlineSchema = defineEditorSchema('schema:authored-example-inline', {
  id: 'authored-example-inline',
  version: 1,
  unknown: 'preserve',
  elements: {
    code: { content: schema.content.text({ min: 1, max: 1 }) },
    mention: {
      properties: { label: property.string() },
      void: 'markable-inline',
    },
    media: {
      properties: { label: property.string() },
      void: 'block',
    },
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
  root: schema.content.not(schema.content.text()),
});
const proposal = { intent: 'propose', projection: 'proposed' } as const;
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const samples = {
  'media-first': {
    label: 'Media at document start',
    value: [
      { type: 'media', label: 'Preview', children: [{ text: '' }] },
      paragraph('AB'),
    ],
  },
  'media-last': {
    label: 'Media at document end',
    value: [
      paragraph('AB'),
      { type: 'media', label: 'Preview', children: [{ text: '' }] },
    ],
  },
  'media-only': {
    label: 'One media block',
    value: [{ type: 'media', label: 'Preview', children: [{ text: '' }] }],
  },
  atomics: {
    label: 'Mentions and media',
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { type: 'mention', label: 'Alice', children: [{ text: '' }] },
          { text: 'B' },
        ],
      },
      { type: 'media', label: 'Preview', children: [{ text: '' }] },
      paragraph('CD'),
    ],
  },
  codemirror: {
    label: 'CodeMirror',
    value: [{ type: 'code', children: [{ text: 'AB' }] }],
  },
  'codemirror-boundaries': {
    label: 'CodeMirror and paragraphs',
    value: [
      paragraph('EF'),
      { type: 'code', children: [{ text: 'AB' }] },
      paragraph('CD'),
    ],
  },
  'external-text': {
    label: 'External text editor',
    value: [{ type: 'code', children: [{ text: 'AB' }] }],
  },
  paragraphs: {
    label: 'Paragraphs',
    value: [
      paragraph('A shared draft.'),
      paragraph('Select a phrase, type a replacement, and review the result.'),
    ],
  },
  'quote-suffix': {
    label: 'Paragraph and quote',
    value: [paragraph('AB'), { type: 'quote', children: [paragraph('CD')] }],
  },
  'quote-prefix': {
    label: 'Quote and paragraph',
    value: [{ type: 'quote', children: [paragraph('AB')] }, paragraph('CD')],
  },
  'two-quotes': {
    label: 'Two quotes',
    value: [
      { type: 'quote', children: [paragraph('AB')] },
      { type: 'quote', children: [paragraph('CD')] },
    ],
  },
  'table-cell': {
    label: 'Paragraphs in a table cell',
    value: [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [paragraph('AB'), paragraph('CD')],
              },
              { type: 'table-cell', children: [paragraph('Other cell')] },
            ],
          },
        ],
      },
    ],
  },
  'named-root': {
    label: 'Quotes in a named root',
    value: {
      children: [paragraph('Main document')],
      roots: {
        notes: [
          { type: 'quote', children: [paragraph('AB')] },
          { type: 'quote', children: [paragraph('CD')] },
        ],
      },
    },
  },
  link: {
    label: 'Inline link',
    value: [
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { type: 'link', url: '/docs', children: [{ text: 'BC' }] },
          { text: 'D' },
        ],
      },
    ],
  },
};

const ReviewVoid = ({ element }: RenderVoidProps) => {
  const selected = useElementSelected();
  return element.type === 'mention' ? (
    <span
      className="rounded bg-blue-100 px-1 data-[selected=true]:bg-blue-300"
      data-authored-atomic="mention"
      data-selected={selected}
    >
      @{String(element.label)}
    </span>
  ) : (
    <div
      className="my-2 rounded border bg-gray-100 p-3 data-[selected=true]:bg-blue-300"
      data-authored-atomic="media"
      data-selected={selected}
    >
      {String(element.label)}
    </div>
  );
};
const renderVoid = (props: RenderVoidProps) => <ReviewVoid {...props} />;

const ReviewElement = ({
  authoring,
  external,
  label,
  props: { attributes, element, slots },
}: {
  authoring: AuthoredPlugin;
  external?: 'codemirror' | 'textarea';
  label: string;
  props: RenderElementProps;
}) => {
  const mode = useEditorSelector((current) =>
    current.plugin(authoring).read.view()
  );
  switch (element.type) {
    case 'code': {
      return (
        <div {...attributes}>
          {external && mode.projection !== 'markup'
            ? external === 'codemirror'
              ? slots.externalText({
                  adapter: codeMirrorAdapter,
                  ariaLabel: `${label} code`,
                  config: {},
                })
              : slots.externalText({
                  adapter: textareaAdapter,
                  ariaLabel: `${label} text`,
                })
            : slots.children()}
        </div>
      );
    }
    case 'link': {
      return (
        <a
          {...attributes}
          className="text-blue-600 underline"
          href={String(element.url)}
        >
          {slots.children()}
        </a>
      );
    }
    case 'quote': {
      return (
        <blockquote {...attributes} className="my-2 border-l-2 pl-3">
          {slots.children()}
        </blockquote>
      );
    }
    case 'table': {
      return (
        <table {...attributes} className="w-full border-collapse">
          <tbody>{slots.children()}</tbody>
        </table>
      );
    }
    case 'table-row': {
      return <tr {...attributes}>{slots.children()}</tr>;
    }
    case 'table-cell': {
      return (
        <td {...attributes} className="border p-2 align-top">
          {slots.children()}
        </td>
      );
    }
    default: {
      return <div {...attributes}>{slots.children()}</div>;
    }
  }
};

const ReviewEditable = ({
  authoring,
  external,
  label,
}: {
  authoring: AuthoredPlugin;
  external?: 'codemirror' | 'textarea';
  label: string;
}) => {
  const renderElement = useCallback(
    (props: RenderElementProps) => (
      <ReviewElement
        authoring={authoring}
        external={external}
        label={label}
        props={props}
      />
    ),
    [authoring, external, label]
  );

  return (
    <Editable
      aria-label={label}
      className="min-h-44 rounded-lg border p-4 outline-none focus:ring-2 focus:ring-blue-500/30"
      renderElement={renderElement}
      renderVoid={renderVoid}
    />
  );
};

const ReviewSurface = ({
  authoring,
  external,
  label,
}: {
  authoring: AuthoredPlugin;
  external?: 'codemirror' | 'textarea';
  label: string;
}) => {
  const editor = useEditorContext();
  const review = editor.plugin(authoring);
  const historyPortal = editor.plugin(historyPlugin);
  const readOnly = useEditorReadOnly();
  const mode = useEditorSelector((currentEditor) =>
    currentEditor.plugin(authoring).read.view()
  );

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2" aria-label={`${label} controls`}>
        <Button
          aria-pressed={mode.projection === 'proposed'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => review.api.setView(proposal)}
          size="sm"
          variant="outline"
        >
          Suggest
        </Button>
        <Button
          aria-pressed={mode.projection === 'markup'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            review.api.setView({ intent: 'propose', projection: 'markup' })
          }
          size="sm"
          variant="outline"
        >
          Show changes
        </Button>
        <Button
          aria-pressed={mode.intent === 'edit'}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            review.api.setView({ intent: 'edit', projection: 'accepted' })
          }
          size="sm"
          variant="outline"
        >
          Edit accepted
        </Button>
        <Button
          disabled={readOnly}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => historyPortal.api.undo()}
          size="sm"
          variant="outline"
        >
          Undo
        </Button>
        <Button
          disabled={readOnly}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => historyPortal.api.redo()}
          size="sm"
          variant="outline"
        >
          Redo
        </Button>
      </div>
      <ReviewEditable authoring={authoring} external={external} label={label} />
    </div>
  );
};

const ReviewCards = ({ authoring }: { authoring: AuthoredPlugin }) => {
  const editor = useEditorContext();
  const review = editor.plugin(authoring);
  const readOnly = useEditorReadOnly();
  const pending = useEditorSelector((currentEditor) =>
    currentEditor.plugin(authoring).read.changes({ status: 'pending' })
  );
  const [result, setResult] = useState('');
  const decide = (
    action: 'accept' | 'reject',
    selection: ReturnType<typeof review.read.select>
  ) => {
    const outcome = review.update.decide({ action, selection });
    setResult(
      outcome.status === 'applied'
        ? `${action === 'accept' ? 'Accepted' : 'Rejected'} ${
            outcome.ids.length
          } proposal${outcome.ids.length === 1 ? '' : 's'}.`
        : `Review result: ${outcome.status}.`
    );
  };

  return (
    <section className="grid gap-3" aria-label="Pending proposals">
      <h2 className="font-semibold">Pending proposals</h2>
      <div className="flex flex-wrap gap-2">
        {(['alice', 'bob'] as const).map((authorId) => (
          <div className="flex gap-2" key={authorId}>
            <Button
              disabled={readOnly}
              onClick={() =>
                decide(
                  'accept',
                  review.read.select({ authorId, status: 'pending' })
                )
              }
              size="sm"
              variant="outline"
            >
              Accept all {authorId === 'alice' ? 'Alice' : 'Bob'}
            </Button>
            <Button
              disabled={readOnly}
              onClick={() =>
                decide(
                  'reject',
                  review.read.select({ authorId, status: 'pending' })
                )
              }
              size="sm"
              variant="outline"
            >
              Reject all {authorId === 'alice' ? 'Alice' : 'Bob'}
            </Button>
          </div>
        ))}
      </div>
      <p aria-live="polite">{result}</p>
      {pending.items.length === 0 ? (
        <p>No pending proposals.</p>
      ) : (
        <ul className="grid gap-2">
          {pending.items.map((change) => (
            <li
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
              key={change.id}
            >
              <span>
                {change.authorId === 'alice' ? 'Alice' : 'Bob'} · {change.kind}
              </span>
              <div className="flex gap-2">
                <Button
                  disabled={readOnly}
                  onClick={() =>
                    decide('accept', review.read.select({ ids: [change.id] }))
                  }
                  size="sm"
                >
                  Accept
                </Button>
                <Button
                  disabled={readOnly}
                  onClick={() =>
                    decide('reject', review.read.select({ ids: [change.id] }))
                  }
                  size="sm"
                  variant="outline"
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pending.cursor ? (
        <p>
          The list shows the first 50 proposals. Author decisions include every
          matching proposal.
        </p>
      ) : null}
    </section>
  );
};

const IndependentDocument = ({ authoring }: { authoring: AuthoredPlugin }) => {
  const editor = useEditor({
    plugins: [historyPlugin, authoring],
    initialValue: [paragraph('A separate document.')],
  });
  return (
    <EditorRoot editor={editor}>
      <Editable
        aria-label="Independent document"
        className="min-h-20 rounded-lg border p-4"
      />
    </EditorRoot>
  );
};

const AuthoredChangesDocument = ({
  sample,
}: {
  sample: keyof typeof samples;
}) => {
  const [readOnly, setReadOnly] = useState(false);
  const [sharedViewCount, setSharedViewCount] = useState<1 | 2 | 8>(2);
  const [{ authoring, setAuthorId }] = useState(() => {
    let authorId = 'alice';
    return {
      authoring: authored({ authorId: () => authorId, retainHistory: true }),
      setAuthorId: (value: string) => {
        authorId = value;
      },
    };
  });
  const editor = useEditor({
    plugins: [inlineSchema, historyPlugin, authoring],
    initialValue: samples[sample].value,
  });

  return (
    <div className="grid gap-6">
      <p>
        Every mounted view shares one document while keeping its own projection
        and input policy. Suggested edits remain pending until reviewed.
      </p>
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-3">
          Editing as
          <select
            aria-label="Author"
            className="rounded border p-2"
            defaultValue="alice"
            onChange={(event) => setAuthorId(event.target.value)}
          >
            <option value="alice">Alice</option>
            <option value="bob">Bob</option>
          </select>
        </label>
        <label className="flex items-center gap-3">
          Shared document views
          <select
            aria-label="Shared document views"
            className="rounded border p-2"
            onChange={(event) => {
              const value = Number(event.target.value);
              if (value === 1 || value === 2 || value === 8) {
                setSharedViewCount(value);
              }
            }}
            value={sharedViewCount}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="8">8</option>
          </select>
        </label>
      </div>
      <EditorRoot
        authored={proposal}
        editor={editor}
        readOnly={readOnly}
        root={sample === 'named-root' ? 'notes' : undefined}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {sharedViewCount >= 2 ? (
            <section
              id="authored-accepted-surface"
              className="grid content-start gap-3"
              data-authored-projection="accepted"
              data-authored-shared-view=""
            >
              <h2 className="font-semibold">Accepted content</h2>
              <EditorRoot
                editor={editor}
                root={sample === 'named-root' ? 'notes' : undefined}
              >
                <ReviewSurface
                  authoring={authoring}
                  label="Accepted document"
                />
              </EditorRoot>
            </section>
          ) : null}
          <section
            id="authored-proposed-surface"
            className="grid content-start gap-3"
            data-authored-projection="proposed"
            data-authored-shared-view=""
          >
            <h2 className="font-semibold">Proposed content</h2>
            <label className="flex items-center gap-2">
              <input
                checked={readOnly}
                onChange={(event) => setReadOnly(event.target.checked)}
                type="checkbox"
              />
              Read-only proposed view
            </label>
            <ReviewSurface
              authoring={authoring}
              external={
                sample === 'external-text'
                  ? 'textarea'
                  : sample === 'codemirror' ||
                      sample === 'codemirror-boundaries'
                    ? 'codemirror'
                    : undefined
              }
              label="Proposed document"
            />
            <ReviewCards authoring={authoring} />
          </section>
          {sharedViewCount === 8
            ? Array.from({ length: 6 }, (_, index) => {
                const label = `Markup observer ${index + 1}`;

                return (
                  <section
                    className="grid content-start gap-3"
                    data-authored-projection="markup"
                    data-authored-shared-view=""
                    key={label}
                  >
                    <h2 className="font-semibold">{label}</h2>
                    <EditorRoot
                      authored={{ intent: 'propose', projection: 'markup' }}
                      editor={editor}
                      readOnly
                      root={sample === 'named-root' ? 'notes' : undefined}
                    >
                      <ReviewEditable authoring={authoring} label={label} />
                    </EditorRoot>
                  </section>
                );
              })
            : null}
        </div>
      </EditorRoot>
      <section className="grid gap-3">
        <h2 className="font-semibold">Independent document</h2>
        <IndependentDocument authoring={authoring} />
      </section>
    </div>
  );
};

const AuthoredChangesExample = () => {
  const [sample, setSample] = useState<keyof typeof samples>('paragraphs');
  return (
    <div className="grid gap-6">
      <label className="flex items-center gap-3">
        Sample document
        <select
          aria-label="Sample document"
          className="rounded border p-2"
          value={sample}
          onChange={(event) => {
            const selected = event.target.value;
            if (
              selected === 'media-first' ||
              selected === 'media-last' ||
              selected === 'media-only' ||
              selected === 'atomics' ||
              selected === 'codemirror' ||
              selected === 'codemirror-boundaries' ||
              selected === 'external-text' ||
              selected === 'paragraphs' ||
              selected === 'quote-suffix' ||
              selected === 'quote-prefix' ||
              selected === 'two-quotes' ||
              selected === 'table-cell' ||
              selected === 'named-root' ||
              selected === 'link'
            ) {
              setSample(selected);
            }
          }}
        >
          {Object.entries(samples).map(([value, document]) => (
            <option key={value} value={value}>
              {document.label}
            </option>
          ))}
        </select>
      </label>
      <AuthoredChangesDocument key={sample} sample={sample} />
    </div>
  );
};

export default AuthoredChangesExample;
