import React from 'react';

import { cn } from '@udecode/cn';
import { BoldPlugin, ItalicPlugin } from '@udecode/plate-basic-marks/react';
import { SoftBreakPlugin } from '@udecode/plate-break/react';
import { type Value, createSlatePlugin, isInline } from '@udecode/plate-common';
import {
  ParagraphPlugin,
  createPlatePlugin,
  toPlatePlugin,
} from '@udecode/plate-common/react';
import {
  type PlateElementProps,
  type PlateLeafProps,
  type PlateProps,
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  createPlateEditor,
  usePlateEditor,
} from '@udecode/plate-common/react';
import {
  type DiffOperation,
  type DiffUpdate,
  computeDiff,
  withGetFragmentExcludeDiff,
} from '@udecode/plate-diff';
import { cloneDeep } from 'lodash';
import { useSelected } from 'slate-react';

import { PlateUI } from '@/lib/plate/demo/plate-ui';
import { Button } from '@/registry/default/plate-ui/button';

const InlinePlugin = createPlatePlugin({
  key: 'inline',
  node: { isElement: true, isInline: true },
});

const InlineVoidPlugin = createPlatePlugin({
  key: 'inline-void',
  node: { isElement: true, isInline: true, isVoid: true },
});

const diffOperationColors: Record<DiffOperation['type'], string> = {
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

  const descriptionParts = [];

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

const InlineElement = ({ children, ...props }: PlateElementProps) => {
  return (
    <PlateElement
      {...props}
      as="span"
      className="rounded-sm bg-slate-200/50 p-1"
    >
      {children}
    </PlateElement>
  );
};

const InlineVoidElement = ({ children, ...props }: PlateElementProps) => {
  const selected = useSelected();

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
  createSlatePlugin({
    key: 'diff',
    extendEditor: withGetFragmentExcludeDiff,
    node: { isLeaf: true },
  }),
  {
    render: {
      aboveNodes:
        () =>
        ({ children, editor, element }) => {
          if (!element.diff) return children;

          const diffOperation = element.diffOperation as DiffOperation;

          const label = (
            {
              delete: 'deletion',
              insert: 'insertion',
              update: 'update',
            } as any
          )[diffOperation.type];

          const Component = isInline(editor, element) ? 'span' : 'div';

          return (
            <Component
              className={diffOperationColors[diffOperation.type]}
              title={
                diffOperation.type === 'update'
                  ? describeUpdate(diffOperation)
                  : undefined
              }
              aria-label={label}
            >
              {children}
            </Component>
          );
        },
      node: DiffLeaf,
    },
  }
);

function DiffLeaf({ children, ...props }: PlateLeafProps) {
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  const Component = (
    {
      delete: 'del',
      insert: 'ins',
      update: 'span',
    } as any
  )[diffOperation.type];

  return (
    <PlateLeaf {...props} asChild>
      <Component
        className={diffOperationColors[diffOperation.type]}
        title={
          diffOperation.type === 'update'
            ? describeUpdate(diffOperation)
            : undefined
        }
      >
        {children}
      </Component>
    </PlateLeaf>
  );
}

const initialValue: Value = [
  {
    children: [{ text: 'This is a version history demo.' }],
    type: ParagraphPlugin.key,
  },
  {
    children: [
      { text: 'Try editing the ' },
      { bold: true, text: 'text and see what' },
      { text: ' happens.' },
    ],
    type: ParagraphPlugin.key,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: '' }], type: InlineVoidPlugin.key },
      { text: '. Try removing it.' },
    ],
    type: ParagraphPlugin.key,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: 'editable inline' }], type: InlinePlugin.key },
      { text: '. Try editing it.' },
    ],
    type: ParagraphPlugin.key,
  },
];

const plugins = [
  InlinePlugin.withComponent(InlineElement),
  InlineVoidPlugin.withComponent(InlineVoidElement),
  BoldPlugin,
  ItalicPlugin,
  DiffPlugin,
  SoftBreakPlugin,
];

function VersionHistoryPlate(props: Omit<PlateProps, 'children'>) {
  return (
    <Plate {...props}>
      <PlateContent className="rounded-md border p-3" />
    </Plate>
  );
}

interface DiffProps {
  current: Value;
  previous: Value;
}

function Diff({ current, previous }: DiffProps) {
  const diffValue = React.useMemo(() => {
    const editor = createPlateEditor({
      plugins,
    });

    return computeDiff(previous, cloneDeep(current), {
      isInline: editor.isInline,
      lineBreakChar: '¶',
    }) as Value;
  }, [previous, current]);

  const editor = usePlateEditor(
    {
      override: { components: PlateUI },
      plugins,
      value: diffValue,
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
  const [revisions, setRevisions] = React.useState<Value[]>([initialValue]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] =
    React.useState<number>(0);
  const [value, setValue] = React.useState<Value>(initialValue);

  const selectedRevisionValue = React.useMemo(
    () => revisions[selectedRevisionIndex],
    [revisions, selectedRevisionIndex]
  );

  const saveRevision = () => {
    setRevisions([...revisions, value]);
  };

  const editor = usePlateEditor({
    override: { components: PlateUI },
    plugins,
    value: initialValue,
  });

  const editorRevision = usePlateEditor(
    {
      override: { components: PlateUI },
      plugins,
      value: selectedRevisionValue,
    },
    [selectedRevisionValue]
  );

  return (
    <div className="flex flex-col gap-3 p-3">
      <Button onClick={saveRevision}>Save revision</Button>

      <VersionHistoryPlate
        onChange={({ value }) => setValue(value)}
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
