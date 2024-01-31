import React from 'react';
import { Plate, PlateContent, PlateProps, Value, createPlugins, createPlateEditor, createPluginFactory, PlateLeafProps, PlateLeaf } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH, createParagraphPlugin } from '@udecode/plate-paragraph';
import {ParagraphElement} from '../plate-ui/paragraph-element';
import {Button} from '../plate-ui/button';
import {slateDiff, applyDiffToSuggestions} from '@udecode/plate-suggestion';

const initialValue: Value = [
  {
    type: ELEMENT_PARAGRAPH,
    children: [{ text: 'This is a version history demo.' }],
  },
  {
    type: ELEMENT_PARAGRAPH,
    children: [{ text: 'Try editing the text and see what happens.' }],
  },
];

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
    aboveComponent: () => ({ element, children }) => {
      if (!element.suggestion) return children;
      return (
        <div
          className={element.suggestionDeletion ? 'bg-red-200' : 'bg-green-200'}
          aria-label={element.suggestionDeletion ? 'deletion' : 'insertion'}
        >
          {children}
        </div>
      );
    },
  },
});

function SuggestionLeaf({ children, ...props }: PlateLeafProps) {
  const isDeletion = props.leaf.suggestionDeletion;
  const Component = isDeletion ? 'del' : 'ins';

  return (
    <PlateLeaf {...props} asChild>
      <Component>{children}</Component>
    </PlateLeaf>
  );
}

const plugins = createPlugins([
  createParagraphPlugin(),
  createDiffPlugin(),
], {
  components: {
    [ELEMENT_PARAGRAPH]: ParagraphElement,
    [MARK_SUGGESTION]: SuggestionLeaf,
  },
});

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
  const diffValue: Value = React.useMemo(() => {
    const operations = slateDiff(previous, current);
    const editor = createPlateEditor();
    editor.children = previous;
    applyDiffToSuggestions(editor, operations);
    return editor.children;
  }, [previous, current]);

  return (
    <>
      <VersionHistoryPlate key={JSON.stringify(diffValue)} value={diffValue} readOnly />

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
