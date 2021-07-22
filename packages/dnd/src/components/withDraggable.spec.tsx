import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import { render } from '@testing-library/react';
import { Plate } from '@udecode/plate-core';
import { createParagraphPlugin } from '../../../elements/paragraph/src/createParagraphPlugin';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { createPlateComponents } from '../../../plate/src/utils/createPlateComponents';
import { createPlateOptions } from '../../../plate/src/utils/createPlateOptions';
import { withDraggable } from './withDraggable';

const options = createPlateOptions();
const components = createPlateComponents();
const initialValue = [
  {
    children: [
      {
        type: 'p',
        children: [{ text: 'test' }],
      },
    ],
  },
];

it('should render draggable component', () => {
  const _components = createPlateComponents({
    p: withDraggable(components[ELEMENT_PARAGRAPH]),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <Plate
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Draggable')).toBeInTheDocument();
});

// eslint-disable-next-line jest/no-commented-out-tests
// it('should filter based on level', () => {
//   const _components = createPlateComponents({
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
  const _components = createPlateComponents({
    p: withDraggable(components[ELEMENT_PARAGRAPH]),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <Plate
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
        editableProps={{ readOnly: true }}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Draggable')).not.toBeInTheDocument();
});

it('should be draggable in readOnly if allowReadOnly', () => {
  const _components = createPlateComponents({
    p: withDraggable(components[ELEMENT_PARAGRAPH], {
      allowReadOnly: true,
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <Plate
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Draggable')).toBeInTheDocument();
});
