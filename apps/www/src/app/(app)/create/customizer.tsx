'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  getPlateCreateCommand,
  getPlateCreateOptions,
  getPlateCreatePreset,
  getShadcnCreateUrl,
  isPlateCreateBase,
  isPlateCreateEditor,
  type PlateCreateConfig,
  PLATE_CREATE_EDITORS,
} from '@/lib/plate-create';
import type { PlateCreateTheme } from '@/lib/plate-create-theme';
import { PLATE_REGISTRY_BASES } from '@/lib/plate-registry-styles';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/registry/hooks/use-mobile';
import { useMounted } from '@/registry/hooks/use-mounted';

import {
  AccentSample,
  baseSamples,
  iconLibrarySamples,
  menuSample,
  radiusSample,
  styleSamples,
} from './create-samples';
import {
  Picker,
  PickerContent,
  PickerGroup,
  PickerLabel,
  PickerRadioGroup,
  PickerRadioItem,
  PickerSeparator,
  PickerTrigger,
} from './picker';

export type CreatePatch = Partial<PlateCreateConfig>;

type PickerMenuGroup = {
  choices: ReadonlyArray<{ disabled?: boolean; label: string; value: string }>;
  label?: string;
  patch: (value: string) => CreatePatch;
  value: string;
};

type PickerRow = {
  groups: readonly PickerMenuGroup[];
  label: string;
  name: string;
  previews: boolean;
  sample: React.ReactNode;
  value: string;
};

type OptionName = Exclude<
  keyof PlateCreateConfig,
  'base' | 'chartColor' | 'editor' | 'menuColor'
>;

const optionLabels: Partial<Record<string, Record<string, string>>> = {
  iconLibrary: {
    hugeicons: 'HugeIcons',
    lucide: 'Lucide',
    phosphor: 'Phosphor Icons',
    remixicon: 'Remix Icon',
    tabler: 'Tabler Icons',
  },
  menuColor: {
    default: 'Default / Solid',
    'default-translucent': 'Default / Translucent',
    inverted: 'Inverted / Solid',
    'inverted-translucent': 'Inverted / Translucent',
  },
};

const wordLabels: Record<string, string> = {
  dm: 'DM',
  eb: 'EB',
  ibm: 'IBM',
  jetbrains: 'JetBrains',
};

const toLabel = (value: string) =>
  value === 'inherit'
    ? 'Same as body'
    : value
        .split('-')
        .map(
          (word) => wordLabels[word] ?? word[0].toUpperCase() + word.slice(1)
        )
        .join(' ');

const getMenuColor = (inverted: boolean, translucent: boolean) =>
  `${inverted ? 'inverted' : 'default'}${translucent ? '-translucent' : ''}` as const;

const baseLabel = (base: string) => (base === 'base' ? 'Base UI' : 'Radix');

