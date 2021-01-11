/** @jsx jsx */

import { Editor, Range } from 'slate';
import { withHistory } from 'slate-history';
import { jsx } from '../../../__test-utils__/jsx';
import { deleteListFragmentDeprecated } from './deleteListFragmentDeprecated';

describe('deleteListFragmentDeprecated', () => {
  describe('unhandled', () => {
    it(`doesn't handle deletes that are within a single list item`, () => {
      const editor = ((
        <editor>
          <block>
            <hp>
              before
              <cursor />
            </hp>
            <hul>
              <hli>
                <hp>one</hp>
                <hul>
                  <hli>
                    <hp>two</hp>
                    <hul>
                      <hli>
                        <hp>three</hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>after</hp>
          </block>
        </editor>
      ) as any) as Editor;

      const actual = deleteListFragmentDeprecated(
        editor,
        editor.selection as Range,
        {}
      );

      expect(actual).toBeUndefined();
    });

    it(`doesn't handle deletes when the end is outside of the list`, () => {
      const editor = ((
        <editor>
          <block>
            <hp>
              before
              <anchor />
            </hp>
            <hul>
              <hli>
                <hp>one</hp>
                <hul>
                  <hli>
                    <hp>two</hp>
                    <hul>
                      <hli>
                        <hp>three</hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>
              after
              <focus />
            </hp>
          </block>
        </editor>
      ) as any) as Editor;

      const actual = deleteListFragmentDeprecated(
        editor,
        editor.selection as any,
        {}
      );

      expect(actual).toBeUndefined();
    });
  });

  describe('deletes top of list', () => {
    it('deletes the entire first list item from the top of the list', () => {
      const input = ((
        <editor>
          <block>
            <hp>
              <anchor />
              before
            </hp>
            <hul>
              <hli>
                <hp>
                  one
                  <focus />
                </hp>
                <hul>
                  <hli>
                    <hp>two</hp>
                    <hul>
                      <hli>
                        <hp>three</hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>after</hp>
          </block>
        </editor>
      ) as any) as any;

      const editor = withHistory(input);

      const actual = deleteListFragmentDeprecated(editor, editor.selection, {});

      expect(actual).toEqual(3);
      const expected = [
        <block>
          <hp>
            <htext />
          </hp>
          <hul>
            <hli>
              <hp>two</hp>
              <hul>
                <hli>
                  <hp>three</hp>
                </hli>
                <hli>
                  <hp>four</hp>
                </hli>
              </hul>
            </hli>
            <hli>
              <hp>five</hp>
            </hli>
            <hli>
              <hp>six</hp>
            </hli>
          </hul>
          <hp>after</hp>
        </block>,
      ];
      expect(editor.children).toEqual(expected);

      editor.undo();

      expect(editor.children).toEqual(input.children);
    });

    it('partially deletes the first list item', () => {
      const input = ((
        <editor>
          <block>
            <hp>
              <anchor />
              before
            </hp>
            <hul>
              <hli>
                <hp>
                  on
                  <focus />e
                </hp>
                <hul>
                  <hli>
                    <hp>two</hp>
                    <hul>
                      <hli>
                        <hp>three</hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>after</hp>
          </block>
        </editor>
      ) as any) as Editor;

      const editor = withHistory(input);

      const actual = deleteListFragmentDeprecated(
        editor,
        editor.selection as any,
        {}
      );

      expect(actual).toEqual(3);
      const expected = [
        <block>
          <hp>e</hp>
          <hul>
            <hli>
              <hp>two</hp>
              <hul>
                <hli>
                  <hp>three</hp>
                </hli>
                <hli>
                  <hp>four</hp>
                </hli>
              </hul>
            </hli>
            <hli>
              <hp>five</hp>
            </hli>
            <hli>
              <hp>six</hp>
            </hli>
          </hul>
          <hp>after</hp>
        </block>,
      ];
      expect(editor.children).toEqual(expected);

      editor.undo();

      expect(editor.children).toEqual(input.children);
    });
  });

  describe('deletes inside the list', () => {
    it("deep delete doesn't require moving siblings", () => {
      const input = ((
        <editor>
          <block>
            <hp>before</hp>
            <hul>
              <hli>
                <hp>one</hp>
                <hul>
                  <hli>
                    <hp>
                      <anchor />
                      two
                    </hp>
                    <hul>
                      <hli>
                        <hp>
                          three
                          <focus />
                        </hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>after</hp>
          </block>
        </editor>
      ) as any) as Editor;

      const editor = withHistory(input);

      const actual = deleteListFragmentDeprecated(
        editor,
        editor.selection as any,
        {}
      );

      expect(actual).toEqual(0);
      const expected = [
        <block>
          <hp>before</hp>
          <hul>
            <hli>
              <hp>one</hp>
              <hul>
                <hli>
                  <hp>
                    <htext />
                  </hp>
                  <hul>
                    <hli>
                      <hp>four</hp>
                    </hli>
                  </hul>
                </hli>
                <hli>
                  <hp>five</hp>
                </hli>
              </hul>
            </hli>
            <hli>
              <hp>six</hp>
            </hli>
          </hul>
          <hp>after</hp>
        </block>,
      ];
      expect(editor.children).toEqual(expected);

      editor.undo();

      expect(editor.children).toEqual(input.children);
    });

    it('delete moves siblings', () => {
      const input = ((
        <editor>
          <block>
            <hp>before</hp>
            <hul>
              <hli>
                <hp>
                  o<anchor />
                  ne
                </hp>
                <hul>
                  <hli>
                    <hp>
                      tw
                      <focus />o
                    </hp>
                    <hul>
                      <hli>
                        <hp>three</hp>
                      </hli>
                      <hli>
                        <hp>four</hp>
                      </hli>
                    </hul>
                  </hli>
                  <hli>
                    <hp>five</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>six</hp>
              </hli>
            </hul>
            <hp>after</hp>
          </block>
        </editor>
      ) as any) as Editor;

      const editor = withHistory(input);

      const actual = deleteListFragmentDeprecated(
        editor,
        editor.selection as any,
        {}
      );

      expect(actual).toEqual(2);
      const expected = [
        <block>
          <hp>before</hp>
          <hul>
            <hli>
              <hp>oo</hp>
              <hul>
                <hli>
                  <hp>five</hp>
                </hli>
                <hli>
                  <hp>three</hp>
                </hli>
                <hli>
                  <hp>four</hp>
                </hli>
              </hul>
            </hli>
            <hli>
              <hp>six</hp>
            </hli>
          </hul>
          <hp>after</hp>
        </block>,
      ];
      expect(editor.children).toEqual(expected);

      editor.undo();

      expect(editor.children).toEqual(input.children);
    });
  });
});
