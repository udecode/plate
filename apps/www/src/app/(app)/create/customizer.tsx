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
  getPlateAddCommand,
  getPlateCreateCommand,
  getPlateCreateOptions,
  getPlateCreatePreset,
  getShadcnCreateUrl,
  isPlateCreateBase,
  isPlateCreateEditor,
  PLATE_CREATE_EDITORS,
  PLATE_CREATE_PACKAGE_MANAGERS,
  PLATE_CREATE_TEMPLATES,
  type PlateCreateConfig,
  type PlateCreatePackageManager,
  type PlateCreateTemplate,
} from '@/lib/plate-create';
import type { PlateCreateTheme } from '@/lib/plate-create-theme';
import { PLATE_REGISTRY_BASES } from '@/lib/plate-registry-styles';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/registry/hooks/use-mobile';
import { useMounted } from '@/registry/hooks/use-mounted';

import {
  button,
  CreateMenu,
  OpenPreset,
  outlineButton,
  ResetDialog,
  useCreateActions,
} from './create-actions';
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
  'base' | 'chartColor' | 'editor' | 'menuColor' | 'rtl'
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
      {
        groups: [
          {
            choices: [
              { label: 'LTR', value: 'ltr' },
              { label: 'RTL', value: 'rtl' },
            ],
            patch: (value) => ({ rtl: value === 'rtl' }),
            value: config.rtl ? 'rtl' : 'ltr',
          },
        ],
        label: 'Direction',
        name: 'rtl',
        previews: true,
        sample: (
          <span className="font-mono text-xs font-medium">
            {config.rtl ? 'RTL' : 'LTR'}
          </span>
        ),
        value: config.rtl ? 'RTL' : 'LTR',
      },
    ],
  ];
}

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
  const actions = useCreateActions({ config, onPick });

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
        className="hidden items-center justify-between gap-2 rounded-t-xl border-b px-3 pb-3 md:flex"
        data-slot="card-header"
      >
        <CreateMenu
          onOpenPreset={() => actions.setPresetOpen(true)}
          onRandomize={actions.randomize}
          onReset={() => actions.setResetOpen(true)}
        />
      </div>
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
          className={cn(outlineButton, 'min-w-0 flex-1 md:flex-none')}
          text={`--preset ${getPlateCreatePreset(config)}`}
        >
          {(copied) => (
            <span className="block min-w-0 truncate">
              {copied ? 'Copied' : `--preset ${getPlateCreatePreset(config)}`}
            </span>
          )}
        </CopyButton>
        <OpenPreset
          className="max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none"
          label={isMobile ? 'Open' : 'Open Preset'}
          onOpen={actions.openPreset}
          onOpenChange={actions.setPresetOpen}
          open={actions.presetOpen}
        />
        <button
          className={cn(
            outlineButton,
            'max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none'
          )}
          onClick={actions.randomize}
          type="button"
        >
          <span className="w-full truncate text-center font-medium">
            Shuffle
          </span>
        </button>
        <ResetDialog
          onOpenChange={actions.setResetOpen}
          onReset={actions.reset}
          open={actions.resetOpen}
        />
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
  const [mode, setMode] = React.useState<'add' | 'create'>('create');
  const [packageManager, setPackageManager] =
    React.useState<PlateCreatePackageManager>('npm');
  const [template, setTemplate] = React.useState<PlateCreateTemplate>('next');
  const command =
    mode === 'create'
      ? getPlateCreateCommand(config, {
          packageManager,
          template: template === 'next' ? undefined : template,
        })
      : getPlateAddCommand(config, { packageManager });

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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Get Code</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new project with this editor, preset, and framework template.'
              : 'Add this editor to an existing shadcn project.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div
            className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1 text-xs"
            role="tablist"
          >
            {(
              [
                { label: 'New Project', value: 'create' },
                { label: 'Existing App', value: 'add' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                aria-selected={mode === tab.value}
                className={cn(
                  'rounded-md px-2.5 py-1 font-medium transition-colors',
                  mode === tab.value
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setMode(tab.value)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === 'create' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {PLATE_CREATE_TEMPLATES.map((item) => (
                <button
                  key={item.value}
                  aria-pressed={template === item.value}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    template === item.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setTemplate(item.value)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs">
            {PLATE_CREATE_PACKAGE_MANAGERS.map((pm) => (
              <button
                key={pm}
                aria-pressed={packageManager === pm}
                className={cn(
                  'rounded-md px-2 py-1 font-mono transition-colors',
                  packageManager === pm
                    ? 'bg-muted font-medium text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => setPackageManager(pm)}
                type="button"
              >
                {pm}
              </button>
            ))}
          </div>

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
