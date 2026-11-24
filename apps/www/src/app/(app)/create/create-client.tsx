'use client';

/* oxlint-disable react/iframe-missing-sandbox -- Next hydration reads document.cookie before app code; the preview renders trusted registry source and a scripts-only sandbox crashes hydration. */

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  createPlateCreateConfig,
  getPlateCreateCommand,
  getPlateCreateOptions,
  getPlateCreatePath,
  getPlateCreatePreset,
  getPlateCreatePreviewPath,
  getShadcnCreateUrl,
  type PlateCreateConfig,
  PLATE_CREATE_EDITORS,
} from '@/lib/plate-create';
import { PLATE_REGISTRY_BASES } from '@/lib/plate-registry-styles';
import { useMounted } from '@/registry/hooks/use-mounted';

const pickers = [
  { label: 'Style', name: 'style' },
  { label: 'Theme', name: 'theme' },
  { label: 'Base color', name: 'baseColor' },
  { label: 'Radius', name: 'radius' },
  { label: 'Font', name: 'font' },
  { label: 'Heading font', name: 'fontHeading' },
  { label: 'Menu color', name: 'menuColor' },
  { label: 'Menu accent', name: 'menuAccent' },
  { label: 'Icon library', name: 'iconLibrary' },
] as const;

type PickerName = (typeof pickers)[number]['name'];

const optionLabels: Partial<Record<PickerName, Record<string, string>>> = {
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

function postConfig(
  frame: HTMLIFrameElement | null,
  config: PlateCreateConfig
) {
  frame?.contentWindow?.postMessage(
    {
      base: config.base,
      editor: config.editor,
      preset: getPlateCreatePreset(config),
      type: 'plate-create-config',
    },
    window.location.origin
  );
}

export function CreateClient({
  initialConfig,
}: {
  initialConfig: PlateCreateConfig;
}) {
  const [config, setConfig] = React.useState(initialConfig);
  const [previewUrl] = React.useState(() =>
    getPlateCreatePreviewPath(initialConfig)
  );
  const [copied, setCopied] = React.useState(false);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const pickedMenuAccent = React.useRef(initialConfig.menuAccent);
  const { resolvedTheme } = useTheme();
  const siteDark = useMounted() && resolvedTheme === 'dark';
  const { base, editor } = config;
  const options = getPlateCreateOptions(config);
  const disabledOptions: Partial<Record<PickerName, readonly string[]>> = {
    menuAccent: config.menuColor.endsWith('-translucent') ? ['bold'] : [],
    menuColor: siteDark ? ['inverted', 'inverted-translucent'] : [],
  };
  const command = getPlateCreateCommand(config);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.source === frameRef.current?.contentWindow &&
        event.data?.type === 'plate-create-ready'
      ) {
        postConfig(frameRef.current, config);
      }
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [config]);

  function update(patch: Partial<PlateCreateConfig>) {
    const next = createPlateCreateConfig({
      ...config,
      menuAccent: pickedMenuAccent.current,
      ...patch,
    });

    if (patch.menuAccent) pickedMenuAccent.current = patch.menuAccent;
    setConfig(next);
    window.history.replaceState(null, '', getPlateCreatePath(next));
    postConfig(frameRef.current, next);
  }

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="container mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 lg:grid-cols-[22rem_minmax(0,1fr)] lg:px-6 lg:py-16">
      <aside className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-primary">Plate Create</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Start with the editor you need.
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Pick a Plate editor, Base UI or Radix, and a shadcn look. The
            preview shows the editor as the install writes it, and the CLI
            creates the app and installs the editor in one command.
          </p>
        </div>

        <div className="space-y-5">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Editor</legend>
            <div className="space-y-2">
              {PLATE_CREATE_EDITORS.map((option) => (
                <button
                  key={option.name}
                  type="button"
                  className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted data-[selected=true]:border-primary data-[selected=true]:bg-muted"
                  data-selected={editor === option.name}
                  onClick={() => update({ editor: option.name })}
                >
                  <span className="block text-sm font-medium">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Primitives</legend>
            <div className="grid grid-cols-2 gap-2">
              {PLATE_REGISTRY_BASES.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={base === option ? 'default' : 'outline'}
                  onClick={() => update({ base: option })}
                >
                  {option === 'base' ? 'Base UI' : 'Radix'}
                </Button>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            {pickers.map(({ label, name }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={`plate-create-${name}`}>{label}</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                  disabled={options[name].length < 2}
                  id={`plate-create-${name}`}
                  value={config[name]}
                  onChange={(event) => update({ [name]: event.target.value })}
                >
                  {options[name].map((option) => (
                    <option
                      key={option}
                      disabled={disabledOptions[name]?.includes(option)}
                      value={option}
                    >
                      {optionLabels[name]?.[option] ?? toLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-mono">Preset {getPlateCreatePreset(config)}</p>
            <a
              className="inline-flex items-center gap-1.5 underline underline-offset-4"
              href={getShadcnCreateUrl(config)}
              rel="noreferrer"
              target="_blank"
            >
              Open this preset on shadcn/create
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </aside>

      <section className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-xl border bg-muted/30">
          <iframe
            ref={frameRef}
            className="h-[32rem] w-full bg-background"
            src={previewUrl}
            title="Plate create preview"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border bg-card p-2 pl-4 shadow-sm">
          <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs whitespace-nowrap sm:text-sm">
            {command}
          </code>
          <Button
            aria-label="Copy command"
            size="icon-sm"
            type="button"
            variant="outline"
            onClick={copyCommand}
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </div>
      </section>
    </div>
  );
}
