import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as actualPlate from 'platejs';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from 'platejs/media';
import * as actualCoreReact from 'platejs/react';
import * as React from 'react';

const { BoldPlugin, FontColorPlugin, FontSizePlugin, ScriptPlugin } =
  actualCoreReact;

const focusMock = mock();
const clearMock = mock();
const insertMock = mock();
const isUrlMock = mock((value: string) => /^https?:\/\//.test(value));
const openFilePickerMock = mock();
const setMock = mock();
const recentColorsChangeMock = mock();
const scriptToggleMock = mock();
const toastErrorMock = mock();
const toggleMock = mock();
const pluginMock = mock();

let currentEditor: any;
let currentPluginName = 'bold';
let dropdownOnFinalFocus:
  | ((event: { preventDefault: () => void }) => void)
  | undefined;
let mediaUrlOnChange: React.ChangeEventHandler<HTMLInputElement> | undefined;

mock.module('platejs/react', () => ({
  ...actualCoreReact,
  useEditor: () => currentEditor,
  useEditorPlugin: () => ({ name: currentPluginName }),
  useEditorSelector: (selector: (editor: unknown) => unknown) =>
    selector(currentEditor),
  useComposedRef:
    (...refs: Array<React.Ref<HTMLInputElement>>) =>
    (value: HTMLInputElement | null) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === 'function') {
          ref(value);
        } else {
          ref.current = value;
        }
      });
    },
}));

mock.module('platejs', () => ({
  ...actualPlate,
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
  isUrl: isUrlMock,
  PLUGINS: {
    audio: 'audio',
    file: 'file',
    image: 'image',
    kbd: 'kbd',
    video: 'video',
  },
  TextApi: { isText: () => true },
  toUnitLess: (value: string) => value.replace('px', ''),
}));

mock.module('use-file-picker', () => ({
  useFilePicker: () => ({ openFilePicker: openFilePickerMock }),
}));

mock.module('sonner', () => ({
  toast: { error: toastErrorMock },
}));

mock.module('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: React.PropsWithChildren) => <>{children}</>,
  AlertDialogAction: ({
    children,
    ...props
  }: React.PropsWithChildren<React.ComponentProps<'button'>>) => (
    <button {...props} type="button">
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: React.PropsWithChildren) => (
    <button type="button">{children}</button>
  ),
  AlertDialogContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  AlertDialogDescription: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
}));

mock.module('@/components/ui/button', () => ({
  Button: ({
    size: _size,
    type: _type,
    variant: _variant,
    ...props
  }: React.ComponentProps<'button'> & {
    size?: string;
    variant?: string;
  }) => <button {...props} type="button" />,
  buttonVariants: () => '',
}));

