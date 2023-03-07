import React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import { render } from '@testing-library/react';
import { Plate, Value } from '@udecode/plate-common';
import {
  createParagraphPlugin,
  ELEMENT_PARAGRAPH,
} from '../../../nodes/paragraph/src/createParagraphPlugin';
import { createPlateUI } from '../../plate/src/utils/createPlateUI';
import { withPlateDraggable } from './withPlateDraggable';

const components = createPlateUI();
const initialValue: Value = [
  {
    type: 'a',
    children: [
      {
        type: 'p',
        children: [{ text: 'test' }],
      },
    ],
  },
];

// eslint-disable-next-line jest/no-commented-out-tests
// it('should filter based on level', () => {
//   const _components = createPlateUI({
//     p: getDraggableElement({
//       component: components[ELEMENT_PARAGRAPH],
//       level: 0,
//     }),
//   });
//
//   const { container } = render(
//     <DndProvider backend={TestBackend}>
//       <Plate
//         plugins={[createParagraphPlugin()]}
//         options={options}
//         components={_components}
//         initialValue={[{ children: initialValue }]}
//       />
//     </DndProvider>
//   );
//   expect(container.querySelector('.slate-Draggable')).not.toBeInTheDocument();
// });

it('should not be draggable if readOnly', () => {
  const { container } = render(
    <DndProvider backend={TestBackend}>
      <Plate
        plugins={[
          createParagraphPlugin({
            component: withPlateDraggable(components[ELEMENT_PARAGRAPH]),
          }),
        ]}
        initialValue={initialValue}
        editableProps={{ readOnly: true }}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Draggable')).not.toBeInTheDocument();
});

// it('should be draggable in readOnly if allowReadOnly', () => {
//   const { container } = render(
//     <DndProvider backend={TestBackend}>
//       <Plate
//         plugins={[
//           createParagraphPlugin({
//             component: withDraggable(components[ELEMENT_PARAGRAPH], {
//               allowReadOnly: true,
//             }),
//           }),
//         ]}
//         initialValue={initialValue}
//       />
//     </DndProvider>
//   );
//   expect(container.querySelector('.slate-Draggable')).toBeInTheDocument();
// });
