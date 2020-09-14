import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import { render } from '@testing-library/react';
import { ReactEditor } from 'slate-react';
import * as SlateReact from 'slate-react';
import { DEFAULTS_PARAGRAPH } from '../../elements/paragraph';
import { getSelectableElement } from '..';

it('should render draggable component', () => {
  const editor = jest.fn();
  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
  const DraggableElement = getSelectableElement({
    component: DEFAULTS_PARAGRAPH.p.component,
  });
  const { container } = render(
    <DndProvider backend={TestBackend}>
      <DraggableElement
        attributes={{} as any}
        element={{
          type: DEFAULTS_PARAGRAPH.p.type,
          children: [{ text: 'test' }],
        }}
      >
        test
      </DraggableElement>
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).toBeInTheDocument();
});

it('should filter based on level', () => {
  const editor = jest.fn();
  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
  const DraggableElement = getSelectableElement({
    component: DEFAULTS_PARAGRAPH.p.component,
    level: 0,
  });
  const { container } = render(
    <DndProvider backend={TestBackend}>
      <DraggableElement
        attributes={{} as any}
        element={{
          type: DEFAULTS_PARAGRAPH.p.type,
          children: [{ text: 'test' }],
        }}
      >
        test
      </DraggableElement>
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).not.toBeInTheDocument();
});

it('should not be draggable if readOnly', () => {
  const editor = jest.fn();
  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(SlateReact, 'useReadOnly').mockReturnValue(true);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
  const DraggableElement = getSelectableElement({
    component: DEFAULTS_PARAGRAPH.p.component,
  });
  const { container } = render(
    <DndProvider backend={TestBackend}>
      <DraggableElement
        attributes={{} as any}
        element={{
          type: DEFAULTS_PARAGRAPH.p.type,
          children: [{ text: 'test' }],
        }}
      >
        test
      </DraggableElement>
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).not.toBeInTheDocument();
});

it('should be draggable in readOnly if allowReadOnly', () => {
  const editor = jest.fn();
  jest.spyOn(SlateReact, 'useEditor').mockReturnValue(editor as any);
  jest.spyOn(SlateReact, 'useReadOnly').mockReturnValue(true);
  jest.spyOn(ReactEditor, 'findPath').mockReturnValue([0, 0]);
  const DraggableElement = getSelectableElement({
    component: DEFAULTS_PARAGRAPH.p.component,
    allowReadOnly: true,
  });
  const { container } = render(
    <DndProvider backend={TestBackend}>
      <DraggableElement
        attributes={{} as any}
        element={{
          type: DEFAULTS_PARAGRAPH.p.type,
          children: [{ text: 'test' }],
        }}
      >
        test
      </DraggableElement>
    </DndProvider>
  );
  expect(container.querySelector('.slate-Selectable')).toBeInTheDocument();
});

it.todo('should be draggable');
