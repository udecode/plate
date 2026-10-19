import { describe, expect, it } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { PLATE_REGISTRY_STYLE_NAMES } from '@/lib/plate-registry-styles';
import { createPlateRegistryItems } from '@/registry/registry';
import { PLATE_PREVIEW_STYLE_CLASSES } from '@/registry/styles/preview-style-classes';

import {
  createPreviewStyleCss,
  findRegistryStyleMarkers,
  getCommonRegistryStyleMarkers,
  loadRegistryStyleMaps,
  transformRegistryStyleSource,
} from './registry-style-transform.mts';

describe('registry style transform', () => {
  it('loads the pinned eight-style marker intersection', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const markers = getCommonRegistryStyleMarkers(styleMaps);

    expect(Object.keys(styleMaps)).toHaveLength(8);
    expect(markers.has('cn-toggle')).toBe(true);
    expect(markers.has('cn-toggle-size-sm')).toBe(true);
    expect(markers.has('cn-tooltip-content')).toBe(true);
  });

  it('materializes different static classes for Nova and Luma', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const source = `const variants = cva('cn-toggle', { variants: { size: { sm: 'cn-toggle-size-sm' } } });`;
    const nova = await transformRegistryStyleSource({
      commonMarkers,
      source,
      styleMap: styleMaps.nova,
    });
    const luma = await transformRegistryStyleSource({
      commonMarkers,
      source,
      styleMap: styleMaps.luma,
    });

    expect(nova).not.toContain('cn-toggle');
    expect(luma).not.toContain('cn-toggle');
    expect(nova).not.toBe(luma);
  });

  it('keeps isolated preview classes generated from vendored CSS', async () => {
    const styleMaps = await loadRegistryStyleMaps();

    for (const style of PLATE_REGISTRY_STYLE_NAMES) {
      for (const [marker, classes] of Object.entries(
        PLATE_PREVIEW_STYLE_CLASSES[style]
      )) {
        expect(styleMaps[style][marker], `${style}:${marker}`).toBe(classes);
      }
    }

    expect(PLATE_PREVIEW_STYLE_CLASSES.nova['cn-toggle-size-sm']).toContain(
      "[&_svg:not([class*='size-'])]:size-3.5"
    );
    expect(
      await fs.readFile(
        path.resolve(
          import.meta.dir,
          '../src/registry/styles/preview-style-classes.css'
        ),
        'utf-8'
      )
    ).toBe(createPreviewStyleCss(PLATE_PREVIEW_STYLE_CLASSES));

    const previewCss = createPreviewStyleCss(PLATE_PREVIEW_STYLE_CLASSES);

    expect(previewCss).toContain(
      ':where(.style-nova) :where(.cn-popover-content)'
    );
    expect(previewCss).toContain('@layer components {');
    expect(previewCss).not.toContain('.style-nova {');
  });

  it('fails closed on unknown and unreachable markers', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);

    await expect(
      transformRegistryStyleSource({
        commonMarkers,
        source: `const value = cn('cn-plate-invented');`,
        styleMap: styleMaps.nova,
      })
    ).rejects.toThrow('Unknown or incomplete');
    await expect(
      transformRegistryStyleSource({
        commonMarkers,
        source: 'const value = `cn-toggle ${dynamic}`;',
        styleMap: styleMaps.nova,
      })
    ).rejects.toThrow('Unreachable');
  });

  it('allows the same valid marker in separate static literals', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const transformed = await transformRegistryStyleSource({
      commonMarkers,
      source: `const one = cva('cn-toggle');\nconst two = cva('cn-toggle');`,
      styleMap: styleMaps.nova,
    });

    expect(transformed).not.toContain('cn-toggle');
  });

  it('materializes the Base and Radix toolbar canary', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const toolbarRoot = path.resolve(import.meta.dir, '../src/registry/bases');

    for (const base of ['base', 'radix']) {
      const source = await fs.readFile(
        path.join(toolbarRoot, base, 'toolbar.tsx'),
        'utf-8'
      );
      const nova = await transformRegistryStyleSource({
        commonMarkers,
        source,
        styleMap: styleMaps.nova,
      });
      const lyra = await transformRegistryStyleSource({
        commonMarkers,
        source,
        styleMap: styleMaps.lyra,
      });

      expect(source).toContain('cn-toggle');
      expect(nova).not.toContain('cn-toggle');
      expect(lyra).not.toContain('cn-toggle');
      expect(nova).toContain('rounded-lg');
      expect(lyra).toContain('rounded-none');
      expect(nova).not.toBe(lyra);
    }
  });

  it('transforms every marked active registry source for all eight styles', async () => {
    const styleMaps = await loadRegistryStyleMaps();
    const commonMarkers = getCommonRegistryStyleMarkers(styleMaps);
    const sourceRoot = path.resolve(import.meta.dir, '../src/registry');
    const activePaths = new Set(
      (['base', 'radix'] as const).flatMap((base) =>
        createPlateRegistryItems({ base }).flatMap(
          (item) => item.files?.map((file) => file.path) ?? []
        )
      )
    );
    const markedMarkers = new Set<string>();
    const markedPaths: string[] = [];

    for (const sourcePath of activePaths) {
      const source = await fs.readFile(
        path.join(sourceRoot, sourcePath),
        'utf-8'
      );

      const markers = findRegistryStyleMarkers(source);

      if (markers.length === 0) continue;
      for (const marker of markers) markedMarkers.add(marker);
      markedPaths.push(sourcePath);

      for (const style of PLATE_REGISTRY_STYLE_NAMES) {
        await expect(
          transformRegistryStyleSource({
            commonMarkers,
            source,
            styleMap: styleMaps[style],
          }),
          `${sourcePath} (${style})`
        ).resolves.not.toContain('cn-');
      }
    }

    expect(markedPaths.sort()).toEqual([
      'bases/base/floating-popover.tsx',
      'bases/base/toolbar.tsx',
      'bases/radix/floating-popover.tsx',
      'bases/radix/toolbar.tsx',
      'components/editor/inline-combobox.tsx',
      'components/editor/link.tsx',
    ]);
    expect(
      markedPaths.some((sourcePath) => sourcePath.includes('classic'))
    ).toBe(false);
    expect([...markedMarkers].sort()).toEqual(
      Object.keys(PLATE_PREVIEW_STYLE_CLASSES.nova).sort()
    );
  });
});
