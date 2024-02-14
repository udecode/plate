import React from 'react';
import { cn, withProps } from '@udecode/cn';
import { createBoldPlugin, MARK_BOLD } from '@udecode/plate-basic-marks';
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
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '@udecode/plate-paragraph';
import { diffToSuggestions } from '@udecode/plate-suggestion';
import { useSelected } from 'slate-react';

import { Button } from '../plate-ui/button';
import { ParagraphElement } from '../plate-ui/paragraph-element';

const ELEMENT_INLINE_VOID = 'inlineVoid';

const createInlineVoidPlugin = createPluginFactory({
  key: ELEMENT_INLINE_VOID,
  isElement: true,
  isInline: true,
  isVoid: true,
});

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

const KEY_DIFF = 'diff';
const MARK_SUGGESTION = 'suggestion';

const createDiffPlugin = createPluginFactory({
  key: KEY_DIFF,
  plugins: [
    {
      key: MARK_SUGGESTION,
      isLeaf: true,
    },
  ],
  inject: {
    aboveComponent:
      () =>
      ({ element, children, editor }) => {
        if (!element.suggestion) return children;
        const Component = isInline(editor, element) ? 'span' : 'div';
        return (
          <Component
            className={
              element.suggestionDeletion ? 'bg-red-200' : 'bg-green-200'
            }
            aria-label={element.suggestionDeletion ? 'deletion' : 'insertion'}
          >
            {children}
          </Component>
        );
      },
  },
});

function SuggestionLeaf({ children, ...props }: PlateLeafProps) {
  const isDeletion = props.leaf.suggestionDeletion;
  const isUpdate = !isDeletion && !!props.leaf.suggestionUpdate;
  const Component = isDeletion ? 'del' : 'ins';

  return (
    <PlateLeaf {...props} asChild>
      <Component
        className={
          isDeletion ? 'bg-red-200' : isUpdate ? 'bg-blue-200' : 'bg-green-200'
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
    createInlineVoidPlugin(),
    createBoldPlugin(),
    createDiffPlugin(),
  ],
  {
    components: {
      [ELEMENT_PARAGRAPH]: ParagraphElement,
      [ELEMENT_INLINE_VOID]: InlineVoidElement,
      [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
      [MARK_SUGGESTION]: SuggestionLeaf,
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
  const diffValue: Value = React.useMemo(() => {
    const editor = createPlateEditor({ plugins });
    return diffToSuggestions(editor, previous, current);
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
