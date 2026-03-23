'use client';

import * as React from 'react';

import {
  type DiffOperation,
  type DiffUpdate,
  computeDiff,
  withGetFragmentExcludeDiff,
} from '@platejs/diff';
import { cloneDeep } from 'lodash';
import { type Value, createSlatePlugin, KEYS } from 'platejs';
import { createPlatePlugin, toPlatePlugin, useSelected } from 'platejs/react';
import {
  type PlateElementProps,
  type PlateLeafProps,
  type PlateProps,
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
} from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BasicMarksKit } from '@/registry/components/editor/plugins/basic-marks-kit';
import { useDebounce } from '@/registry/hooks/use-debounce';

const InlinePlugin = createPlatePlugin({
  key: 'inline',
  node: { isElement: true, isInline: true },
});

const InlineVoidPlugin = createPlatePlugin({
  key: 'inline-void',
  node: { isElement: true, isInline: true, isVoid: true },
});

const diffOperationColors: Record<DiffOperation['type'], string> = {
  delete: 'bg-red-200/70 dark:bg-red-500/15',
  insert: 'bg-green-200/70 dark:bg-green-500/15',
  update: 'bg-sky-200/70 dark:bg-sky-500/15',
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
    node: { isLeaf: true },
  }).overrideEditor(withGetFragmentExcludeDiff),
  {
    render: {
      node: DiffLeaf,
      aboveNodes:
        () =>
        ({ children, editor, element }) => {
          if (!element.diff) return children;

          const diffOperation = element.diffOperation as DiffOperation;

          if (diffOperation.type === 'update') return children;

          const label =
            diffOperation.type === 'delete' ? 'deletion' : 'insertion';
          const Component = editor.api.isInline(element) ? 'span' : 'div';

          return (
            <Component
              className={diffOperationColors[diffOperation.type]}
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
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  const _Component = (
    {
      delete: 'del',
      insert: 'ins',
      update: 'span',
    } as any
  )[diffOperation.type];

  return (
    <PlateLeaf
      {...props}
      // as={Component}
      className={diffOperationColors[diffOperation.type]}
      attributes={{
        ...props.attributes,
        title:
          diffOperation.type === 'update'
            ? describeUpdate(diffOperation)
            : undefined,
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
      { children: [{ text: '' }], type: InlineVoidPlugin.key },
      { text: '. Try removing it.' },
    ],
    type: KEYS.p,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: 'editable inline' }], type: InlinePlugin.key },
      { text: '. Try editing it.' },
    ],
    type: KEYS.p,
  },
];

const plugins = [
  ...BasicMarksKit,
  InlinePlugin.withComponent(InlineElement),
  InlineVoidPlugin.withComponent(InlineVoidElement),
  DiffPlugin,
];

function VersionHistoryPlate(props: Omit<PlateProps, 'children'>) {
  return (
    <Plate {...props}>
      <PlateContent className="rounded-md border p-3" />
    </Plate>
  );
}

type DiffProps = {
  current: Value;
  previous: Value;
};

function Diff({ current, previous }: DiffProps) {
  const inlineEditor = usePlateEditor({ plugins });

  const diffValue = React.useMemo(() => {
    try {
      return computeDiff(previous, cloneDeep(current), {
        isInline: inlineEditor.api.isInline,
        lineBreakChar: '¶',
      }) as Value;
    } catch {
      return previous;
    }
  }, [previous, current, inlineEditor]);

  const editor = usePlateEditor(
    {
      plugins,
      value: diffValue,
    },
    [diffValue]
  );

  return <VersionHistoryPlate readOnly editor={editor} />;
}

export default function VersionHistoryDemo() {
  const [revisions, setRevisions] = React.useState<Value[]>(() => [
    cloneDeep(initialValue),
  ]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] =
    React.useState<number>(0);
  const [value, setValue] = React.useState<Value>(initialValue);

  const selectedRevisionValue = React.useMemo(
    () => revisions[selectedRevisionIndex],
    [revisions, selectedRevisionIndex]
  );

  const debouncedValue = useDebounce(value, 300);

  const saveRevision = () => {
    const next = [...revisions, cloneDeep(value)];
    setRevisions(next);
    setSelectedRevisionIndex(next.length - 1);
  };

  const editor = usePlateEditor({
    plugins,
    value: initialValue,
  });

  const editorRevision = usePlateEditor(
    {
      plugins,
      value: cloneDeep(selectedRevisionValue),
    },
    [selectedRevisionValue]
  );

  return (
    <div className="flex flex-col gap-3 p-3">
      <Button onClick={saveRevision}>Save revision</Button>

      <VersionHistoryPlate
        onValueChange={({ value }) => setValue(value)}
        editor={editor}
      />

      <label>
        Revision to compare:
        <select
          className="rounded-md border p-1"
          value={selectedRevisionIndex}
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
          <Diff current={debouncedValue} previous={selectedRevisionValue} />
        </div>
      </div>
    </div>
  );
}
