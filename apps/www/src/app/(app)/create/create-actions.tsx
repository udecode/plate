'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
import { decodePreset, isPresetCode } from 'shadcn/preset';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  getPlateCreateOptions,
  type PlateCreateConfig,
  PLATE_DEFAULT_CREATE_CONFIG,
} from '@/lib/plate-create';
import { cn } from '@/lib/utils';

import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerItem,
  PickerSeparator,
  PickerShortcut,
  PickerTrigger,
} from './picker';

export const button =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border bg-clip-padding px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const outlineButton = cn(
  button,
  'touch-manipulation border-border bg-transparent! px-2! py-0! text-sm! transition-none hover:bg-muted! hover:text-foreground dark:border-input pointer-coarse:h-10!'
);

const PRESET_EXAMPLE = 'b2D0wqNxT';

const random = <T,>(values: readonly T[]) =>
  values[Math.floor(Math.random() * values.length)];

function shuffle(config: PlateCreateConfig) {
  const options = getPlateCreateOptions(config);
  const baseColor = random(options.baseColor);
  const style = random(options.style);
  const fitted = getPlateCreateOptions({ ...config, baseColor, style });

  return {
    baseColor,
    font: random(options.font),
    fontHeading: random(options.fontHeading),
    iconLibrary: random(options.iconLibrary),
    menuAccent: random(options.menuAccent),
    menuColor: random(options.menuColor),
    radius: random(fitted.radius),
    style,
    theme: random(fitted.theme),
  };
}

function readPresetInput(value: string) {
  const preset = value.trim().replace(/^--preset\s+/i, '');

  return isPresetCode(preset) ? preset : null;
}

const isTextTarget = (target: EventTarget | null) =>
  (target instanceof HTMLElement && target.isContentEditable) ||
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement;

export function useCreateActions({
  config,
  onPick,
}: {
  config: PlateCreateConfig;
  onPick: (patch: Partial<PlateCreateConfig>) => void;
}) {
  const [presetOpen, setPresetOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const randomize = () => onPick(shuffle(config));
  const reset = () => {
    onPick(PLATE_DEFAULT_CREATE_CONFIG);
    setResetOpen(false);
  };
  const onKeyDown = React.useEffectEvent((event: KeyboardEvent) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      isTextTarget(event.target)
    ) {
      return;
    }
    const key = event.key.toLowerCase();

    if (key === 'o' && !event.shiftKey) {
      setPresetOpen(true);
    } else if (key === 'r' && !event.shiftKey) {
      randomize();
    } else if (key === 'r') {
      if (resetOpen) reset();
      else setResetOpen(true);
    } else {
      return;
    }
    event.preventDefault();
  });

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => onKeyDown(event);

    document.addEventListener('keydown', down);

    return () => document.removeEventListener('keydown', down);
  }, []);

  return {
    openPreset: (preset: string) => onPick(decodePreset(preset) ?? {}),
    presetOpen,
    randomize,
    reset,
    resetOpen,
    setPresetOpen,
    setResetOpen,
  };
}

export function CreateMenu({
  onOpenPreset,
  onRandomize,
  onReset,
}: {
  onOpenPreset: () => void;
  onRandomize: () => void;
  onReset: () => void;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Picker>
      <PickerTrigger className="flex items-center justify-between gap-2 rounded-lg px-1.75 ring-1 ring-foreground/10 focus-visible:ring-1">
        <span className="font-medium">Menu</span>
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M4 8.5H20M4 15.5H20" />
        </svg>
      </PickerTrigger>
      <PickerContent align="start" alignOffset={-8} side="right">
        <PickerGroup>
          <PickerItem onClick={onOpenPreset}>
            Open Preset... <PickerShortcut>O</PickerShortcut>
          </PickerItem>
          <PickerItem onClick={onRandomize}>
            Shuffle <PickerShortcut>R</PickerShortcut>
          </PickerItem>
          <PickerItem
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
          >
            Light/Dark <PickerShortcut>D</PickerShortcut>
          </PickerItem>
        </PickerGroup>
        <PickerSeparator />
        <PickerGroup>
          <PickerItem onClick={onReset}>
            Reset <PickerShortcut>⇧R</PickerShortcut>
          </PickerItem>
        </PickerGroup>
      </PickerContent>
    </Picker>
  );
}

export function OpenPreset({
  className,
  label,
  onOpen,
  onOpenChange,
  open,
}: {
  className?: string;
  label: string;
  onOpen: (preset: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [input, setInput] = React.useState('');
  const preset = readPresetInput(input);
  const invalid = input.trim().length > 0 && preset === null;
  const changeOpen = (next: boolean) => {
    onOpenChange(next);
    if (!next) setInput('');
  };

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <button className={cn(outlineButton, className)} type="button">
          {label}
        </button>
      </DialogTrigger>
      <DialogContent className="dark text-foreground">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!preset) return;
            onOpen(preset);
            changeOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Open Preset</DialogTitle>
            <DialogDescription>
              Paste a preset code to load a saved configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="sr-only" htmlFor="preset-code">
              Preset code
            </label>
            <Input
              aria-invalid={invalid}
              autoCapitalize="none"
              autoCorrect="off"
              className="h-10 md:h-8"
              id="preset-code"
              onChange={(event) => setInput(event.target.value)}
              placeholder={`${PRESET_EXAMPLE} or --preset ${PRESET_EXAMPLE}`}
              spellCheck={false}
              value={input}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={!preset} type="submit">
              Open
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ResetDialog({
  onOpenChange,
  onReset,
  open,
}: {
  onOpenChange: (open: boolean) => void;
  onReset: () => void;
  open: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
          <AlertDialogDescription>
            This will reset all customization options to their default values.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