mock.module('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren) => <>{children}</>,
  DropdownMenuContent: ({
    children,
    onCloseAutoFocus,
    onFinalFocus,
  }: React.PropsWithChildren<{
    onCloseAutoFocus?: (event: { preventDefault: () => void }) => void;
    onFinalFocus?: (event: { preventDefault: () => void }) => void;
  }>) => {
    dropdownOnFinalFocus = onFinalFocus ?? onCloseAutoFocus;

    return <div>{children}</div>;
  },
  DropdownMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  DropdownMenuItem({
    children,
    onClick,
    onSelect,
    ref,
    style,
    ...props
  }: React.PropsWithChildren<
    React.ComponentProps<'button'> & {
      onSelect?: React.MouseEventHandler<HTMLButtonElement>;
    }
  >) {
    return (
      <button
        {...props}
        aria-label={
          props['aria-label'] ??
          (typeof style?.backgroundColor === 'string'
            ? style.backgroundColor
            : undefined)
        }
        onClick={(event) => {
          onClick?.(event);
          onSelect?.(event);
        }}
        ref={ref}
        style={style}
        type="button"
      >
        {children}
      </button>
    );
  },
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  TooltipContent: ({ children }: React.PropsWithChildren) => (
    <span>{children}</span>
  ),
  TooltipProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  TooltipTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

mock.module('@/components/ui/input', () => ({
  Input: ({ onChange, ...props }: React.ComponentProps<'input'>) => {
    mediaUrlOnChange = onChange;

    return <input {...props} onChange={onChange} />;
  },
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  PopoverContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  PopoverTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

mock.module(
  '@/registry/components/editor/dropdown-menu',
  async () => import('@/components/ui/dropdown-menu')
);

mock.module('@/registry/components/editor/floating-popover', () => ({
  FloatingPopover: ({ children }: React.PropsWithChildren) => <>{children}</>,
  FloatingPopoverContent: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  FloatingPopoverTrigger: ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  ),
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@/registry/components/editor/toolbar', () => ({
  ToolbarButton: ({
    children,
    pressed,
    tooltip: _tooltip,
    ...props
  }: React.ComponentProps<'button'> & {
    pressed?: boolean;
    tooltip?: React.ReactNode;
  }) => (
    <button type="button" aria-pressed={pressed} {...props}>
      {children}
    </button>
  ),
  ToolbarMenuGroup: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ToolbarSplitButton: ({ children }: React.PropsWithChildren) => (
    <div>{children}</div>
  ),
  ToolbarSplitButtonPrimary: ({
    children,
    ...props
  }: React.ComponentProps<'button'>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  ToolbarSplitButtonSecondary: () => <button type="button">More</button>,
}));

describe('feature toolbar plugin portals', () => {
  beforeEach(() => {
    currentPluginName = 'bold';
    dropdownOnFinalFocus = undefined;
    mediaUrlOnChange = undefined;
    clearMock.mockClear();
    focusMock.mockClear();
    insertMock.mockClear();
    isUrlMock.mockClear();
    openFilePickerMock.mockClear();
    pluginMock.mockClear();
    recentColorsChangeMock.mockClear();
    setMock.mockClear();
    scriptToggleMock.mockClear();
    toastErrorMock.mockClear();
    toggleMock.mockClear();

    currentEditor = {
      api: { dom: { focus: focusMock } },
      plugin: pluginMock,
      read: {
        marks: () => ({ bold: true }),
        nodes: { block: () => undefined },
      },
    };
  });

  afterAll(() => {
    mock.restore();
  });

  it('uses the typed plugin portal for a decoupled bold control', async () => {
    pluginMock.mockReturnValue({
      name: 'bold',
      read: { isActive: () => true },
      update: { toggle: toggleMock },
    });
    const { MarkToolbarButton } = await import(
      `./mark-toolbar-button?plugin=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold">
        B
      </MarkToolbarButton>
    );
    const button = view.getByRole('button', { name: 'B' });

    expect(button.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(button);

    expect(pluginMock).toHaveBeenCalledWith(BoldPlugin);
    expect(toggleMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  it('uses the installed script portal for both script values', async () => {
    pluginMock.mockImplementation(() => ({
      update: {
        toggle: scriptToggleMock,
      },
    }));
    const { MoreToolbarButton } = await import(
      `./more-toolbar-button?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<MoreToolbarButton />);

    fireEvent.click(view.getByRole('button', { name: 'Superscript' }));
    fireEvent.click(view.getByRole('button', { name: 'Subscript' }));

    expect(pluginMock).toHaveBeenNthCalledWith(1, ScriptPlugin);
    expect(pluginMock).toHaveBeenNthCalledWith(2, ScriptPlugin);
    expect(scriptToggleMock).toHaveBeenNthCalledWith(1, 'sup');
    expect(scriptToggleMock).toHaveBeenNthCalledWith(2, 'sub');
    expect(focusMock).toHaveBeenCalledTimes(2);
  });

  it('changes font size without refocusing from the step buttons', async () => {
    currentPluginName = 'fontSize';
    currentEditor.read.marks = () => ({ fontSize: '16px' });
    pluginMock.mockReturnValue({
      read: { value: () => '16px' },
      update: { set: setMock },
    });
    const { FontSizeToolbarButton } = await import(
      `./font-size-toolbar-button?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FontSizeToolbarButton />);
    const buttons = view.getAllByRole('button');

    fireEvent.click(buttons[0]);
    fireEvent.click(buttons.at(-1)!);

    expect(pluginMock).toHaveBeenCalledWith(FontSizePlugin);
    expect(setMock).toHaveBeenNthCalledWith(1, '15px');
    expect(setMock).toHaveBeenNthCalledWith(2, '17px');
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('changes font size without refocusing from the input', async () => {
    currentPluginName = 'fontSize';
    currentEditor.read.marks = () => ({ fontSize: '16px' });
    pluginMock.mockReturnValue({
      read: { value: () => '16px' },
      update: { set: setMock },
    });
    const { FontSizeToolbarButton } = await import(
      `./font-size-toolbar-button?input=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FontSizeToolbarButton />);
    const input = view.getByRole('textbox');
    const user = userEvent.setup();

    await user.click(input);
    await user.clear(input);
    await user.type(input, '12');
    expect((input as HTMLInputElement).value).toBe('12');
    await user.tab();

    expect(setMock).toHaveBeenCalledWith('12px');
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('changes font size without refocusing from the popover', async () => {
    currentPluginName = 'fontSize';
    currentEditor.read.marks = () => ({ fontSize: '16px' });
    pluginMock.mockReturnValue({
      read: { value: () => '16px' },
      update: { set: setMock },
    });
    const { FontSizeToolbarButton } = await import(
      `./font-size-toolbar-button?focus=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<FontSizeToolbarButton />);

    fireEvent.click(view.getByRole('button', { name: '10' }));

    expect(setMock).toHaveBeenCalledWith('10px');
    expect(focusMock).not.toHaveBeenCalled();
  });

  it('uses caller colors without traversing a 5,000-block document', async () => {
    currentEditor.read.marks = () => ({});
    currentEditor.read.children = () =>
      Array.from({ length: 5000 }, () => ({
        children: [{ text: 'block' }],
        type: 'paragraph',
      }));
    currentEditor.read.nodes.toArray = () => {
      throw new Error('Color controls must not traverse the document');
    };
    currentEditor.read.selection = () => ({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
    pluginMock.mockReturnValue({
      name: 'color',
      read: { value: () => currentEditor.read.marks().color },
      update: { clear: clearMock, set: setMock },
    });
    const { FontColorToolbarButton } = await import(
      `./font-color-toolbar-button?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FontColorToolbarButton
        colors={[
          {
            isBrightColor: false,
            name: 'brand blue',
            value: '#112233',
          },
        ]}
        onRecentColorsChange={recentColorsChangeMock}
        plugin={FontColorPlugin}
        recentColors={['#445566']}
      >
        C
      </FontColorToolbarButton>
    );

    fireEvent.click(view.getByRole('gridcell', { name: 'brand blue' }));

    expect(pluginMock).toHaveBeenCalledWith(FontColorPlugin);
    expect(setMock).toHaveBeenCalledWith('#112233');
    expect(recentColorsChangeMock).toHaveBeenCalledWith(['#112233', '#445566']);
  });

  it('uses the latest color callback after a parent rerender', async () => {
    const firstRecentColorsChange = mock();
    const secondRecentColorsChange = mock();
    const colors = [
      {
        isBrightColor: false,
        name: 'brand blue',
        value: '#112233',
      },
    ];

    currentEditor.read.marks = () => ({});
    currentEditor.read.selection = () => ({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
    pluginMock.mockReturnValue({
      name: 'color',
      read: { value: () => currentEditor.read.marks().color },
      update: { clear: clearMock, set: setMock },
    });
    const { FontColorToolbarButton } = await import(
      `./font-color-toolbar-button?callback=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FontColorToolbarButton
        colors={colors}
        onRecentColorsChange={firstRecentColorsChange}
        plugin={FontColorPlugin}
      >
        C
      </FontColorToolbarButton>
    );

    view.rerender(
      <FontColorToolbarButton
        colors={colors}
        onRecentColorsChange={secondRecentColorsChange}
        plugin={FontColorPlugin}
      >
        C
      </FontColorToolbarButton>
    );
    fireEvent.click(view.getByRole('gridcell', { name: 'brand blue' }));

    expect(firstRecentColorsChange).not.toHaveBeenCalled();
    expect(secondRecentColorsChange).toHaveBeenCalledWith(['#112233']);
  });

  it('clears text color through the installed plugin portal', async () => {
    const preventDefaultMock = mock();

    currentEditor.read.marks = () => ({ color: '#112233' });
    currentEditor.read.selection = () => ({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
    pluginMock.mockReturnValue({
      name: 'color',
      read: { value: () => currentEditor.read.marks().color },
      update: { clear: clearMock, set: setMock },
    });
    const { FontColorToolbarButton } = await import(
      `./font-color-toolbar-button?clear=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FontColorToolbarButton colors={[]} plugin={FontColorPlugin}>
        C
      </FontColorToolbarButton>
    );

    fireEvent.click(view.getByRole('button', { name: 'Clear' }));

    expect(pluginMock).toHaveBeenCalledWith(FontColorPlugin);
    expect(clearMock).toHaveBeenCalledTimes(1);

    dropdownOnFinalFocus?.({ preventDefault: preventDefaultMock });

    expect(preventDefaultMock).toHaveBeenCalledTimes(1);
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  it('keeps bounded recent colors locally when uncontrolled', async () => {
    currentEditor.read.marks = () => ({});
    currentEditor.read.selection = () => ({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
    pluginMock.mockReturnValue({
      name: 'color',
      read: { value: () => currentEditor.read.marks().color },
      update: { clear: clearMock, set: setMock },
    });
    const { FontColorToolbarButton } = await import(
      `./font-color-toolbar-button?recent=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <FontColorToolbarButton
        colors={[
          {
            isBrightColor: false,
            name: 'brand blue',
            value: '#112233',
          },
        ]}
        plugin={FontColorPlugin}
      >
        C
      </FontColorToolbarButton>
    );

    fireEvent.click(view.getByRole('gridcell', { name: 'brand blue' }));

    expect(
      within(view.getByRole('grid', { name: 'Recent Colors' })).getByRole(
        'gridcell',
        { name: 'brand blue' }
      )
    ).toBeTruthy();
  });

  it('moves through color swatches as an ARIA grid', async () => {
    const updateColorMock = mock();
    const { ColorDropdownMenuItems } = await import(
      `./font-color-toolbar-button?grid=${Math.random().toString(36).slice(2)}`
    );
    const view = render(
      <ColorDropdownMenuItems
        colors={Array.from({ length: 12 }, (_, index) => ({
          isBrightColor: false,
          name: `color ${index + 1}`,
          value: `#0000${index.toString(16).padStart(2, '0')}`,
        }))}
        updateColor={updateColorMock}
      />
    );
    const cells = within(
      view.getByRole('grid', { name: 'Colors' })
    ).getAllByRole('gridcell');

    cells[0].focus();
    fireEvent.keyDown(cells[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(cells[1]);

    fireEvent.keyDown(cells[1], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(cells[11]);

    fireEvent.keyDown(cells[11], { key: 'Home' });
    expect(document.activeElement).toBe(cells[0]);

    fireEvent.keyDown(cells[0], { key: 'End' });
    expect(document.activeElement).toBe(cells[11]);

    fireEvent.click(cells[11]);
    expect(updateColorMock).toHaveBeenCalledWith('#00000b');
  });

  it('inserts URL media through the selected feature portal', async () => {
    pluginMock.mockReturnValue({
      update: { insert: insertMock },
    });
    const { MediaToolbarButton } = await import(
      `./media-toolbar-button?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<MediaToolbarButton plugin={BaseFilePlugin} />);
    const input = view.getByLabelText('URL');

    act(() => {
      mediaUrlOnChange?.({
        target: { value: 'https://platejs.org/report.pdf' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect((input as HTMLInputElement).value).toBe(
      'https://platejs.org/report.pdf'
    );
    fireEvent.click(view.getByRole('button', { name: 'Accept' }));

    expect(isUrlMock).toHaveBeenCalledWith('https://platejs.org/report.pdf');
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(pluginMock).toHaveBeenCalledWith(BaseFilePlugin);
    expect(insertMock).toHaveBeenCalledWith({
      name: 'report.pdf',
      url: 'https://platejs.org/report.pdf',
    });
  });

  it('keeps the split primary file-picker action callable', async () => {
    const { MediaToolbarButton } = await import(
      `./media-toolbar-button?file-picker=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<MediaToolbarButton plugin={BaseFilePlugin} />);
    const primary = view.getAllByRole('button')[0];

    fireEvent.mouseDown(primary);
    fireEvent.click(primary);

    expect(openFilePickerMock).toHaveBeenCalledTimes(1);
  });
});
