import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import {
  createPlateEditor,
  Plate,
  PlateEditor,
  TDescendant,
} from '@udecode/plate-core';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
} from '@udecode/plate-font';
import { Editor, Transforms } from 'slate';
import { ColorPickerToolbarDropdown } from './ColorPickerToolbarDropdown';

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
    editor: PlateEditor;
    initialValue?: TDescendant[];
  } & RenderOptions
) {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Plate
      editor={editor}
      plugins={DEFAULT_PLUGINS}
      initialValue={initialValue}
    >
      {children}
    </Plate>
  );
  return render(ui, { wrapper: Wrapper, ...options });
}

describe('ColorPickerToolbarDropdown', () => {
  const runForPluginKey = (
    pluginKey: typeof MARK_COLOR | typeof MARK_BG_COLOR
  ) => {
    const target = pluginKey === MARK_COLOR ? 'text color' : 'background color';

    describe(`${target}`, () => {
      let Component: () => JSX.Element;
      let editor: PlateEditor;

      const openToolbar = () =>
        userEvents.click(screen.getByTestId('ToolbarButton'));

      const applyColor = () =>
        userEvents.click(screen.getByRole('button', { name: 'light cyan 3' }));

      const clearColor = () =>
        userEvents.click(screen.getByTestId('ColorPickerClear'));

      beforeEach(() => {
        editor = createPlateEditor({
          plugins: DEFAULT_PLUGINS,
        }) as PlateEditor;

        Component = () => (
          <ColorPickerToolbarDropdown
            pluginKey={pluginKey}
            icon={<div>Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Text color' }}
          />
        );

        renderWithPlate(<Component />, { editor });

        // select the entire text
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        });
      });

      it('should open the color picker', () => {
        openToolbar();

        expect(screen.getByTestId('ColorPicker')).toBeVisible();
      });

      it(`should apply ${target}`, () => {
        openToolbar();

        applyColor();

        expect(editor.children).toEqual([
          {
            type: 'p',
            children: [
              {
                text: 'This text has white color, black background.',
                [pluginKey]: '#D0DFE3',
              },
            ],
          },
        ]);
      });

      it(`should clear selected ${target}`, () => {
        openToolbar();
        applyColor();

        clearColor();

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
  };

  runForPluginKey(MARK_COLOR);
  runForPluginKey(MARK_BG_COLOR);
});
