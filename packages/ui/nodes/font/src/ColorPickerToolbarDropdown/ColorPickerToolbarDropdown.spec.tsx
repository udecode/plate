import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import {
  getEndPoint,
  getPlateEditorRef,
  getStartPoint,
  Plate,
  PlateEditor,
  select,
  Value,
} from '@udecode/plate-core';
import {
  createFontBackgroundColorPlugin,
  createFontColorPlugin,
  createFontSizePlugin,
  MARK_BG_COLOR,
  MARK_COLOR,
} from '@udecode/plate-font';
import { ColorPickerToolbarDropdown } from './ColorPickerToolbarDropdown';

const DEFAULT_PLUGINS = [
  createFontColorPlugin(),
  createFontBackgroundColorPlugin(),
  createFontSizePlugin(),
];

const DEFAULT_INITIAL_VALUE: Value = [
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
    initialValue = DEFAULT_INITIAL_VALUE,
    ...options
  }: {
    initialValue?: Value;
  } & RenderOptions = {}
) {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Plate plugins={DEFAULT_PLUGINS} initialValue={initialValue}>
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
        Component = () => (
          <ColorPickerToolbarDropdown
            pluginKey={pluginKey}
            icon={<div>Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Text color' }}
          />
        );

        renderWithPlate(<Component />);

        editor = getPlateEditorRef()!;

        // select the entire text
        select(editor, {
          anchor: getStartPoint(editor, []),
          focus: getEndPoint(editor, []),
        });
      });

      it('should open the color picker', () => {
        expect(screen.getByTestId('ColorPicker')).not.toBeVisible();

        openToolbar();

        expect(screen.getByTestId('ColorPicker')).toBeVisible();
      });

      it(`should apply ${target}`, async () => {
        await openToolbar();

        await applyColor();

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

        const value = await screen.findByTestId('ColorPicker');
        expect(value).not.toBeVisible();
      });

      it(`should clear selected ${target}`, async () => {
        await openToolbar();
        await applyColor();
        await openToolbar();

        await clearColor();

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

        const value = await screen.findByTestId('ColorPicker');
        expect(value).not.toBeVisible();
      });
    });
  };

  runForPluginKey(MARK_COLOR);
  runForPluginKey(MARK_BG_COLOR);
});