function getPickerRows({
  config,
  siteDark,
  theme,
}: {
  config: PlateCreateConfig;
  siteDark: boolean;
  theme: PlateCreateTheme | null;
}): PickerRow[][] {
  const options = getPlateCreateOptions(config);
  const dark = theme?.cssVars.dark;
  const bodyFont = theme?.fonts.find(
    ({ variable }) => variable !== '--font-heading'
  );
  const headingFont =
    theme?.fonts.find(({ variable }) => variable === '--font-heading') ??
    bodyFont;
  const inverted = config.menuColor.startsWith('inverted');
  const translucent = config.menuColor.endsWith('-translucent');
  const dot = (color: string | undefined) =>
    color && (
      <span
        className="size-4 rounded-full"
        style={{ backgroundColor: color }}
      />
    );
  const fontSample = (family: string | undefined) => (
    <span style={{ fontFamily: family }}>Aa</span>
  );
  const option = (
    name: OptionName,
    label: string,
    sample: React.ReactNode,
    groups: ReadonlyArray<readonly string[]> = [options[name]]
  ): PickerRow => ({
    groups: groups.map((choices) => ({
      choices: choices.map((value) => ({
        disabled: name === 'menuAccent' && translucent && value === 'bold',
        label: optionLabels[name]?.[value] ?? toLabel(value),
        value,
      })),
      patch: (value) => ({ [name]: value }),
      value: config[name],
    })),
    label,
    name,
    previews: true,
    sample,
    value:
      name === 'fontHeading' && config.fontHeading === 'inherit'
        ? toLabel(config.font)
        : (optionLabels[name]?.[config[name]] ?? toLabel(config[name])),
  });

  return [
    [
      {
        groups: [
          {
            choices: PLATE_CREATE_EDITORS.map(({ name, title }) => ({
              label: title,
              value: name,
            })),
            patch: (value) =>
              isPlateCreateEditor(value) ? { editor: value } : {},
            value: config.editor,
          },
        ],
        label: 'Editor',
        name: 'editor',
        previews: false,
        sample: null,
        value:
          PLATE_CREATE_EDITORS.find(({ name }) => name === config.editor)
            ?.title ?? config.editor,
      },
      {
        groups: [
          {
            choices: PLATE_REGISTRY_BASES.map((value) => ({
              label: baseLabel(value),
              value,
            })),
            patch: (value) => (isPlateCreateBase(value) ? { base: value } : {}),
            value: config.base,
          },
        ],
        label: 'Base',
        name: 'base',
        previews: false,
        sample: baseSamples[config.base],
        value: baseLabel(config.base),
      },
    ],
    [option('style', 'Style', styleSamples[config.style])],
    [
      option('baseColor', 'Base color', dot(dark?.['muted-foreground'])),
      option(
        'theme',
        'Theme',
        dot(
          dark?.[
            config.theme === config.baseColor ? 'muted-foreground' : 'primary'
          ]
        ),
        [
          options.theme.filter((value) => value === config.baseColor),
          options.theme.filter((value) => value !== config.baseColor),
        ]
      ),
    ],
    [
      option('fontHeading', 'Heading', fontSample(headingFont?.family)),
      option('font', 'Font', fontSample(bodyFont?.family)),
    ],
    [
      option(
        'iconLibrary',
        'Icon library',
        iconLibrarySamples[config.iconLibrary]
      ),
      option('radius', 'Radius', radiusSample, [
        options.radius.filter((value) => value === 'default'),
        options.radius.filter((value) => value !== 'default'),
      ]),
    ],
    [
      {
        groups: [
          {
            choices: [
              { label: 'Default', value: 'default' },
              { disabled: siteDark, label: 'Inverted', value: 'inverted' },
            ],
            label: 'Color',
            patch: (value) => ({
              menuColor: getMenuColor(value === 'inverted', translucent),
            }),
            value: inverted ? 'inverted' : 'default',
          },
          {
            choices: [
              { label: 'Solid', value: 'solid' },
              { label: 'Translucent', value: 'translucent' },
            ],
            label: 'Appearance',
            patch: (value) => ({
              menuColor: getMenuColor(inverted, value === 'translucent'),
            }),
            value: translucent ? 'translucent' : 'solid',
          },
        ],
        label: 'Menu',
        name: 'menuColor',
        previews: true,
        sample: menuSample,
        value: optionLabels.menuColor?.[config.menuColor] ?? config.menuColor,
      },
      option(
        'menuAccent',
        'Menu accent',
        <AccentSample accent={config.menuAccent} />
      ),
    ],
  ];
}

const button =
  "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border bg-clip-padding px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const cardFooter =
  'flex min-w-0 items-center gap-2 rounded-b-xl border-t bg-muted/50 p-3 md:flex-col md:**:[button,a]:w-full';

