'use client';

import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@platejs/basic-styles/react';
import type {
  DropdownMenuItemProps,
  DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import { useComposedRef } from '@udecode/cn';
import debounce from 'lodash/debounce.js';
import { CheckIcon, EraserIcon, PlusIcon } from 'lucide-react';
import { type PlateEditor, useEditor, useEditorSelector } from 'platejs/react';
import React from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

const COLOR_GRID_COLUMNS = 10;
const MAX_RECENT_COLORS = 19;
const HEX_COLOR_RE = /^#[\da-f]{6}$/i;

function normalizeColor(color: string): string {
  return color.toLowerCase();
}

function isValidHexColor(color: string): boolean {
  return HEX_COLOR_RE.test(color);
}

function computeIsBrightColor(hex: string): boolean {
  if (!isValidHexColor(hex)) return false;

  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 > 130;
}

function normalizeRecentColors(colors: readonly string[]): string[] {
  return colors.reduce<string[]>((result, color) => {
    const normalized = normalizeColor(color);

    if (
      isValidHexColor(normalized) &&
      !result.includes(normalized) &&
      result.length < MAX_RECENT_COLORS
    ) {
      result.push(normalized);
    }

    return result;
  }, []);
}

function getNextRecentColors(
  color: string,
  recentColors: readonly string[]
): string[] {
  return normalizeRecentColors([
    normalizeColor(color),
    ...recentColors.filter(
      (recentColor) => normalizeColor(recentColor) !== normalizeColor(color)
    ),
  ]);
}

type ColorPlugin = typeof FontBackgroundColorPlugin | typeof FontColorPlugin;
type PluginPortalEditor = Pick<PlateEditor, 'plugin'>;

function setColor(editor: PlateEditor, plugin: ColorPlugin, value: string) {
  switch (plugin.name) {
    case FontBackgroundColorPlugin.name: {
      editor.plugin(plugin).update.set(value);
      break;
    }
    case FontColorPlugin.name: {
      editor.plugin(plugin).update.set(value);
      break;
    }
  }
}

function clearColor(editor: PlateEditor, plugin: ColorPlugin) {
  switch (plugin.name) {
    case FontBackgroundColorPlugin.name: {
      editor.plugin(plugin).update.clear();
      break;
    }
    case FontColorPlugin.name: {
      editor.plugin(plugin).update.clear();
      break;
    }
  }
}

function getColor(editor: PluginPortalEditor, plugin: ColorPlugin) {
  switch (plugin.name) {
    case FontBackgroundColorPlugin.name: {
      return editor.plugin(FontBackgroundColorPlugin).read.value();
    }
    case FontColorPlugin.name: {
      return editor.plugin(FontColorPlugin).read.value();
    }
  }

  return undefined;
}

export type ColorOption = {
  isBrightColor: boolean;
  name: string;
  value: string;
};

export function FontColorToolbarButton({
  children,
  colors,
  onRecentColorsChange,
  plugin,
  recentColors,
  tooltip,
  ...menuProps
}: {
  colors: readonly ColorOption[];
  onRecentColorsChange?: (colors: string[]) => void;
  plugin: ColorPlugin;
  recentColors?: readonly string[];
  tooltip?: string;
} & DropdownMenuProps) {
  const editor = useEditor();

  const selectionDefined = useEditorSelector(
    (innerEditor) => !!innerEditor.read.selection()
  );

  const color = useEditorSelector((innerEditor2) =>
    getColor(innerEditor2, plugin)
  );

  const [selectedColor, setSelectedColor] = React.useState<string>();
  const [updatedColor, setUpdatedColor] = React.useState<string>();
  const [open, setOpen] = React.useState(false);
  const [localRecentColors, setLocalRecentColors] = React.useState<string[]>(
    []
  );

  const normalizedRecentColors = React.useMemo(
    () => normalizeRecentColors(recentColors ?? localRecentColors),
    [localRecentColors, recentColors]
  );

  const recentColorOptions = React.useMemo(
    () =>
      normalizedRecentColors.map((recentColor) => {
        const paletteColor = colors.find(
          ({ value }) => normalizeColor(value) === recentColor
        );

        return (
          paletteColor ?? {
            isBrightColor: computeIsBrightColor(recentColor),
            name: recentColor,
            value: recentColor,
          }
        );
      }),
    [colors, normalizedRecentColors]
  );

  const recordRecentColor = React.useCallback(
    (value: string) => {
      const nextRecentColors = getNextRecentColors(
        value,
        normalizedRecentColors
      );

      if (recentColors === undefined) {
        setLocalRecentColors(nextRecentColors);
      }
      onRecentColorsChange?.(nextRecentColors);
    },
    [normalizedRecentColors, onRecentColorsChange, recentColors]
  );

  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);

      if (!value) {
        setUpdatedColor(undefined);
      }
    },
    [open]
  );

  const updateColor = React.useCallback(
    (value: string) => {
      const selection = editor.read.selection();
      const normalized = normalizeColor(value);

      if (!selection || !isValidHexColor(normalized)) return;

      setSelectedColor(normalized);
      setUpdatedColor(normalized);

      setColor(editor, plugin, normalized);
      recordRecentColor(normalized);
    },
    [editor, plugin, recordRecentColor]
  );

  const updateColorAndClose = React.useCallback(
    (value: string) => {
      updateColor(value);
      onToggle(false);
    },
    [onToggle, updateColor]
  );

  const clearCurrentColor = React.useCallback(() => {
    const selection = editor.read.selection();

    if (!selection) return;

    clearColor(editor, plugin);
    onToggle(false);
  }, [editor, onToggle, plugin]);

  React.useEffect(() => {
    if (selectionDefined) {
      // Preserve the mark color while menu focus clears editor selection.
      setSelectedColor(color);
    }
  }, [color, selectionDefined]);

  return (
    <DropdownMenu {...menuProps} modal onOpenChange={onToggle} open={open}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={tooltip}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <ColorPicker
          clearColor={clearCurrentColor}
          color={selectedColor || color}
          colors={colors}
          recentColors={recentColorOptions}
          updateColor={updateColorAndClose}
          updateCustomColor={updateColor}
          updatedColor={updatedColor}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PureColorPicker({
  className,
  clearColor: innerClearColor,
  color,
  colors,
  recentColors,
  updateColor,
  updateCustomColor,
  updatedColor,
  ...props
}: React.ComponentProps<'div'> & {
  colors: readonly ColorOption[];
  recentColors: readonly ColorOption[];
  clearColor: () => void;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
  updatedColor?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <ToolbarMenuGroup label="Recent Colors">
        <ColorCustom
          className="px-2"
          color={color}
          recentColors={recentColors}
          updateColor={updateColor}
          updateCustomColor={updateCustomColor}
          updatedColor={updatedColor}
        />
      </ToolbarMenuGroup>
      <ToolbarMenuGroup label="Colors">
        <ColorDropdownMenuItems
          className="px-2"
          color={color}
          colors={colors}
          label="Colors"
          updateColor={updateColor}
        />
      </ToolbarMenuGroup>
      {color && (
        <ToolbarMenuGroup>
          <DropdownMenuItem className="p-2" onSelect={innerClearColor}>
            <EraserIcon />
            <span>Clear</span>
          </DropdownMenuItem>
        </ToolbarMenuGroup>
      )}
    </div>
  );
}

const ColorPicker = React.memo(
  PureColorPicker,
  (prev, next) =>
    prev.color === next.color &&
    prev.colors === next.colors &&
    prev.recentColors === next.recentColors &&
    prev.updatedColor === next.updatedColor
);

function ColorCustom({
  className,
  color,
  recentColors,
  updateColor,
  updateCustomColor,
  updatedColor,
  ...props
}: {
  recentColors: readonly ColorOption[];
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
  updatedColor?: string;
} & React.ComponentPropsWithoutRef<'div'>) {
  const [value, setValue] = React.useState<string>(color || '#000000');

  const computedColors = React.useMemo(() => {
    if (
      !updatedColor ||
      !isValidHexColor(updatedColor) ||
      recentColors.some(
        ({ value: innerValue }) =>
          normalizeColor(innerValue) === normalizeColor(updatedColor)
      )
    ) {
      return recentColors;
    }

    return [
      {
        isBrightColor: computeIsBrightColor(updatedColor),
        name: updatedColor,
        value: updatedColor,
      },
      ...recentColors,
    ].slice(0, MAX_RECENT_COLORS);
  }, [recentColors, updatedColor]);

  const updateCustomColorDebounced = React.useMemo(
    () =>
      debounce((innerValue2: string) => {
        updateCustomColor(innerValue2);
      }, 100),
    [updateCustomColor]
  );

  React.useEffect(
    () => () => {
      updateCustomColorDebounced.cancel();
    },
    [updateCustomColorDebounced]
  );

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <ColorDropdownMenuItems
        color={color}
        colors={computedColors}
        label="Recent Colors"
        updateColor={updateColor}
      >
        <ColorInput
          className="col-start-10"
          onChange={(e) => {
            setValue(e.target.value);
            updateCustomColorDebounced(e.target.value);
          }}
          value={value}
        >
          <DropdownMenuItem
            aria-label="Custom color"
            className={cn(
              buttonVariants({
                size: 'icon',
                variant: 'outline',
              }),
              'flex size-8 items-center justify-center rounded-full'
            )}
            onSelect={(event) => {
              event.preventDefault();
            }}
            role="gridcell"
          >
            <PlusIcon />
          </DropdownMenuItem>
        </ColorInput>
      </ColorDropdownMenuItems>
    </div>
  );
}

