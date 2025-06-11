'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { createMultiEditorsValue } from '@/registry/examples/values/multi-editors-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const values = createMultiEditorsValue();

function WithPlate({ id, value }: any) {
  const editor = usePlateEditor({
    id,
    // components: PlateUI,
    // plugins: [BasicBlocksPlugin, BasicMarksPlugin],
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
