'use client';

import {
  defineEditorSchema,
  defineExtensionSlot,
  ElementApi,
  schema,
} from '@platejs/plite';
import {
  Editable,
  Plite,
  type RenderElementProps,
  type RenderVoidProps,
  useEditor,
  useNodeSelector,
  useEditorState,
  usePliteEditor,
} from '@platejs/plite-react';

type SchemaProfile =
  | 'block'
  | 'editable-island'
  | 'inline'
  | 'non-selectable'
  | 'read-only'
  | 'void';

const profileVersions: Record<SchemaProfile, number> = {
  block: 1,
  'editable-island': 6,
  inline: 2,
  'non-selectable': 5,
  'read-only': 4,
  void: 3,
};

const schemaSlot = defineExtensionSlot('schema-reconfiguration');

const createSchema = (profile: SchemaProfile) =>
  defineEditorSchema({
    elements: {
      'content-card': {
        content: schema.content.text({ default: 'text', min: 1 }),
        contentRoots: {
          body: schema.content.types(['line', 'probe'], {
            default: { type: 'probe' },
            min: 1,
          }),
        },
      },
      guard: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        readOnly: profile === 'read-only',
        selectable: profile !== 'non-selectable',
      },
      line: {
        content: schema.content.open({ default: 'text', min: 1 }),
      },
      probe:
        profile === 'void'
          ? { void: 'block' }
          : profile === 'editable-island'
            ? {
                content: schema.content.text({ default: 'text', min: 1 }),
                void: 'editable-island',
              }
            : {
                content: schema.content.text({ default: 'text', min: 1 }),
                inline: profile === 'inline',
              },
    },
    id: 'schema-reconfiguration-browser-proof',
    root: {
      content: schema.content.types(['content-card', 'line', 'probe'], {
        default: { type: 'probe' },
        min: 1,
      }),
    },
    roots: {
      notes: {
        content: schema.content.types(['line', 'probe'], {
          default: { type: 'probe' },
          min: 1,
        }),
      },
    },
    unknown: 'reject',
    version: profileVersions[profile],
  });

const emptyProbe = () => ({ children: [{ text: '' }], type: 'probe' });
const interactionLine = () => ({
  children: [
    { text: 'before' },
    { children: [{ text: 'guard' }], type: 'guard' },
    { text: 'after' },
  ],
  type: 'line',
});

const renderElement = ({
  attributes,
  children,
  element,
  isInline,
  slots,
}: RenderElementProps) => {
  if (element.type === 'content-card') {
    return (
      <section {...attributes} data-test-id="schema-reconfiguration-card">
        <span contentEditable={false}>Projected root</span>
        {slots.contentRoot('body', {
          ariaLabel: 'Projected root editor',
          id: 'schema-reconfiguration-projected',
        })}
      </section>
    );
  }

  if (element.type === 'line') {
    return <p {...attributes}>{children}</p>;
  }

  if (element.type === 'guard') {
    return (
      <span {...attributes} data-test-id="schema-reconfiguration-guard">
        {children}
      </span>
    );
  }

  const Tag = isInline ? 'span' : 'div';

  return (
    <Tag {...attributes}>
      <span contentEditable={false}>probe</span>
      {children}
    </Tag>
  );
};

const SchemaVoid = ({ element }: RenderVoidProps) => {
  const editableIsland = useNodeSelector(({ editor }) =>
    editor.read.schema.isEditableIsland(element)
  );

  if (editableIsland) {
    return (
      <div data-test-id="schema-reconfiguration-void">
        <span contentEditable={false}>editable-island probe</span>
        <input
          aria-label="Editable island nested editor"
          data-test-id="schema-reconfiguration-island"
          defaultValue="nested target"
        />
      </div>
    );
  }

  return <span data-test-id="schema-reconfiguration-void">void probe</span>;
};

const renderVoid = (props: RenderVoidProps) => <SchemaVoid {...props} />;

const SchemaControls = () => {
  const editor = useEditor();
  const status = useEditorState((state) => {
    const probe = state.nodes.get([0])?.[0];
    const guard = state.nodes.get([1, 1])?.[0];

    if (!ElementApi.isElement(probe) || !ElementApi.isElement(guard)) {
      return 'missing';
    }

    const probeBehavior = state.schema.getElementBehavior(probe);
    const guardBehavior = state.schema.getElementBehavior(guard);
    const commit = state.lastCommit();

    return [
      `inline:${probeBehavior.inline}`,
      `void:${probeBehavior.void}`,
      `editableIsland:${probeBehavior.editableIsland}`,
      `readOnly:${guardBehavior.readOnly}`,
      `selectable:${guardBehavior.selectable}`,
      `document:${commit?.changes.empty ? 'unchanged' : 'initial'}`,
    ].join(';');
  });
  const document = useEditorState((state) => JSON.stringify(state.value()));
  const applyProfile = (profile: SchemaProfile) => {
    editor.update.extensions.reconfigure(schemaSlot, createSchema(profile));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2" contentEditable={false}>
        {(
          [
            ['Use block schema', 'block'],
            ['Use inline schema', 'inline'],
            ['Use void schema', 'void'],
            ['Use editable-island schema', 'editable-island'],
            ['Use read-only schema', 'read-only'],
            ['Use non-selectable schema', 'non-selectable'],
          ] as const
        ).map(([label, profile]) => (
          <button
            className="rounded border px-3 py-1"
            key={profile}
            onClick={() => applyProfile(profile)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <output data-test-id="schema-reconfiguration-status">{status}</output>
      <output
        className="sr-only"
        data-test-id="schema-reconfiguration-document"
      >
        {document}
      </output>
    </>
  );
};

const SchemaReconfigurationExample = () => {
  const editor = usePliteEditor({
    extensions: [schemaSlot.of(createSchema('block'))] as const,
    initialValue: {
      children: [
        emptyProbe(),
        interactionLine(),
        {
          childRoots: { body: 'schema-reconfiguration:card:body' },
          children: [{ text: '' }],
          type: 'content-card',
        },
      ],
      roots: {
        'schema-reconfiguration:card:body': [emptyProbe(), interactionLine()],
        notes: [emptyProbe(), interactionLine()],
      },
    },
  });

  return (
    <Plite editor={editor}>
      <div className="flex flex-col gap-4">
        <SchemaControls />
        <Editable
          aria-label="Primary root editor"
          id="schema-reconfiguration-main"
          renderElement={renderElement}
          renderVoid={renderVoid}
        />
        <Editable
          aria-label="Named root editor"
          id="schema-reconfiguration-notes"
          renderElement={renderElement}
          renderVoid={renderVoid}
          root="notes"
        />
      </div>
    </Plite>
  );
};

export default SchemaReconfigurationExample;
