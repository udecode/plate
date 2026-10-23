import { createEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import {
  censusRuntimeEditor,
  collectUpdateDeclarations,
} from '../../../../../packages/plitejs/test/support/plugin-dispatch-census';

describe('plugin update declarations', () => {
  it('declares every first-party method that takes arguments, including nested and function members', () => {
    const results = [
      createEditor({ plugins: BaseEditorKit }),
      censusRuntimeEditor(),
    ].map(collectUpdateDeclarations);
    for (const result of results) {
      expect(result.methods).toBeGreaterThan(0);
      expect(result.undeclared).toEqual([]);
    }
  });
});
