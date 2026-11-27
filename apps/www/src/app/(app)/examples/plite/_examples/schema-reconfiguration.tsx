'use client';

import {
  defineEditorSchema,
  definePluginSlot,
  ElementApi,
  schema,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  type RenderElementProps,
  useEditor,
  useEditorSelector,
  useCreateEditor,
} from 'plitejs/react';

type SchemaProfile =
  | 'block'
  | 'non-selectable'
  | 'read-only'
  | 'read-only-block'
  | 'void';

const profileVersions: Record<SchemaProfile, number> = {
  block: 1,
  'non-selectable': 5,
  'read-only': 4,
  'read-only-block': 2,
  void: 3,
};

const schemaSlot = definePluginSlot('schema-reconfiguration');

const createSchema = (profile: SchemaProfile) =>
  defineEditorSchema('schemaReconfigurationProofSchema', {
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
      line: schema.element.textBlock(),
      probe:
        profile === 'void'
          ? { void: 'block' }
          : {
              content: schema.content.text({ default: 'text', min: 1 }),
              readOnly: profile === 'read-only-block',
            },
    },
    id: 'schema-reconfiguration-browser-proof',
    root: schema.content.types(['content-card', 'line', 'probe'], {
      default: { type: 'probe' },
      min: 1,
    }),
    roots: {
      notes: schema.content.types(['line', 'probe'], {
        default: { type: 'probe' },
        min: 1,
      }),
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

const ProbeElement = ({
  attributes,
  children,
  element,
}: Pick<RenderElementProps, 'attributes' | 'children' | 'element'>) => {
  const isReadOnly = useEditorSelector(
    (current) => current.read.schema.getElementBehavior(element).readOnly
  );

  return (
    <div {...attributes} data-probe-read-only={isReadOnly ? 'true' : undefined}>
      <span contentEditable={false}>probe</span>
      {children}
    </div>
  );
};

const renderElement = ({
  attributes,
  children,
  element,
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

  return (
    <ProbeElement attributes={attributes} element={element}>
      {children}
    </ProbeElement>
  );
};

const renderVoid = () => (
  <span data-test-id="schema-reconfiguration-void">void probe</span>
);

const SchemaControls = () => {
  const editor = useEditor();
  const status = useEditorSelector((current) => {
    const probe = current.read.nodes.get([0])?.[0];
    const guard = current.read.nodes.get([1, 1])?.[0];

    if (!ElementApi.isElement(probe) || !ElementApi.isElement(guard)) {
      return 'missing';
    }

    const probeBehavior = current.read.schema.getElementBehavior(probe);
    const guardBehavior = current.read.schema.getElementBehavior(guard);
    const commit = current.read.lastCommit();

    return [
      `probeReadOnly:${probeBehavior.readOnly}`,
      `void:${probeBehavior.void}`,
      `readOnly:${guardBehavior.readOnly}`,
      `selectable:${guardBehavior.selectable}`,
      `document:${commit?.changes.empty ? 'unchanged' : 'initial'}`,
    ].join(';');
  });
  const document = useEditorSelector((current) =>
    JSON.stringify(current.read.value())
  );
  const applyProfile = (profile: SchemaProfile) => {
    editor.update.plugins.reconfigure(schemaSlot, createSchema(profile));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2" contentEditable={false}>
        {(
          [
            ['Use block schema', 'block'],
            ['Use read-only block schema', 'read-only-block'],
            ['Use void schema', 'void'],
            ['Use read-only schema', 'read-only'],
            ['Use non-selectable schema', 'non-selectable'],
          ] as const
        ).map(([label, profile]) => (
          <button
            className="rounded border px-3 py-1"
            key={profile}
            onClick={() => {
              applyProfile(profile);
            }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <output
        className="wrap-anywhere"
        data-test-id="schema-reconfiguration-status"
      >
        {status}
      </output>
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
  const editor = useCreateEditor({
    plugins: [history(), schemaSlot.of(createSchema('block'))] as const,
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
    <EditorRoot editor={editor}>
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
    </EditorRoot>
  );
};

export default SchemaReconfigurationExample;
