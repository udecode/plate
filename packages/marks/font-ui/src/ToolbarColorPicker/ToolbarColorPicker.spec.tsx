import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { Plate, SPEditor, TDescendant } from '@udecode/plate-core';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
} from '@udecode/plate-font';
import { HeadingToolbar } from '@udecode/plate-toolbar';
import { createEditor, Editor, Transforms } from 'slate';
import { ToolbarColorPicker } from './ToolbarColorPicker';

const DEFAULT_PLUGINS = [
  createFontColorPlugin(),
  createFontBackgroundColorPlugin(),
  createFontSizePlugin(),
];

const DEFAULT_INITIAL_VALUE: TDescendant[] = [
  {
    type: 'p',
    children: [
      {
        text: 'This text has white color, black background.',
      },
    ],
  },
];

function renderWithPlate(
  ui: ReactElement,
  {
    editor,
    initialValue = DEFAULT_INITIAL_VALUE,
    ...options
  }: {
    editor: SPEditor;
    initialValue?: TDescendant[];
  } & RenderOptions
) {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Plate
      editor={editor as SPEditor}
      plugins={DEFAULT_PLUGINS}
      initialValue={initialValue}
    >
      <HeadingToolbar>{children}</HeadingToolbar>
    </Plate>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

describe('ToolbarColorPicker', () => {
  it('should apply font text color', async () => {
    const editor = createEditor();

    const Component = () => (
      <ToolbarColorPicker
        pluginKey={MARK_COLOR}
        icon={<div>Color</div>}
        selectedIcon={<div>Selected</div>}
        tooltip={{ content: 'Text color' }}
      />
    );

    const { rerender } = renderWithPlate(<Component />, {
      editor: editor as SPEditor,
    });

    const toolbarButton = screen.getByTestId('ToolbarButton');

    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    });

    // force rerender to reflect the editor's selection changes
    rerender(<Component />);

    userEvents.click(toolbarButton);

    const colorPicker = screen.getByTestId('ColorPicker');

    expect(colorPicker).toBeVisible();

    const colorButton = screen.getByRole('button', { name: 'light cyan 3' });

    userEvents.click(colorButton);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          {
            text: 'This text has white color, black background.',
            color: '#D0DFE3',
          },
        ],
      },
    ]);
  });

  it('should apply font background color', async () => {
    const editor = createEditor();

    const Component = () => (
      <ToolbarColorPicker
        pluginKey={MARK_BG_COLOR}
        icon={<div>Background Color</div>}
        selectedIcon={<div>Selected</div>}
        tooltip={{ content: 'Background color' }}
      />
    );

    const { rerender } = renderWithPlate(<Component />, {
      editor: editor as SPEditor,
    });

    const toolbarButton = screen.getByTestId('ToolbarButton');

    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    });
    // force rerender to reflect the editor's selection changes
    rerender(<Component />);

    userEvents.click(toolbarButton);

    const colorPicker = screen.getByTestId('ColorPicker');

    expect(colorPicker).toBeVisible();

    const colorButton = screen.getByRole('button', { name: 'light cyan 3' });

    userEvents.click(colorButton);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          {
            text: 'This text has white color, black background.',
            backgroundColor: '#D0DFE3',
          },
        ],
      },
    ]);
  });

  it('should clear selected font text color', async () => {
    const editor = createEditor();

    const Component = () => (
      <ToolbarColorPicker
        pluginKey={MARK_COLOR}
        icon={<div>Color</div>}
        selectedIcon={<div>Selected</div>}
        tooltip={{ content: 'Text color' }}
      />
    );

    const { rerender } = renderWithPlate(<Component />, {
      editor: editor as SPEditor,
      initialValue: [
        {
          type: 'p',
          children: [
            {
              text: 'This text has white color, black background.',
              color: '#D0DFE3',
            },
          ],
        },
      ],
    });

    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    });
    // force rerender to reflect the editor's selection changes
    rerender(<Component />);

    const toolbarButton = screen.getByTestId('ToolbarButton');
    userEvents.click(toolbarButton);

    const colorPicker = screen.getByTestId('ColorPicker');

    expect(colorPicker).toBeVisible();

    const clearButton = screen.getByTestId('ColorPickerClear');

    userEvents.click(clearButton);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          {
            text: 'This text has white color, black background.',
          },
        ],
      },
    ]);
  });
});
