import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen } from '@testing-library/react';
import userEvents from '@testing-library/user-event';
import {
  createPlateEditor,
  createTEditor,
  getEndPoint,
  getStartPoint,
  Plate,
  PlateEditor,
  select,
  TEditor,
  Value,
} from '@udecode/plate-common';
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
    editor,
    ...options
  }: {
    initialValue?: Value;
    editor?: TEditor;
  } & RenderOptions = {}
) {
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <Plate
      editor={createPlateEditor({ editor, plugins: DEFAULT_PLUGINS })}
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
        Component = () => (
          <ColorPickerToolbarDropdown
            pluginKey={pluginKey}
            icon={<div>Color</div>}
            selectedIcon={<div>Selected</div>}
            tooltip={{ content: 'Text color' }}
          />
        );

        editor = createTEditor() as any;

        renderWithPlate(<Component />, { editor });

        // select the entire text
        select(editor, {
          anchor: getStartPoint(editor, []),
          focus: getEndPoint(editor, []),
        });
      });

      it('should open the color picker', () => {
        expect(() => screen.getByTestId('ColorPicker')).toThrowError();

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

        expect(() => screen.getByTestId('ColorPicker')).toThrowError();
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

        expect(() => screen.getByTestId('ColorPicker')).toThrowError();
      });
    });
  };

  runForPluginKey(MARK_COLOR);
  runForPluginKey(MARK_BG_COLOR);
});
