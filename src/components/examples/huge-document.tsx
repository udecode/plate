import React, { useCallback, useMemo } from 'react';
import faker from 'faker';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import { CustomElementProps } from 'slate-react/lib/components/custom';

const HEADINGS = 100;
const PARAGRAPHS = 7;
const initialValue: any = [];

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: 'heading',
    children: [{ text: faker.lorem.sentence(), marks: [] }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      children: [{ text: faker.lorem.paragraph(), marks: [] }],
    });
  }
}

const Element = ({ attributes, children, element }: CustomElementProps) => {
  switch (element.type) {
    case 'heading':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const HugeDocument = () => {
  const renderElement = useCallback(props => <Element {...props} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);
  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Editable renderElement={renderElement} spellCheck autoFocus />
    </Slate>
  );
};
