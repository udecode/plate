'use client';

/* oxlint-disable react/iframe-missing-sandbox -- Next hydration reads document.cookie before app code; the preview renders trusted registry source and a scripts-only sandbox crashes hydration. */

import { Check, Copy, ExternalLink } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  createPlateCreateConfig,
  getPlateCreateCommand,
  getPlateCreatePreset,
  getShadcnCreateUrl,
  type PlateCreateConfig,
  PLATE_CREATE_EDITORS,
  PLATE_DEFAULT_CREATE_CONFIG,
} from '@/lib/plate-create';
import {
  type PlateRegistryStyleName,
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
} from '@/lib/plate-registry-styles';

export function CreateClient() {
  const [config, setConfig] = React.useState(PLATE_DEFAULT_CREATE_CONFIG);
  const [copied, setCopied] = React.useState(false);
  const { base, editor, style } = config;
  const preset = getPlateCreatePreset(config);
  const command = getPlateCreateCommand(config);
  const previewUrl = `/create-preview?${new URLSearchParams({
    base,
    editor,
    preset,
  })}`;

  function update(patch: Partial<PlateCreateConfig>) {
    setConfig((current) => createPlateCreateConfig({ ...current, ...patch }));
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
            Pick a Plate editor, a shadcn style, and Base UI or Radix. The CLI
            creates the app and installs the editor in one command.
          </p>
          <a
            className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
            href={getShadcnCreateUrl(config)}
            rel="noreferrer"
            target="_blank"
          >
            Customize the full theme on shadcn/create
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        <div className="space-y-5">
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

          <div className="space-y-2">
            <Label htmlFor="plate-create-style">Style</Label>
            <select
              className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              id="plate-create-style"
              value={style}
              onChange={(event) =>
                update({ style: event.target.value as PlateRegistryStyleName })
              }
            >
              {PLATE_REGISTRY_STYLE_NAMES.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <p className="font-mono text-xs text-muted-foreground">
              Preset {preset}
            </p>
          </div>

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
        </div>
      </aside>

      <section className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-xl border bg-muted/30">
          <iframe
            key={previewUrl}
            className="h-[32rem] w-full bg-background"
            src={previewUrl}
            title={`${base} ${style} ${editor} preview`}
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
