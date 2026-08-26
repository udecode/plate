import { ListPlugin } from '@platejs/list-classic/react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { PLUGINS } from 'platejs';
import { createPlateEditor, Plate } from 'platejs/react';
import * as React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toolbar } from '@/registry/components/editor/toolbar';

import { TaskListItemElement } from './list-classic';
import { ListToolbarButton } from './list-classic-toolbar-button';

describe('classic list registry UI', () => {
  it('disables task checkboxes in read-only editors', () => {
    const editor = createPlateEditor({ plugins: [ListPlugin] });
    const element = {
      checked: false,
      children: [{ text: 'Task' }],
      type: editor.plugin(PLUGINS.taskList).schema.type,
    };
    const view = render(
      <Plate editor={editor} readOnly suppressInstanceWarning>
        <TaskListItemElement
          {...({
            attributes: {},
            children: <span>Task</span>,
            editor,
            element,
          } as any)}
        />
      </Plate>
    );

    expect(view.getByRole('checkbox')).toBeDisabled();
  });

  it('toggles the selected block through the local toolbar button', async () => {
    const editor = createPlateEditor({
      initialValue: [{ children: [{ text: 'Item' }], type: 'paragraph' }],
      plugins: [ListPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });
    const view = render(
      <Plate editor={editor} suppressInstanceWarning>
        <TooltipProvider>
          <Toolbar>
            <ListToolbarButton />
          </Toolbar>
        </TooltipProvider>
      </Plate>
    );

    fireEvent.click(view.getByRole('button'));

    await waitFor(() => {
      expect(editor.read.children()[0]).toMatchObject({
        type: editor.plugin(PLUGINS.bulletedList).schema.type,
      });
    });
  });
});