export function Customizer({
  config,
  onPick,
  onPreview,
  onPreviewEnd,
}: {
  config: PlateCreateConfig;
  onPick: (patch: CreatePatch) => void;
  onPreview: (patch: CreatePatch) => void;
  onPreviewEnd: () => void;
}) {
  const isMobile = useIsMobile();
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const siteDark = useMounted() && resolvedTheme === 'dark';
  const theme = useSampleTheme(config);
  const sections = getPickerRows({ config, siteDark, theme });
  const lastRow = sections.at(-1)?.at(-1);

  return (
    <div
      ref={anchorRef}
      className="group/card dark isolate z-10 flex max-h-full min-h-0 w-full flex-col gap-3 self-start overflow-hidden rounded-[calc(var(--radius)*1.8)] bg-card/90 pt-3 text-sm text-card-foreground ring-1 ring-foreground/10 backdrop-blur-xl md:w-(--customizer-width)"
      data-size="sm"
      data-slot="card"
    >
      {theme && theme.fonts.length > 0 && (
        <style>
          {theme.fonts
            .map(
              (font) =>
                `@import url('https://cdn.jsdelivr.net/npm/${font.dependency}/index.css');`
            )
            .join('\n')}
        </style>
      )}
      <div
        className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-3 md:overflow-y-auto"
        data-slot="card-content"
      >
        <div
          className="group/field-group flex w-full flex-row gap-2.5 py-px **:data-[slot=field-separator]:-mx-4 **:data-[slot=field-separator]:w-auto md:flex-col md:gap-3.25"
          data-slot="field-group"
        >
          {sections.map((rows, index) => (
            <React.Fragment key={rows[0].name}>
              {index > 0 && (
                <div
                  className="relative -my-2 hidden h-5 text-sm md:block"
                  data-slot="field-separator"
                >
                  <div
                    className="absolute inset-0 top-1/2 h-px w-full shrink-0 bg-border"
                    data-slot="separator"
                  />
                </div>
              )}
              {rows.map((row) => (
                <div
                  key={row.name}
                  className={cn(
                    'group/picker relative',
                    row === lastRow && 'pr-3 md:pr-0'
                  )}
                >
                  <Picker
                    onOpenChange={(open) => {
                      if (!open) onPreviewEnd();
                    }}
                  >
                    <PickerTrigger
                      disabled={
                        row.groups.flatMap((group) => group.choices).length < 2
                      }
                    >
                      <div className="flex flex-col justify-start text-left">
                        <div className="text-xs text-muted-foreground">
                          {row.label}
                        </div>
                        <div className="line-clamp-1 max-w-[80%] truncate text-sm font-medium text-foreground">
                          {row.value}
                        </div>
                      </div>
                      {row.sample && (
                        <div className="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5 *:[svg]:size-4">
                          {row.sample}
                        </div>
                      )}
                    </PickerTrigger>
                    <PickerContent
                      align={isMobile ? 'center' : 'start'}
                      anchor={isMobile ? anchorRef : undefined}
                      side={isMobile ? 'top' : 'right'}
                      onMouseLeave={row.previews ? onPreviewEnd : undefined}
                    >
                      {row.groups.map((group, groupIndex) => (
                        <React.Fragment key={group.label ?? groupIndex}>
                          {groupIndex > 0 && <PickerSeparator />}
                          <PickerGroup>
                            {group.label && (
                              <PickerLabel>{group.label}</PickerLabel>
                            )}
                            <PickerRadioGroup
                              value={group.value}
                              onItemPreview={
                                row.previews && !isMobile
                                  ? (value) => onPreview(group.patch(value))
                                  : undefined
                              }
                              onValueChange={(value) =>
                                onPick(group.patch(value))
                              }
                            >
                              {group.choices.map((choice) => (
                                <PickerRadioItem
                                  key={choice.value}
                                  closeOnClick={isMobile}
                                  disabled={choice.disabled}
                                  value={choice.value}
                                >
                                  {choice.label}
                                </PickerRadioItem>
                              ))}
                            </PickerRadioGroup>
                          </PickerGroup>
                        </React.Fragment>
                      ))}
                    </PickerContent>
                  </Picker>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div
        className={cn(cardFooter, 'md:rounded-b-none')}
        data-slot="card-footer"
      >
        <CopyButton
          className={cn(
            button,
            'min-w-0 flex-1 touch-manipulation border-border bg-transparent! px-2! py-0! text-sm! transition-none hover:bg-muted! hover:text-foreground md:flex-none dark:border-input pointer-coarse:h-10!'
          )}
          text={`--preset ${getPlateCreatePreset(config)}`}
        >
          {(copied) => (
            <span className="block min-w-0 truncate">
              {copied ? 'Copied' : `--preset ${getPlateCreatePreset(config)}`}
            </span>
          )}
        </CopyButton>
      </div>
      <div
        className={cn(cardFooter, '-mt-3 hidden md:flex')}
        data-slot="card-footer"
      >
        <GetCode config={config} />
      </div>
    </div>
  );
}

function useSampleTheme(config: PlateCreateConfig) {
  const { base } = config;
  const preset = getPlateCreatePreset(config);
  const [theme, setTheme] = React.useState<PlateCreateTheme | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/create/theme?${new URLSearchParams({ base, preset })}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (response.ok) {
          setTheme((await response.json()) as PlateCreateTheme);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [base, preset]);

  return theme;
}

function CopyButton({
  children,
  text,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> & {
  children: (copied: boolean) => React.ReactNode;
  text: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      {...props}
    >
      {children(copied)}
    </button>
  );
}

function GetCode({ config }: { config: PlateCreateConfig }) {
  const command = getPlateCreateCommand(config);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            button,
            'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
          )}
          type="button"
        >
          Get Code
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Code</DialogTitle>
          <DialogDescription>
            Run this command to create an app with this editor and preset.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 rounded-xl border bg-card p-2 pl-4 shadow-sm">
          <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap sm:text-sm">
            {command}
          </code>
          <Button
            aria-label="Copy command"
            asChild
            size="icon-sm"
            variant="outline"
          >
            <CopyButton text={command}>
              {(copied) => (copied ? <Check /> : <Copy />)}
            </CopyButton>
          </Button>
        </div>
        <a
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4"
          href={getShadcnCreateUrl(config)}
          rel="noreferrer"
          target="_blank"
        >
          Open this preset on shadcn/create
          <ExternalLink className="size-3" />
        </a>
      </DialogContent>
    </Dialog>
  );
}
