'use client';

import './create-preview.css';
import * as React from 'react';

import { createPreviewPages } from '@/__registry__/create-preview';
import {
  getPlateCreatePreset,
  getPlateCreatePreviewPath,
  type PlateCreateConfig,
  readPlateCreateConfig,
} from '@/lib/plate-create';
import type { PlateCreateTheme } from '@/lib/plate-create-theme';

import { IconLibraryContext } from './icon-placeholder';

type PreviewTheme = PlateCreateTheme & { preset: string };

const toDeclarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(
      ([name, value]) =>
        `${name.startsWith('--') ? name : `--${name}`}: ${value};`
    )
    .join(' ');

const getThemeCss = ({ cssVars, fonts, monoFont }: PreviewTheme) =>
  [
    ...[...fonts, ...(monoFont ? [monoFont] : [])].map(
      (font) =>
        `@import url('https://cdn.jsdelivr.net/npm/${font.dependency}/index.css');`
    ),
    `:root { ${toDeclarations({
      ...cssVars.light,
      ...cssVars.theme,
      ...(monoFont && { [monoFont.variable]: monoFont.family }),
      ...Object.fromEntries(
        fonts.flatMap(({ family, variable }) =>
          // shadcn's install puts a mono or serif body font's utility class on
          // <html>, so the preview's font-sans text takes that font too.
          variable === '--font-heading'
            ? [[variable, family]]
            : [
                [variable, family],
                ['--font-sans', family],
              ]
        )
      ),
    })} }`,
    `.dark { ${toDeclarations(cssVars.dark)} }`,
  ].join('\n');

export function CreatePreview({
  initialConfig,
  initialTheme,
}: {
  initialConfig: PlateCreateConfig;
  initialTheme: PreviewTheme | null;
}) {
  const [config, setConfig] = React.useState(initialConfig);
  const [theme, setTheme] = React.useState(initialTheme);
  const [failedPreset, setFailedPreset] = React.useState<string | null>(null);
  const { base, editor } = initialConfig;
  const { menuColor, style } = config;
  const preset = getPlateCreatePreset(config);
  const Page = createPreviewPages[`${base}/${editor}`];

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.data?.type !== 'plate-create-config'
      ) {
        return;
      }

      const next = readPlateCreateConfig(event.data);
      const path = getPlateCreatePreviewPath(next);

      if (next.base !== base || next.editor !== editor) {
        window.location.replace(path);

        return;
      }

      window.history.replaceState(null, '', path);
      setConfig(next);
    };

    window.addEventListener('message', onMessage);

    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'plate-create-ready' },
        window.location.origin
      );
    }

    return () => window.removeEventListener('message', onMessage);
  }, [base, editor]);

  const themeFailed = failedPreset === preset;

  React.useEffect(() => {
    const controller = new AbortController();

    if (theme?.preset !== preset && !themeFailed) {
      fetch(`/api/create/theme?${new URLSearchParams({ base, preset })}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`theme ${response.status}`);

          setTheme({
            ...((await response.json()) as PlateCreateTheme),
            preset,
          });
        })
        .catch(() => {
          if (!controller.signal.aborted) setFailedPreset(preset);
        });
    }

    return () => controller.abort();
  }, [base, preset, theme?.preset, themeFailed]);

  React.useEffect(() => {
    const { classList } = document.body;
    const previous = [...classList].filter((name) => name.startsWith('style-'));

    classList.remove(...previous);
    classList.add(`style-${style}`);

    return () => {
      classList.remove(`style-${style}`);
      classList.add(...previous);
    };
  }, [style]);

  // shadcn's install rewrites each menu's cn-menu classes for the picked menu
  // color, so the preview rewrites every menu the same way as it mounts.
  React.useLayoutEffect(() => {
    const inverted = menuColor.startsWith('inverted');
    const translucent = menuColor.endsWith('-translucent');
    const paint = () => {
      for (const menu of document.querySelectorAll('.cn-menu-target')) {
        menu.classList.toggle('dark', inverted);

        if (translucent && menu.hasAttribute('data-menu-translucent')) {
          menu.classList.add('cn-menu-translucent');
          menu.removeAttribute('data-menu-translucent');
        } else if (
          !translucent &&
          menu.classList.contains('cn-menu-translucent')
        ) {
          menu.classList.remove('cn-menu-translucent');
          menu.setAttribute('data-menu-translucent', '');
        }
      }
    };
    const observer = new MutationObserver(paint);

    paint();
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [menuColor]);

  return (
    <>
      {theme && !themeFailed && <style>{getThemeCss(theme)}</style>}
      <div
        className="relative bg-background"
        data-preview-base={base}
        data-preview-editor={editor}
        data-preview-style={style}
      >
        {themeFailed && (
          <p
            className="border-b bg-muted px-4 py-2 text-sm text-muted-foreground"
            data-slot="theme-error"
            role="status"
          >
            shadcn's theme service did not answer, so the preview shows the
            default theme.
          </p>
        )}
        <IconLibraryContext value={config.iconLibrary}>
          <React.Suspense fallback={null}>
            <Page />
          </React.Suspense>
        </IconLibraryContext>
      </div>
    </>
  );
}
