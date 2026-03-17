'use client';

/* eslint-disable react-hooks/refs -- Ref usage for color picker component refs */

import type {
  DropdownMenuItemProps,
  DropdownMenuProps,
} from '@radix-ui/react-dropdown-menu';
import { useComposedRef } from '@udecode/cn';
import debounce from 'lodash/debounce.js';
import { CheckIcon, EraserIcon, PlusIcon } from 'lucide-react';
import {
  type PlateEditor,
  useEditorRef,
  useEditorSelector,
} from 'platejs/react';
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

const MAX_CUSTOM_COLORS = 19;
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

function getEditorColorMarks(editor: PlateEditor, nodeType: string): string[] {
  const usedColors = new Set<string>();

  for (const [node] of editor.api.nodes({
    at: [],
    match: (n) =>
      'text' in n &&
      typeof (n as Record<string, unknown>)[nodeType] === 'string',
    mode: 'all',
  })) {
    const color = (node as Record<string, unknown>)[nodeType] as string;
    usedColors.add(normalizeColor(color));
  }

  return Array.from(usedColors);
}

export function FontColorToolbarButton({
  children,
  nodeType,
  tooltip,
}: {
  nodeType: string;
  tooltip?: string;
} & DropdownMenuProps) {
  const editor = useEditorRef();

  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );

  const color = useEditorSelector(
    (editor) => editor.api.mark(nodeType) as string,
    [nodeType]
  );

  const [selectedColor, setSelectedColor] = React.useState<string>();
  const [updatedColor, setUpdatedColor] = React.useState<string>();
  const [open, setOpen] = React.useState(false);
  const [colorsQueue, setColorsQueue] = React.useState<string[]>([]);

  const recordColorUsage = React.useCallback((color: string) => {
    const normalized = normalizeColor(color);

    if (!isValidHexColor(normalized)) return;

    setColorsQueue((prev) => {
      const filtered = prev
        .filter((c) => c !== normalized)
        .filter(
          (c) => !DEFAULT_COLORS.some((dc) => normalizeColor(dc.value) === c)
        );

      return [normalized, ...filtered].slice(0, 30);
    });
  }, []);

  const appendColors = React.useCallback((colors: string[]) => {
    setColorsQueue((prev) => {
      const normalized = colors.map(normalizeColor).filter(isValidHexColor);
      const existingSet = new Set(prev);
      const newColors = normalized
        .filter((c) => !existingSet.has(c))
        .filter(
          (c) => !DEFAULT_COLORS.some((dc) => normalizeColor(dc.value) === c)
        );

      return [...newColors, ...prev].slice(0, 30);
    });
  }, []);

  const onToggle = React.useCallback(
    (value = !open) => {
      setOpen(value);

      if (value) {
        const colorUsed = getEditorColorMarks(editor, nodeType);
        appendColors(colorUsed);

        if (selectedColor) {
          recordColorUsage(normalizeColor(selectedColor));
        }
      }
      if (!value) {
        setUpdatedColor(undefined);

        if (editor.selection) {
          setTimeout(() => {
            editor.tf.focus();
          }, 100);
        }
      }
    },
    [open, editor, nodeType, appendColors, selectedColor, recordColorUsage]
  );

  const updateColor = React.useCallback(
    (value: string) => {
      if (editor.selection) {
        setSelectedColor(value);
        setUpdatedColor(value);

        editor.tf.select(editor.selection);
        editor.tf.addMarks({ [nodeType]: value });
      }
    },
    [editor, nodeType]
  );

  const updateColorAndClose = React.useCallback(
    (value: string) => {
      updateColor(value);
      onToggle();
    },
    [onToggle, updateColor]
  );

  const clearColor = React.useCallback(() => {
    if (editor.selection) {
      editor.tf.select(editor.selection);
      editor.tf.removeMarks(nodeType);
      onToggle();
    }
  }, [editor, onToggle, nodeType]);

  React.useEffect(() => {
    if (selectionDefined) {
      setSelectedColor(color);
    }
  }, [color, selectionDefined]);

  return (
    <DropdownMenu modal onOpenChange={onToggle} open={open}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip={tooltip}>
          {children}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <ColorPicker
          clearColor={clearColor}
          color={selectedColor || color}
          colors={DEFAULT_COLORS}
          colorsQueue={colorsQueue}
          customColors={DEFAULT_CUSTOM_COLORS}
          recordColorUsage={recordColorUsage}
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
  clearColor,
  color,
  colors,
  colorsQueue,
  customColors,
  recordColorUsage,
  updateColor,
  updateCustomColor,
  updatedColor,
  ...props
}: React.ComponentProps<'div'> & {
  colors: TColor[];
  colorsQueue: string[];
  customColors: TColor[];
  clearColor: () => void;
  recordColorUsage: (color: string) => void;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
  updatedColor?: string;
}) {
  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <ToolbarMenuGroup label="Custom Colors">
        <ColorCustom
          className="px-2"
          color={color}
          colors={colors}
          colorsQueue={colorsQueue}
          customColors={customColors}
          recordColorUsage={recordColorUsage}
          updateColor={updateColor}
          updateCustomColor={updateCustomColor}
          updatedColor={updatedColor}
        />
      </ToolbarMenuGroup>
      <ToolbarMenuGroup label="Default Colors">
        <ColorDropdownMenuItems
          className="px-2"
          color={color}
          colors={colors}
          updateColor={updateColor}
        />
      </ToolbarMenuGroup>
      {color && (
        <ToolbarMenuGroup>
          <DropdownMenuItem className="p-2" onClick={clearColor}>
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
    prev.colorsQueue === next.colorsQueue &&
    prev.customColors === next.customColors &&
    prev.updatedColor === next.updatedColor
);

function ColorCustom({
  className,
  color,
  colors,
  colorsQueue,
  customColors,
  recordColorUsage,
  updateColor,
  updateCustomColor,
  updatedColor,
  ...props
}: {
  colors: TColor[];
  colorsQueue: string[];
  customColors: TColor[];
  recordColorUsage: (color: string) => void;
  updateColor: (color: string) => void;
  updateCustomColor: (color: string) => void;
  color?: string;
  updatedColor?: string;
} & React.ComponentPropsWithoutRef<'div'>) {
  const [value, setValue] = React.useState<string>(color || '#000000');

  const fullCustomColors = React.useMemo(
    () =>
      colorsQueue
        .filter((c) => normalizeColor(c) !== normalizeColor(updatedColor || ''))
        .filter(
          (c) =>
            !DEFAULT_COLORS.some(
              (dc) => normalizeColor(dc.value) === normalizeColor(c)
            )
        )
        .filter(
          (c) =>
            !DEFAULT_CUSTOM_COLORS.some(
              (dc) => normalizeColor(dc.value) === normalizeColor(c)
            )
        )
        .map((c) => ({
          isBrightColor: computeIsBrightColor(c),
          name: c,
          value: c,
        }))
        .slice(
          0,
          MAX_CUSTOM_COLORS - customColors.length - (updatedColor ? 1 : 0)
        ),
    [colorsQueue, customColors, updatedColor]
  );

  const isColorInCollections = React.useCallback(
    (targetColor: string) =>
      colors.some(
        (c) => normalizeColor(c.value) === normalizeColor(targetColor)
      ) ||
      customColors.some(
        (c) => normalizeColor(c.value) === normalizeColor(targetColor)
      ) ||
      fullCustomColors.some(
        (c) => normalizeColor(c.value) === normalizeColor(targetColor)
      ),
    [colors, customColors, fullCustomColors]
  );

  const [customColor, setCustomColor] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!updatedColor || isColorInCollections(updatedColor)) {
      setCustomColor(null);

      return;
    }

    setCustomColor(updatedColor);
  }, [isColorInCollections, updatedColor]);

  const computedColors = React.useMemo(
    () =>
      customColor
        ? [
            ...customColors,
            {
              isBrightColor: computeIsBrightColor(customColor),
              name: customColor,
              value: customColor,
            },
            ...fullCustomColors,
          ]
        : [...customColors, ...fullCustomColors],
    [customColor, fullCustomColors, customColors]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateCustomColorDebounced = React.useCallback(
    debounce(updateCustomColor, 100),
    [updateCustomColor]
  );

  return (
    <div className={cn('flex flex-col gap-4', className)} {...props}>
      <ColorDropdownMenuItems
        color={color}
        colors={computedColors}
        updateColor={(c) => {
          updateColor(c);
          recordColorUsage(normalizeColor(c));
        }}
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
            className={cn(
              buttonVariants({
                size: 'icon',
                variant: 'outline',
              }),
              'flex size-8 items-center justify-center rounded-full'
            )}
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <span className="sr-only">Custom</span>
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
    <div className={cn('flex flex-col items-center', className)}>
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

type TColor = {
  isBrightColor: boolean;
  name: string;
  value: string;
};

function ColorDropdownMenuItem({
  className,
  isBrightColor,
  isSelected,
  name,
  updateColor,
  value,
  ...props
}: {
  isBrightColor: boolean;
  isSelected: boolean;
  value: string;
  updateColor: (color: string) => void;
  name?: string;
} & DropdownMenuItemProps) {
  const content = (
    <DropdownMenuItem
      className={cn(
        buttonVariants({
          size: 'icon',
          variant: 'outline',
        }),
        'my-1 flex size-6 items-center justify-center rounded-full border border-muted border-solid p-0 transition-all hover:scale-125',
        !isBrightColor && 'border-transparent text-white',
        className
      )}
      onSelect={(e) => {
        e.preventDefault();
        updateColor(value);
      }}
      style={{ backgroundColor: value }}
      {...props}
    >
      {isSelected ? <CheckIcon className="!size-3" strokeWidth={3} /> : null}
    </DropdownMenuItem>
  );

  return name ? (
    <Tooltip>
      <TooltipTrigger>{content}</TooltipTrigger>
      <TooltipContent className="mb-1 capitalize">{name}</TooltipContent>
    </Tooltip>
  ) : (
    content
  );
}

export function ColorDropdownMenuItems({
  className,
  color,
  colors,
  updateColor,
  ...props
}: {
  colors: TColor[];
  updateColor: (color: string) => void;
  color?: string;
} & React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(10,1fr)] place-items-center gap-x-1',
        className
      )}
      {...props}
    >
      <TooltipProvider>
        {colors.map(({ isBrightColor, name, value }) => (
          <ColorDropdownMenuItem
            isBrightColor={isBrightColor}
            isSelected={
              !!color && normalizeColor(color) === normalizeColor(value)
            }
            key={name ?? value}
            name={name}
            updateColor={updateColor}
            value={value}
          />
        ))}
        {props.children}
      </TooltipProvider>
    </div>
  );
}

export const DEFAULT_COLORS = [
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

const DEFAULT_CUSTOM_COLORS = [
  {
    isBrightColor: false,
    name: 'dark orange 3',
    value: '#783F04',
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
    name: 'light cornflower blue 1',
    value: '#6C9EEB',
  },
  {
    isBrightColor: false,
    name: 'dark magenta 3',
    value: '#4C1130',
  },
];
