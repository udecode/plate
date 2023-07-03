import React from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createMultiEditorsValue } from '@/plate/demo/values/createMultiEditorsValue';
import { Plate } from '@udecode/plate-common';

import { MyValue } from '@/types/plate-types';

const initialValues = createMultiEditorsValue();

function WithPlate({ initialValue, id }: any) {
  return (
    <Plate<MyValue>
      id={id}
      editableProps={editableProps}
      initialValue={initialValue}
      plugins={basicNodesPlugins}
    />
  );
}

// function Element({ attributes, children, element }: any) {
//   switch (element.type) {
//     case 'h1':
//       return <h1 {...attributes}>{children}</h1>;
//     default:
//       return <p {...attributes}>{children}</p>;
//   }
// }

// function WithoutPlate({ initialValue }: any) {
//   const [value, setValue] = useState(initialValue);
//   const renderElement = useCallback((p) => <Element {...p} />, []);
//   const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);
//
//   return (
//     <Slate
//       editor={editor}
//       value={value}
//       onChange={useCallback((v) => setValue(v), [])}
//     >
//       <Editable renderElement={renderElement} {...(editableProps as any)} />
//     </Slate>
//   );
// }

const styles = {
  wrapper: { border: '1px solid black', marginBottom: '20px', padding: 4 },
};

export default function HundredsEditorsDemo() {
  return (
    <div className="flex flex-col">
      {initialValues.map((initialValue, idx) => {
        return (
          <div style={styles.wrapper} key={idx}>
            <div>{idx}</div>
            <WithPlate initialValue={initialValue} id={idx + 1} />
            {/* <WithoutPlate initialValue={initialValue} id={idx} /> */}
          </div>
        );
      })}
    </div>
  );
}
