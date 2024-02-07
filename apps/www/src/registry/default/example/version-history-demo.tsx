import React from 'react';
import { Plate, PlateContent, PlateProps, Value, createPlugins, createPlateEditor, createPluginFactory, PlateLeafProps, PlateLeaf, PlateElementProps, PlateElement, isInline } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH, createParagraphPlugin } from '@udecode/plate-paragraph';
import {ParagraphElement} from '../plate-ui/paragraph-element';
import {Button} from '../plate-ui/button';
import {slateDiff, applyDiffToSuggestions} from '@udecode/plate-suggestion';
import { createBoldPlugin, MARK_BOLD } from '@udecode/plate-basic-marks';
import {cn, withProps} from '@udecode/cn';
import {useSelected} from 'slate-react';

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
          'p-1 bg-slate-200 rounded-sm',
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
    aboveComponent: () => ({ element, children, editor }) => {
      if (!element.suggestion) return children;
      const Component = isInline(editor, element) ? 'span' : 'div';
      return (
        <Component
          className={element.suggestionDeletion ? 'bg-red-200' : 'bg-green-200'}
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
  const isUpdate = !isDeletion && props.leaf.suggestionUpdate;
  const Component = isDeletion ? 'del' : 'ins';

  return (
    <PlateLeaf {...props} asChild>
      <Component className={isDeletion ? 'bg-red-200' : (isUpdate ? 'bg-blue-200' : 'bg-green-200')}>
        {children}
      </Component>
    </PlateLeaf>
  );
}

const plugins = createPlugins([
  createParagraphPlugin(),
  createInlineVoidPlugin(),
  createBoldPlugin(),
  createDiffPlugin(),
], {
  components: {
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [ELEMENT_INLINE_VOID]: InlineVoidElement,
    [MARK_BOLD]: withProps(PlateLeaf, { as: 'strong' }),
    [MARK_SUGGESTION]: SuggestionLeaf,
  },
});

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
      { text: ' happens.' }
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
      <PlateContent className="border rounded-md p-3" />
    </Plate>
  );
}

interface DiffProps {
  previous: Value;
  current: Value;
}

function Diff({ previous, current }: DiffProps) {
  const operations = React.useMemo(() => slateDiff(previous, current), [previous, current]);

  const diffValue: Value = React.useMemo(() => {
    const editor = createPlateEditor({ plugins });
    editor.children = previous;
    applyDiffToSuggestions(editor, operations);
    return editor.children;
  }, [previous, current]);

  return (
    <>
      <VersionHistoryPlate key={JSON.stringify(diffValue)} value={diffValue} readOnly />

      <pre>
        {JSON.stringify(operations, null, 2)}
      </pre>

      <pre>
        {JSON.stringify(diffValue, null, 2)}
      </pre>
    </>
  );
}

export default function VersionHistoryDemo() {
  const [revisions, setRevisions] = React.useState<Value[]>([initialValue]);
  const [selectedRevisionIndex, setSelectedRevisionIndex] = React.useState<number>(0);
  const [value, setValue] = React.useState<Value>(initialValue);

  const selectedRevisionValue = React.useMemo(() => revisions[selectedRevisionIndex], [revisions, selectedRevisionIndex]);

  const saveRevision = () => {
    setRevisions([...revisions, value]);
  };

  return (
    <div className="p-3 flex flex-col gap-3">
      <Button onClick={saveRevision}>Save revision</Button>

      <VersionHistoryPlate initialValue={initialValue} onChange={setValue} />

      <label>
        Revision to compare:
        <select className="border rounded-md p-1" onChange={(e) => setSelectedRevisionIndex(Number(e.target.value))}>
          {revisions.map((_, i) => (
            <option key={i} value={i}>
              Revision {i + 1}
            </option>
          ))}
        </select>
      </label>

      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <h2>Revision {selectedRevisionIndex + 1}</h2>
          <VersionHistoryPlate key={selectedRevisionIndex} initialValue={selectedRevisionValue} readOnly />
        </div>

        <div>
          <h2>Diff</h2>
          <Diff previous={selectedRevisionValue} current={value} />
        </div>
      </div>
    </div>
  );
}
