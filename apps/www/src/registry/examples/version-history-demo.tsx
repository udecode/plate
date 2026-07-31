'use client';

import * as React from 'react';

import {
  type DiffIntent,
  type DiffUpdate,
  computeDiff,
  createExcludeDiffFragmentExtension,
} from '@platejs/diff';
import { property, schema } from 'platejs';
import { cloneDeep } from 'lodash';
import { type Value, createBasePlugin, KEYS } from 'platejs';
import {
  type PlateElementProps,
  type PlateLeafProps,
  type PlateProps,
  type PlateEditor,
  createPlateEditor,
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  createPlatePlugin,
  toPlatePlugin,
  useElementSelected,
  usePlateEditor,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BasicMarksKit } from '@/registry/components/editor/plugins/basic-marks-kit';

const InlinePlugin = createPlatePlugin({
  name: 'inline',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

const InlineVoidPlugin = createPlatePlugin({
  name: 'inline-void',
  schema: { element: { inline: true, void: 'inline' } },
});

const diffIntentColors: Record<DiffIntent['type'], string> = {
  delete: 'bg-red-200',
  insert: 'bg-green-200',
  update: 'bg-blue-200',
};

const describeUpdate = ({ newProperties, properties }: DiffUpdate) => {
  const addedProps: string[] = [];
  const removedProps: string[] = [];
  const updatedProps: string[] = [];

  Object.keys(newProperties).forEach((key) => {
    const oldValue = properties[key];
    const newValue = newProperties[key];

    if (oldValue === undefined) {
      addedProps.push(key);

      return;
    }
    if (newValue === undefined) {
      removedProps.push(key);

      return;
    }

    updatedProps.push(key);
  });

  const descriptionParts: string[] = [];

  if (addedProps.length > 0) {
    descriptionParts.push(`Added ${addedProps.join(', ')}`);
  }
  if (removedProps.length > 0) {
    descriptionParts.push(`Removed ${removedProps.join(', ')}`);
  }
  if (updatedProps.length > 0) {
    updatedProps.forEach((key) => {
      descriptionParts.push(
        `Updated ${key} from ${properties[key]} to ${newProperties[key]}`
      );
    });
  }

  return descriptionParts.join('\n');
};

const InlineElement = ({ children, ...props }: PlateElementProps) => (
  <PlateElement {...props} as="span" className="rounded-sm bg-slate-200/50 p-1">
    {children}
  </PlateElement>
);

const InlineVoidElement = ({ children, ...props }: PlateElementProps) => {
  const selected = useElementSelected();

  return (
    <PlateElement {...props} as="span">
      <span
        className={cn(
          'rounded-sm bg-slate-200/50 p-1',
          selected && 'bg-blue-500 text-white'
        )}
        contentEditable={false}
      >
        Inline void
      </span>
      {children}
    </PlateElement>
  );
};

const DiffPlugin = toPlatePlugin(
  createBasePlugin({
    name: 'diff',
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
  }).extend(createExcludeDiffFragmentExtension()),
  {
    component: DiffLeaf,
    render: {
      aboveNodes:
        () =>
        ({ children, editor, element }) => {
          if (!element.diff) return children;

          const diffIntent = element.diffIntent as DiffIntent;

          const label = (
            {
              delete: 'deletion',
              insert: 'insertion',
              update: 'update',
            } as const
          )[diffIntent.type];

          const Component = editor.read.schema.isInline(element)
            ? 'span'
            : 'div';

          return (
            <Component
              className={diffIntentColors[diffIntent.type]}
              title={
                diffIntent.type === 'update'
                  ? describeUpdate(diffIntent)
                  : undefined
              }
              aria-label={label}
            >
              {children}
            </Component>
          );
        },
    },
  }
);

function DiffLeaf({ children, ...props }: PlateLeafProps) {
  const diffIntent = props.leaf.diffIntent as DiffIntent;

  return (
    <PlateLeaf
      {...props}
      // as={Component}
      className={diffIntentColors[diffIntent.type]}
      attributes={{
        ...props.attributes,
        title:
          diffIntent.type === 'update' ? describeUpdate(diffIntent) : undefined,
      }}
    >
      {children}
    </PlateLeaf>
  );
}

const initialValue: Value = [
  {
    children: [{ text: 'This is a version history demo.' }],
    type: KEYS.p,
  },
  {
    children: [
      { text: 'Try editing the ' },
      { bold: true, text: 'text and see what' },
      { text: ' happens.' },
    ],
    type: KEYS.p,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: '' }], type: InlineVoidPlugin.name },
      { text: '. Try removing it.' },
    ],
    type: KEYS.p,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: 'editable inline' }], type: InlinePlugin.name },
      { text: '. Try editing it.' },
    ],
    type: KEYS.p,
  },
];

