import { createEditor } from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import {
  getCompiledEditorSchema,
  readCoreWork,
  tracksPlaces,
} from 'plitejs/internal';

import { EditorKit } from '../../../../apps/www/src/registry/components/editor/plugins';

describe('EditorKit carried moves', () => {
  for (const mode of ['editing', 'suggesting'] as const) {
    it(`G3: does not track places, and typing ten letters while ${mode} records no relocation`, () => {
      const editor = createEditor({
        initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
        plugins: EditorKit,
        userId: 'alice',
      });

      editor.plugin(SuggestionPlugin).api.setMode(mode);
      editor.update((tx) =>
        tx.selection.set({
          anchor: { offset: 5, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        })
      );

      const compiled = getCompiledEditorSchema(editor);
      const before = readCoreWork();

      for (let key = 0; key < 10; key += 1) {
        editor.update((tx) => tx.text.insert('x'));
      }

      const after = readCoreWork();

      expect(
        compiled.properties.lookup.element.exact.get('authored')?.length
      ).toBeGreaterThan(0);
      expect(
        (
          editor.read.children()[0] as { children: Array<{ text: string }> }
        ).children
          .map(({ text }) => text)
          .join('')
      ).toBe('helloxxxxxxxxxx');
      expect(tracksPlaces(compiled)).toBe(false);
      expect(after.relocations - before.relocations).toBe(0);
      expect(after.formerPlaceCalls - before.formerPlaceCalls).toBe(0);
    });
  }
});
