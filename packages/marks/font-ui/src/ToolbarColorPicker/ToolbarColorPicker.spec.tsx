import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import { Plate, SPEditor } from '@udecode/plate-core';
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

const plugins = [
  createFontColorPlugin(),
  createFontBackgroundColorPlugin(),
  createFontSizePlugin(),
];

describe('ToolbarColorPicker', () => {
  it('should apply font text color', async () => {
    const editor = createEditor();

    const Component = () => (
      <Plate
        editor={editor as SPEditor}
        plugins={plugins}
        initialValue={[
          {
            type: 'p',
            children: [
              {
                text: 'This text has white color, black background.',
              },
            ],
          },
        ]}
      >
        <HeadingToolbar>
          <ToolbarColorPicker
            pluginKey={MARK_COLOR}
            icon={<div>Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Text color' }}
          />
        </HeadingToolbar>
      </Plate>
    );

    render(<Component />);

    const toolbarButton = screen.getByTestId('ToolbarButton');

    act(() => {
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      });
    });

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
      <Plate
        editor={editor as SPEditor}
        plugins={plugins}
        initialValue={[
          {
            type: 'p',
            children: [
              {
                text: 'This text has white color, black background.',
              },
            ],
          },
        ]}
      >
        <HeadingToolbar>
          <ToolbarColorPicker
            pluginKey={MARK_BG_COLOR}
            icon={<div>Background Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Background color' }}
          />
        </HeadingToolbar>
      </Plate>
    );

    render(<Component />);

    const toolbarButton = screen.getByTestId('ToolbarButton');

    act(() => {
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      });
    });

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

  it.skip('should clear selected font text color', async () => {
    const editor = createEditor();

    const Component = () => (
      <Plate
        id="font"
        editor={editor as SPEditor}
        plugins={plugins}
        initialValue={[
          {
            type: 'p',
            children: [
              {
                text: 'This text has white color, black background.',
                color: '#D0DFE3',
              },
            ],
          },
        ]}
      >
        <HeadingToolbar>
          <ToolbarColorPicker
            pluginKey={MARK_COLOR}
            icon={<div>Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Text color' }}
          />
        </HeadingToolbar>
      </Plate>
    );

    render(<Component />);

    act(() => {
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      });
    });

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
