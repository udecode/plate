import { describe, expect, it } from 'bun:test';

import { encodePreset } from 'shadcn/preset';

import {
  getPlateCreateCommand,
  PLATE_CREATE_EDITORS,
  PLATE_PRESET_CODES,
} from './plate-create';
import {
  PLATE_REGISTRY_BASES,
  PLATE_REGISTRY_STYLE_NAMES,
} from './plate-registry-styles';

describe('Plate create', () => {
  it('keeps every style code aligned with the installed shadcn encoder', () => {
    for (const style of PLATE_REGISTRY_STYLE_NAMES) {
      expect(encodePreset({ style })).toBe(PLATE_PRESET_CODES[style]);
    }
  });

  it('builds one direct create command for every public combination', () => {
    for (const base of PLATE_REGISTRY_BASES) {
      for (const style of PLATE_REGISTRY_STYLE_NAMES) {
        for (const editor of PLATE_CREATE_EDITORS) {
          expect(
            getPlateCreateCommand({ base, editor: editor.name, style })
          ).toBe(
            `npx shadcn@latest create @plate/${editor.name} --preset ${PLATE_PRESET_CODES[style]} --base ${base}`
          );
        }
      }
    }
  });
});
