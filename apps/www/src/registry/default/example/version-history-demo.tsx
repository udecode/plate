import React from 'react';
import { cn, withProps } from '@udecode/cn';
import {
  createBoldPlugin,
  createItalicPlugin,
  MARK_BOLD,
  MARK_ITALIC,
} from '@udecode/plate-basic-marks';
import {
  createPlateEditor,
  createPluginFactory,
  createPlugins,
  isInline,
  Plate,
  PlateContent,
  PlateElement,
  PlateElementProps,
  PlateLeaf,
  PlateLeafProps,
  PlateProps,
  Value,
} from '@udecode/plate-common';
import { computeDiff, DiffOperation, DiffUpdate, withGetFragmentExcludeDiff } from '@udecode/plate-diff';
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { useSelected } from 'slate-react';

import { Button } from '../plate-ui/button';
import { ParagraphElement } from '../plate-ui/paragraph-element';

const ELEMENT_INLINE = 'inline';

const createInlinePlugin = createPluginFactory({
  key: ELEMENT_INLINE,
  isElement: true,
  isInline: true,
});

const ELEMENT_INLINE_VOID = 'inlineVoid';

const createInlineVoidPlugin = createPluginFactory({
  key: ELEMENT_INLINE_VOID,
  isElement: true,
  isInline: true,
  isVoid: true,
});

const diffOperationColors: Record<DiffOperation['type'], string> = {
  insert: 'bg-green-200',
  delete: 'bg-red-200',
  update: 'bg-blue-200',
};

const describeUpdate = ({ properties, newProperties }: DiffUpdate) => {
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
      className="rounded-sm bg-slate-200/50 p-1"
      as="span"
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
        contentEditable={false}
        className={cn(
          'rounded-sm bg-slate-200/50 p-1',
          selected && 'bg-blue-500 text-white'
        )}
      >
        Inline void
      </span>
      {children}
    </PlateElement>
  );
};

const MARK_DIFF = 'diff';

const createDiffPlugin = createPluginFactory({
  key: MARK_DIFF,
  isLeaf: true,
  withOverrides: withGetFragmentExcludeDiff,
  inject: {
    aboveComponent:
      () =>
      ({ element, children, editor }) => {
        if (!element.diff) return children;
        const diffOperation = element.diffOperation as DiffOperation;

        const label = {
          insert: 'insertion',
          delete: 'deletion',
          update: 'update',
        }[diffOperation.type];

        const Component = isInline(editor, element) ? 'span' : 'div';

        return (
          <Component
            className={diffOperationColors[diffOperation.type]}
            aria-label={label}
            title={
              diffOperation.type === 'update'
                ? describeUpdate(diffOperation)
                : undefined
            }
          >
            {children}
          </Component>
        );
      },
  },
});

function DiffLeaf({ children, ...props }: PlateLeafProps) {
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  const Component = {
    insert: 'ins',
    delete: 'del',
    update: 'span',
  }[diffOperation.type] as React.ElementType;

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

const plugins = createPlugins(
  [
    createParagraphPlugin(),
    createInlinePlugin(),
    createInlineVoidPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createDiffPlugin(),
  ],
  {
    components: {
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [ELEMENT_INLINE]: InlineElement,
      [ELEMENT_INLINE_VOID]: InlineVoidElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
      [MARK_DIFF]: DiffLeaf,
    },
  }
);

const initialValue: Value = [
  {
    type: ELEMENT_PARAGRAPH,
    children: [{ text: 'This is a version history demo.' }],
  },
  {
    type: ELEMENT_PARAGRAPH,
    children: [
      { text: 'Try editing the ' },
      { text: 'text and see what', bold: true },
      { text: ' happens.' },
    ],
  },
  {
    type: ELEMENT_PARAGRAPH,
    children: [
      { text: 'This is an ' },
      { type: ELEMENT_INLINE_VOID, children: [{ text: '' }] },
      { text: '. Try removing it.' },
    ],
  },
  {
    type: ELEMENT_PARAGRAPH,
    children: [
      { text: 'This is an ' },
      { type: ELEMENT_INLINE, children: [{ text: 'editable inline' }] },
      { text: '. Try editing it.' },
    ],
  },
];

function VersionHistoryPlate(props: Omit<PlateProps, 'children' | 'plugins'>) {
  return (
    <Plate {...props} plugins={plugins}>
      <PlateContent className="rounded-md border p-3" />
    </Plate>
  );
}

interface DiffProps {
  previous: Value;
  current: Value;
}

function Diff({ previous, current }: DiffProps) {
  const diffValue = React.useMemo(() => {
    const editor = createPlateEditor({ plugins });
    return computeDiff(previous, current, {
      isInline: editor.isInline,
    }) as Value;
  }, [previous, current]);

  return (
    <>
      <VersionHistoryPlate
        key={JSON.stringify(diffValue)}
        value={diffValue}
        readOnly
      />

      <pre>{JSON.stringify(diffValue, null, 2)}</pre>
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

  return (
    <div className="flex flex-col gap-3 p-3">
      <Button onClick={saveRevision}>Save revision</Button>

      <VersionHistoryPlate initialValue={initialValue} onChange={setValue} />

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
            initialValue={selectedRevisionValue}
            readOnly
          />
        </div>

        <div>
          <h2>Diff</h2>
          <Diff previous={selectedRevisionValue} current={value} />
        </div>
      </div>
    </div>
  );
}
