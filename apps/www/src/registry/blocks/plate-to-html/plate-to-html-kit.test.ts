import { describe, expect, it } from 'bun:test';

import { ElementIdPlugin } from 'platejs';

import { PlateToHtmlEditorKit } from '@/registry/components/editor/plate-to-html-kit';

describe('PlateToHtmlEditorKit', () => {
  it('declares the schema owner for ids in bundled example values', () => {
    expect(PlateToHtmlEditorKit).toContain(ElementIdPlugin);
  });
});
