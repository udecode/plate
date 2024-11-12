'use client';

import React from 'react';

import { Plate, usePlateEditor } from '@udecode/plate-common/react';

import { createMultiEditorsValue } from '@/plate/demo/values/createMultiEditorsValue';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

const values = createMultiEditorsValue();

function WithPlate({ id, value }: any) {
  const editor = usePlateEditor({
    id,
    // override: { components: PlateUI },
    // plugins: [BasicElementsPlugin, BasicMarksPlugin],
    value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor spellCheck={false} />
      </EditorContainer>
    </Plate>
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
//       <Editable renderElement={renderElement} />
//     </Slate>
//   );
// }

export default function HundredsEditorsDemo() {
  return (
    <div className="flex flex-col">
      {values.map((value, idx) => {
        return (
          <div key={idx} className="p-10">
            <h3 className="mb-2 font-semibold">#{idx + 1}</h3>
            <WithPlate id={idx + 1} value={value} />
            {/* <WithoutPlate initialValue={initialValue} id={idx} /> */}
          </div>
        );
      })}
    </div>
  );
}
