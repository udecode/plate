import React, { useCallback, useMemo, useState } from 'react';
import { Plate } from '@udecode/plate';
import { createEditor } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { createMultiEditorsValue } from './multiple-editors/createMultiEditorsValue';

const initialValues = createMultiEditorsValue();

const WithPlate = ({ initialValue, id }: any) => (
  <Plate
    id={id}
    editableProps={editableProps}
    initialValue={initialValue}
    plugins={basicNodesPlugins}
  />
);

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'h1':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const WithoutPlate = ({ initialValue }: any) => {
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((p) => <Element {...p} />, []);
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={useCallback((v) => setValue(v), [])}
    >
      <Editable renderElement={renderElement} {...(editableProps as any)} />
    </Slate>
  );
};

const styles = {
  wrapper: { border: '1px solid cyan', marginBottom: '20px' },
};

export default () => (
  <div className="flex">
    {initialValues.map((initialValue, idx) => {
      return (
        <div style={styles.wrapper} key={idx}>
          <div>{idx}</div>
          <WithPlate initialValue={initialValue} id={idx} />
          {/* <WithoutPlate initialValue={initialValue} id={idx} /> */}
        </div>
      );
    })}
  </div>
);
