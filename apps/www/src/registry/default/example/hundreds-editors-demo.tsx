import React from 'react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import { Plate, usePlateEditor } from '@udecode/plate-common';

import { editableProps } from '@/plate/demo/editableProps';
import { PlateUI } from '@/plate/demo/plate-ui';
import { createMultiEditorsValue } from '@/plate/demo/values/createMultiEditorsValue';
import { Editor } from '@/registry/default/plate-ui/editor';

const initialValues = createMultiEditorsValue();

function WithPlate({ id, initialValue }: any) {
  const editor = usePlateEditor({
    id,
    override: { components: PlateUI },
    plugins: [BasicElementsPlugin, BasicMarksPlugin],
  });

  return (
    <Plate editor={editor} initialValue={initialValue}>
      <Editor {...editableProps} />
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
      {initialValues.map((initialValue, idx) => {
        return (
          <div className="p-10" key={idx}>
            <h3 className="mb-2 font-semibold">#{idx + 1}</h3>
            <WithPlate id={idx + 1} initialValue={initialValue} />
            {/* <WithoutPlate initialValue={initialValue} id={idx} /> */}
          </div>
        );
      })}
    </div>
  );
}