function ColorInput({
  children,
  className,
  value = '#000000',
  ...props
}: React.ComponentProps<'input'> & { className?: string }) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={cn('flex flex-col items-center', className)}
      role="presentation"
    >
      {React.Children.map(children, (child) => {
        if (!child) return child;

        return React.cloneElement(
          child as React.ReactElement<{
            onClick: () => void;
          }>,
          {
            onClick: () => inputRef.current?.click(),
          }
        );
      })}
      <input
        {...props}
        className="size-0 overflow-hidden border-0 p-0"
        ref={useComposedRef(props.ref, inputRef)}
        type="color"
        value={value}
      />
    </div>
  );
}

function ColorDropdownMenuItem({
  className,
  isBrightColor,
  isSelected,
  name,
  ref,
  updateColor,
  value,
  ...props
}: {
  isBrightColor: boolean;
  isSelected: boolean;
  value: string;
  updateColor: (color: string) => void;
  name?: string;
  ref?: React.Ref<HTMLDivElement>;
} & DropdownMenuItemProps) {
  const content = (
    <DropdownMenuItem
      aria-label={name ?? value}
      aria-selected={isSelected}
      className={cn(
        buttonVariants({
          size: 'icon',
          variant: 'outline',
        }),
        'my-1 flex size-6 items-center justify-center rounded-full border border-muted border-solid p-0 transition-all hover:scale-125',
        !isBrightColor && 'border-transparent text-white',
        className
      )}
      ref={ref}
      role="gridcell"
      style={{ backgroundColor: value }}
      onSelect={(event) => {
        event.preventDefault();
        updateColor(value);
      }}
      {...props}
    >
      {isSelected ? <CheckIcon className="!size-3" strokeWidth={3} /> : null}
    </DropdownMenuItem>
  );

  return name ? (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent className="mb-1 capitalize">{name}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

export function ColorDropdownMenuItems({
  children,
  className,
  color,
  colors,
  label = 'Colors',
  updateColor,
  ...props
}: {
  colors: readonly ColorOption[];
  label?: string;
  updateColor: (color: string) => void;
  color?: string;
} & React.ComponentProps<'div'>) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const focusItem = React.useCallback(
    (index: number) => {
      if (colors.length === 0) return;

      const nextIndex = Math.max(0, Math.min(index, colors.length - 1));

      setActiveIndex(nextIndex);
      itemRefs.current[nextIndex]?.focus();
    },
    [colors.length]
  );

  const colorRows = React.useMemo(
    () =>
      Array.from(
        { length: Math.ceil(colors.length / COLOR_GRID_COLUMNS) },
        (_, rowIndex) =>
          colors.slice(
            rowIndex * COLOR_GRID_COLUMNS,
            (rowIndex + 1) * COLOR_GRID_COLUMNS
          )
      ),
    [colors]
  );

  return (
    <div
      aria-colcount={COLOR_GRID_COLUMNS}
      aria-label={label}
      aria-rowcount={colorRows.length + (children ? 1 : 0)}
      className={cn(
        'grid grid-cols-[repeat(10,1fr)] place-items-center gap-x-1',
        className
      )}
      role="grid"
      {...props}
    >
      <TooltipProvider>
        {colorRows.map((row, rowIndex) => (
          <div className="contents" key={`row-${rowIndex}`} role="row">
            {row.map(({ isBrightColor, name, value }, columnIndex) => {
              const index = rowIndex * COLOR_GRID_COLUMNS + columnIndex;

              return (
                <ColorDropdownMenuItem
                  name={name}
                  key={name ?? value}
                  value={value}
                  isBrightColor={isBrightColor}
                  isSelected={
                    !!color && normalizeColor(color) === normalizeColor(value)
                  }
                  onFocus={() => {
                    setActiveIndex(index);
                  }}
                  onKeyDown={(event) => {
                    let nextIndex: number | undefined;

                    switch (event.key) {
                      case 'ArrowDown': {
                        nextIndex = index + COLOR_GRID_COLUMNS;
                        break;
                      }
                      case 'ArrowLeft': {
                        nextIndex = index - 1;
                        break;
                      }
                      case 'ArrowRight': {
                        nextIndex = index + 1;
                        break;
                      }
                      case 'ArrowUp': {
                        nextIndex = index - COLOR_GRID_COLUMNS;
                        break;
                      }
                      case 'End': {
                        nextIndex = colors.length - 1;
                        break;
                      }
                      case 'Home': {
                        nextIndex = 0;
                        break;
                      }
                    }

                    if (nextIndex === undefined) return;
                    if (nextIndex < 0 || nextIndex >= colors.length) return;

                    event.preventDefault();
                    event.stopPropagation();
                    focusItem(nextIndex);
                  }}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  tabIndex={index === activeIndex ? 0 : -1}
                  updateColor={updateColor}
                />
              );
            })}
          </div>
        ))}
        {children ? (
          <div className="contents" role="row">
            {children}
          </div>
        ) : null}
      </TooltipProvider>
    </div>
  );
}

export const DEFAULT_COLORS: readonly ColorOption[] = [
  {
    isBrightColor: false,
    name: 'black',
    value: '#000000',
  },
  {
    isBrightColor: false,
    name: 'dark grey 4',
    value: '#434343',
  },
  {
    isBrightColor: false,
    name: 'dark grey 3',
    value: '#666666',
  },
  {
    isBrightColor: false,
    name: 'dark grey 2',
    value: '#999999',
  },
  {
    isBrightColor: false,
    name: 'dark grey 1',
    value: '#B7B7B7',
  },
  {
    isBrightColor: false,
    name: 'grey',
    value: '#CCCCCC',
  },
  {
    isBrightColor: false,
    name: 'light grey 1',
    value: '#D9D9D9',
  },
  {
    isBrightColor: true,
    name: 'light grey 2',
    value: '#EFEFEF',
  },
  {
    isBrightColor: true,
    name: 'light grey 3',
    value: '#F3F3F3',
  },
  {
    isBrightColor: true,
    name: 'white',
    value: '#FFFFFF',
  },
  {
    isBrightColor: false,
    name: 'red berry',
    value: '#980100',
  },
  {
    isBrightColor: false,
    name: 'red',
    value: '#FE0000',
  },
  {
    isBrightColor: false,
    name: 'orange',
    value: '#FE9900',
  },
  {
    isBrightColor: true,
    name: 'yellow',
    value: '#FEFF00',
  },
  {
    isBrightColor: false,
    name: 'green',
    value: '#00FF00',
  },
  {
    isBrightColor: false,
    name: 'cyan',
    value: '#00FFFF',
  },
  {
    isBrightColor: false,
    name: 'cornflower blue',
    value: '#4B85E8',
  },
  {
    isBrightColor: false,
    name: 'blue',
    value: '#1300FF',
  },
  {
    isBrightColor: false,
    name: 'purple',
    value: '#9900FF',
  },
  {
    isBrightColor: false,
    name: 'magenta',
    value: '#FF00FF',
  },

  {
    isBrightColor: false,
    name: 'light red berry 3',
    value: '#E6B8AF',
  },
  {
    isBrightColor: false,
    name: 'light red 3',
    value: '#F4CCCC',
  },
  {
    isBrightColor: true,
    name: 'light orange 3',
    value: '#FCE4CD',
  },
  {
    isBrightColor: true,
    name: 'light yellow 3',
    value: '#FFF2CC',
  },
  {
    isBrightColor: true,
    name: 'light green 3',
    value: '#D9EAD3',
  },
  {
    isBrightColor: false,
    name: 'light cyan 3',
    value: '#D0DFE3',
  },
  {
    isBrightColor: false,
    name: 'light cornflower blue 3',
    value: '#C9DAF8',
  },
  {
    isBrightColor: true,
    name: 'light blue 3',
    value: '#CFE1F3',
  },
  {
    isBrightColor: true,
    name: 'light purple 3',
    value: '#D9D2E9',
  },
  {
    isBrightColor: true,
    name: 'light magenta 3',
    value: '#EAD1DB',
  },

  {
    isBrightColor: false,
    name: 'light red berry 2',
    value: '#DC7E6B',
  },
  {
    isBrightColor: false,
    name: 'light red 2',
    value: '#EA9999',
  },
  {
    isBrightColor: false,
    name: 'light orange 2',
    value: '#F9CB9C',
  },
  {
    isBrightColor: true,
    name: 'light yellow 2',
    value: '#FFE598',
  },
  {
    isBrightColor: false,
    name: 'light green 2',
    value: '#B7D6A8',
  },
  {
    isBrightColor: false,
    name: 'light cyan 2',
    value: '#A1C4C9',
  },
  {
    isBrightColor: false,
    name: 'light cornflower blue 2',
    value: '#A4C2F4',
  },
  {
    isBrightColor: false,
    name: 'light blue 2',
    value: '#9FC5E8',
  },
  {
    isBrightColor: false,
    name: 'light purple 2',
    value: '#B5A7D5',
  },
  {
    isBrightColor: false,
    name: 'light magenta 2',
    value: '#D5A6BD',
  },

  {
    isBrightColor: false,
    name: 'light red berry 1',
    value: '#CC4125',
  },
  {
    isBrightColor: false,
    name: 'light red 1',
    value: '#E06666',
  },
  {
    isBrightColor: false,
    name: 'light orange 1',
    value: '#F6B26B',
  },
  {
    isBrightColor: false,
    name: 'light yellow 1',
    value: '#FFD966',
  },
  {
    isBrightColor: false,
    name: 'light green 1',
    value: '#93C47D',
  },
  {
    isBrightColor: false,
    name: 'light cyan 1',
    value: '#76A5AE',
  },
  {
    isBrightColor: false,
    name: 'light cornflower blue 1',
    value: '#6C9EEB',
  },
  {
    isBrightColor: false,
    name: 'light blue 1',
    value: '#6FA8DC',
  },
  {
    isBrightColor: false,
    name: 'light purple 1',
    value: '#8D7CC3',
  },
  {
    isBrightColor: false,
    name: 'light magenta 1',
    value: '#C27BA0',
  },

  {
    isBrightColor: false,
    name: 'dark red berry 1',
    value: '#A61B00',
  },
  {
    isBrightColor: false,
    name: 'dark red 1',
    value: '#CC0000',
  },
  {
    isBrightColor: false,
    name: 'dark orange 1',
    value: '#E59138',
  },
  {
    isBrightColor: false,
    name: 'dark yellow 1',
    value: '#F1C231',
  },
  {
    isBrightColor: false,
    name: 'dark green 1',
    value: '#6AA74F',
  },
  {
    isBrightColor: false,
    name: 'dark cyan 1',
    value: '#45818E',
  },
  {
    isBrightColor: false,
    name: 'dark cornflower blue 1',
    value: '#3B78D8',
  },
  {
    isBrightColor: false,
    name: 'dark blue 1',
    value: '#3E84C6',
  },
  {
    isBrightColor: false,
    name: 'dark purple 1',
    value: '#664EA6',
  },
  {
    isBrightColor: false,
    name: 'dark magenta 1',
    value: '#A64D78',
  },

  {
    isBrightColor: false,
    name: 'dark red berry 2',
    value: '#84200D',
  },
  {
    isBrightColor: false,
    name: 'dark red 2',
    value: '#990001',
  },
  {
    isBrightColor: false,
    name: 'dark orange 2',
    value: '#B45F05',
  },
  {
    isBrightColor: false,
    name: 'dark yellow 2',
    value: '#BF9002',
  },
  {
    isBrightColor: false,
    name: 'dark green 2',
    value: '#38761D',
  },
  {
    isBrightColor: false,
    name: 'dark cyan 2',
    value: '#124F5C',
  },
  {
    isBrightColor: false,
    name: 'dark cornflower blue 2',
    value: '#1155CB',
  },
  {
    isBrightColor: false,
    name: 'dark blue 2',
    value: '#0C5394',
  },
  {
    isBrightColor: false,
    name: 'dark purple 2',
    value: '#351C75',
  },
  {
    isBrightColor: false,
    name: 'dark magenta 2',
    value: '#741B47',
  },

  {
    isBrightColor: false,
    name: 'dark red berry 3',
    value: '#5B0F00',
  },
  {
    isBrightColor: false,
    name: 'dark red 3',
    value: '#660000',
  },
  {
    isBrightColor: false,
    name: 'dark orange 3',
    value: '#783F04',
  },
  {
    isBrightColor: false,
    name: 'dark yellow 3',
    value: '#7E6000',
  },
  {
    isBrightColor: false,
    name: 'dark green 3',
    value: '#274E12',
  },
  {
    isBrightColor: false,
    name: 'dark cyan 3',
    value: '#0D343D',
  },
  {
    isBrightColor: false,
    name: 'dark cornflower blue 3',
    value: '#1B4487',
  },
  {
    isBrightColor: false,
    name: 'dark blue 3',
    value: '#083763',
  },
  {
    isBrightColor: false,
    name: 'dark purple 3',
    value: '#1F124D',
  },
  {
    isBrightColor: false,
    name: 'dark magenta 3',
    value: '#4C1130',
  },
];
