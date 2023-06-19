/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { KEY_SUGGESTION_ID, MARK_SUGGESTION } from '../constants';
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
  //     ) as any) as PlateEditor;
  //
  //     const editor = createPlateEditor({
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
    describe('when editor.marks?.[MARK_SUGGESTION] is not defined', () => {
      it('should add marks', () => {
        const input = (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any as PlateEditor;

        const editor = createPlateEditor({
          editor: input,
        });

        addSuggestionMark(editor);
        expect(editor.marks?.[MARK_SUGGESTION]).toBeTruthy();
        expect(editor.marks?.[KEY_SUGGESTION_ID]).toBeTruthy();
      });
    });
  });
});