export const createVersionSnapshot = (value: Value): Value => cloneDeep(value);

const basePlugins = [
  ...BasicMarksKit,
  InlinePlugin.configure({ component: InlineElement }),
  InlineVoidPlugin.configure({ component: InlineVoidElement }),
];

const diffPlugins = [...basePlugins, DiffPlugin];

function VersionHistoryPlate<E extends PlateEditor>(
  props: Omit<PlateProps<E>, 'children'>
) {
  return (
    <Plate<E> {...props}>
      <PlateContent className="rounded-md border p-3" />
    </Plate>
  );
}

type DiffProps = {
  current: Value;
  previous: Value;
};

function Diff({ current, previous }: DiffProps) {
  const diffValue = React.useMemo(() => {
    const editor = createPlateEditor({
      plugins: diffPlugins,
    });

    return computeDiff(
      createVersionSnapshot(previous),
      createVersionSnapshot(current),
      {
        isInline: (node) => editor.read.schema.isInline(node),
        lineBreakChar: '¶',
      }
    ) as Value;
  }, [previous, current]);

  const editor = usePlateEditor(
    {
      plugins: diffPlugins,
      initialValue: diffValue,
    },
    [diffValue]
  );

  return (
    <>
      <VersionHistoryPlate
        key={JSON.stringify(diffValue)}
        readOnly
        editor={editor}
      />

      {/* <pre>{JSON.stringify(diffValue, null, 2)}</pre> */}
    </>
  );
}

export default function VersionHistoryDemo() {
  const [revisions, setRevisions] = React.useState<Value[]>(() => [
    createVersionSnapshot(initialValue),
  ]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] =
    React.useState<number>(0);
  const [value, setValue] = React.useState<Value>(() =>
    createVersionSnapshot(initialValue)
  );

  const selectedRevisionValue = React.useMemo(
    () => revisions[selectedRevisionIndex],
    [revisions, selectedRevisionIndex]
  );

  const saveRevision = () => {
    setRevisions([...revisions, createVersionSnapshot(value)]);
  };

  const editor = usePlateEditor({
    plugins: basePlugins,
    initialValue: createVersionSnapshot(initialValue),
  });

  const editorRevision = usePlateEditor(
    {
      plugins: basePlugins,
      initialValue: selectedRevisionValue,
    },
    [selectedRevisionValue]
  );

  return (
    <div className="flex flex-col gap-3 p-3">
      <Button onClick={saveRevision}>Save revision</Button>

      <VersionHistoryPlate
        onValueChange={({ value }) =>
          setValue(createVersionSnapshot(value.children))
        }
        editor={editor}
      />

      <label>
        Revision to compare:
        <select
          className="rounded-md border p-1"
          onChange={(e) => setSelectedRevisionIndex(Number(e.target.value))}
        >
          {revisions.map((_, i) => (
            <option key={i} value={i}>
              Revision {i + 1}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <h2>Revision {selectedRevisionIndex + 1}</h2>
          <VersionHistoryPlate
            key={selectedRevisionIndex}
            readOnly
            editor={editorRevision}
          />
        </div>

        <div>
          <h2>Diff</h2>
          <Diff current={value} previous={selectedRevisionValue} />
        </div>
      </div>
    </div>
  );
}
