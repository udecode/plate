import React from 'react';

import { createSoftBreakPlugin } from '@/../../../packages/break/dist';
import { cn, withProps } from '@udecode/cn';
import {
  MARK_BOLD,
  MARK_ITALIC,
  createBoldPlugin,
  createItalicPlugin,
} from '@udecode/plate-basic-marks';
import {
  Plate,
  PlateContent,
  PlateElement,
  type PlateElementProps,
  PlateLeaf,
  type PlateLeafProps,
  type PlateProps,
  type Value,
  createPlateEditor,
  createPluginFactory,
  createPlugins,
  isInline,
} from '@udecode/plate-common';
import {
  type DiffOperation,
  type DiffUpdate,
  computeDiff,
  withGetFragmentExcludeDiff,
} from '@udecode/plate-diff';
import {
  ELEMENT_PARAGRAPH,
  createParagraphPlugin,
} from '@udecode/plate-paragraph';
import { useSelected } from 'slate-react';

import { Button } from '@/registry/default/plate-ui/button';
import { ParagraphElement } from '@/registry/default/plate-ui/paragraph-element';

const ELEMENT_INLINE = 'inline';

const createInlinePlugin = createPluginFactory({
  isElement: true,
  isInline: true,
  key: ELEMENT_INLINE,
});

const ELEMENT_INLINE_VOID = 'inlineVoid';

const createInlineVoidPlugin = createPluginFactory({
  isElement: true,
  isInline: true,
  isVoid: true,
  key: ELEMENT_INLINE_VOID,
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

const MARK_DIFF = 'diff';

const createDiffPlugin = createPluginFactory({
  inject: {
    aboveComponent:
      () =>
      ({ children, editor, element }) => {
        if (!element.diff) return children;

        const diffOperation = element.diffOperation as DiffOperation;

        const label = {
          delete: 'deletion',
          insert: 'insertion',
          update: 'update',
        }[diffOperation.type];

        const Component = isInline(editor, element) ? 'span' : 'div';

        return (
          <Component
            aria-label={label}
            className={diffOperationColors[diffOperation.type]}
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
  isLeaf: true,
  key: MARK_DIFF,
  withOverrides: withGetFragmentExcludeDiff,
});

function DiffLeaf({ children, ...props }: PlateLeafProps) {
  const diffOperation = props.leaf.diffOperation as DiffOperation;

  const Component = {
    delete: 'del',
    insert: 'ins',
    update: 'span',
  }[diffOperation.type] as any;

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
    createSoftBreakPlugin(),
  ],
  {
    components: {
      [ELEMENT_INLINE]: InlineElement,
      [ELEMENT_INLINE_VOID]: InlineVoidElement,
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_DIFF]: DiffLeaf,
      [MARK_ITALIC]: withProps(PlateLeaf, { as: 'em' }),
    },
  }
);

const initialValue: Value = [
  {
    children: [{ text: 'This is a version history demo.' }],
    type: ELEMENT_PARAGRAPH,
  },
  {
    children: [
      { text: 'Try editing the ' },
      { bold: true, text: 'text and see what' },
      { text: ' happens.' },
    ],
    type: ELEMENT_PARAGRAPH,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: '' }], type: ELEMENT_INLINE_VOID },
      { text: '. Try removing it.' },
    ],
    type: ELEMENT_PARAGRAPH,
  },
  {
    children: [
      { text: 'This is an ' },
      { children: [{ text: 'editable inline' }], type: ELEMENT_INLINE },
      { text: '. Try editing it.' },
    ],
    type: ELEMENT_PARAGRAPH,
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
  current: Value;
  previous: Value;
}

function Diff({ current, previous }: DiffProps) {
  const diffValue = React.useMemo(() => {
    const editor = createPlateEditor({ plugins });

    return computeDiff(previous, current, {
      isInline: editor.isInline,
      lineBreakChar: '¶',
    }) as Value;
  }, [previous, current]);

  return (
    <>
      <VersionHistoryPlate
        key={JSON.stringify(diffValue)}
        readOnly
        value={diffValue}
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
            initialValue={selectedRevisionValue}
            key={selectedRevisionIndex}
            readOnly
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
