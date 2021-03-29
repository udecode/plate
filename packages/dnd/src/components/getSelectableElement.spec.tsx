import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import { render } from '@testing-library/react';
import { SlatePlugins } from '@udecode/slate-plugins-core';
import { createParagraphPlugin } from '../../../elements/paragraph/src/createParagraphPlugin';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { createSlatePluginsComponents } from '../../../slate-plugins/src/utils/createSlatePluginsComponents';
import { createSlatePluginsOptions } from '../../../slate-plugins/src/utils/createSlatePluginsOptions';
import { getSelectableElement } from './getSelectableElement';

const options = createSlatePluginsOptions();
const components = createSlatePluginsComponents();
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
  const _components = createSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).toBeInTheDocument();
});

// eslint-disable-next-line jest/no-commented-out-tests
// it('should filter based on level', () => {
//   const _components = createSlatePluginsComponents({
//     p: getSelectableElement({
//       component: components[ELEMENT_PARAGRAPH],
//       level: 0,
//     }),
//   });
//
//   const { container } = render(
//     <DndProvider backend={TestBackend}>
//       <SlatePlugins
//         plugins={[createParagraphPlugin()]}
//         options={options}
//         components={_components}
//         initialValue={[{ children: initialValue }]}
//       />
//     </DndProvider>
//   );
//   expect(container.querySelector('.slate-Selectable')).not.toBeInTheDocument();
// });

it('should not be draggable if readOnly', () => {
  const _components = createSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
        editableProps={{ readOnly: true }}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).not.toBeInTheDocument();
});

it('should be draggable in readOnly if allowReadOnly', () => {
  const _components = createSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
      allowReadOnly: true,
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[createParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).toBeInTheDocument();
});
