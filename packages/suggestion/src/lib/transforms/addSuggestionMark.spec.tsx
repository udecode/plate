/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { SUGGESTION_KEYS } from '../BaseSuggestionPlugin';
import { BaseSuggestionPlugin } from '../BaseSuggestionPlugin';
import { addSuggestionMark } from './addSuggestionMark';

jsx;

describe('addSuggestionMark', () => {
  // describe('when editor.activeSuggestionId is defined', () => {
  //   it('should not add marks', () => {
  //     const input = ((
  //       <editor>
  //         <hp>
  //           test
  //           <cursor />
  //         </hp>
  //       </editor>
  //     ) as any) as SlateEditor;
  //
  //     const editor = createSlateEditor({
  //       editor: input,
  //     });
  //     editor.activeSuggestionId = 'active_suggestion_id';
  //
  //     addSuggestionMark(editor);
  //
  //     expect(editor.marks).toBeNull();
  //   });
  // });

  describe('when editor.activeSuggestionId is not defined', () => {
    describe('when editor.marks?.[SuggestionPlugin.key] is not defined', () => {
      it('should add marks', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any as SlateEditor;

        const editor = createSlateEditor({
          editor: input,
        });

        addSuggestionMark(editor);
        expect(editor.marks?.[BaseSuggestionPlugin.key]).toBeTruthy();
        expect(editor.marks?.[SUGGESTION_KEYS.id]).toBeTruthy();
      });
    });
  });
});
