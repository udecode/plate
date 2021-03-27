import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import { render } from '@testing-library/react';
import { SlatePlugins } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { getParagraphPlugin } from '../../../elements/paragraph/src/getParagraphPlugin';
import { getSlatePluginsComponents } from '../../../slate-plugins/src/utils/getSlatePluginsComponents';
import { getSlatePluginsOptions } from '../../../slate-plugins/src/utils/getSlatePluginsOptions';
import { getSelectableElement } from './getSelectableElement';

const options = getSlatePluginsOptions();
const components = getSlatePluginsComponents();
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
  const _components = getSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[getParagraphPlugin()]}
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
//   const _components = getSlatePluginsComponents({
//     p: getSelectableElement({
//       component: components[ELEMENT_PARAGRAPH],
//       level: 0,
//     }),
//   });
//
//   const { container } = render(
//     <DndProvider backend={TestBackend}>
//       <SlatePlugins
//         plugins={[getParagraphPlugin()]}
//         options={options}
//         components={_components}
//         initialValue={[{ children: initialValue }]}
//       />
//     </DndProvider>
//   );
//   expect(container.querySelector('.slate-Selectable')).not.toBeInTheDocument();
// });

it('should not be draggable if readOnly', () => {
  const _components = getSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[getParagraphPlugin()]}
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
  const _components = getSlatePluginsComponents({
    p: getSelectableElement({
      component: components[ELEMENT_PARAGRAPH],
      allowReadOnly: true,
    }),
  });

  const { container } = render(
    <DndProvider backend={TestBackend}>
      <SlatePlugins
        plugins={[getParagraphPlugin()]}
        options={options}
        components={_components}
        initialValue={initialValue}
      />
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).toBeInTheDocument();
});
