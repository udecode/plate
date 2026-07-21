/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import {
  ContentSlice,
  type Descendant,
  defineEditorExtension,
  editorCommands,
} from '@platejs/plite';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseListPlugin } from './BaseListPlugin';

jsxt;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createBaseEditor({
    plugins: [BaseListPlugin],
    selection: input.selection,
    value: input.children,
  });

  editor.update.fragment.replace(fragment);

  expect(editor.read.children()).toEqual(expected.children);
};

describe('when pasting ul > 2 li fragment', () => {
  describe('when selection in li', () => {
    it('insert lis next to the lowest li', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>three</hlic>
                </hli>
                <hli>
                  <hlic>four</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert nested lis next to the lowest li, without the leading empty lis', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert nested lis with selected lic being an empty node and with nested lis', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <cursor />
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>two</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                    <hli>
                      <hlic>two</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert nested lis with selected lic being an empty node', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert lis with missing lics due to copying lis at different levels', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
                <hli>
                  <hlic>six</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>five</hlic>
                </hli>
                <hli>
                  <hlic>six</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert a single li as text', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                twothree
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert a paragraph and a list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
          <hul>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twothree</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
            <hli>
              <hlic>
                five
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert multiple paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
          <hp>four</hp>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twothree</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
            <hli>
              <hlic>
                five
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    // Auto-correct generates a Paragraph node (in Chromium)
    it('insert autocorrect-inserted paragraph inside a list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
                four
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                twothreefour
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert simple text inside a list with selection across multiple list items', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twofour</hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={0} path={[0, 0, 0, 0]} />
            <focus offset={3} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>
                threefour
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert nested lis with selected lic being an empty node after selection removed', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={0} path={[0, 0, 0, 0]} />
            <focus offset={3} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>four</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>four</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('insert nested lis with selection across multiple lics', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>onetwo</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={3} path={[0, 0, 0, 0]} />
            <focus offset={5} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>five</hlic>
            </hli>
            <hli>
              <hlic>six</hlic>
              <hul>
                <hli>
                  <hlic>seven</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
            <hli>
              <hlic>six</hlic>
              <hul>
                <hli>
                  <hlic>seven</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection not in li', () => {
    for (const openDepth of [0, 1]) {
      it(`delegates an ${openDepth === 0 ? 'closed' : 'open'} list-root slice unchanged to one core fit`, () => {
        const input = (
          <editor>
            <hp>
              one
              <cursor />
            </hp>
          </editor>
        ) as TestEditor;
        const fragment = (
          <fragment>
            <hul>
              <hli>
                <hlic>two</hlic>
              </hli>
            </hul>
          </fragment>
        ) as any as Descendant[];
        const editor = createBaseEditor({
          plugins: [BaseListPlugin],
          selection: input.selection,
          value: input.children,
        });
        const seen: unknown[] = [];

        editor.extend(
          defineEditorExtension({
            commands: [
              editorCommands.replaceSlice.handle(({ command }, next) => {
                seen.push(command.slice);

                return next();
              }),
            ],
            name: `list-root-delegation-${openDepth}`,
          })
        );

        const slice = ContentSlice.fromJSON({
          content: fragment,
          openEnd: openDepth,
          openStart: openDepth,
        });
        const profilerGlobal = globalThis as typeof globalThis & {
          __PLITE_REACT_RENDER_PROFILER__?: {
            acceptsCoreDuration: (id: string) => boolean;
            record: (event: { id: string }) => void;
          };
        };
        const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
        const events: string[] = [];

        profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
          acceptsCoreDuration: (id) => id === 'slice-fit-input',
          record: ({ id }) => {
            if (id) events.push(id);
          },
        };

        try {
          editor.update.slice.replace(slice);
        } finally {
          profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
        }

        expect(seen).toEqual([slice]);
        expect(events).toEqual(['slice-fit-input']);
      });
    }

    it('paste the list', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });

    it('paste the list with multiple lis', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when pasted lis not contain lic', () => {
    it('normalize li children', () => {
      const input = (
        <editor>
          <hp>
            P
            <cursor />
          </hp>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hp>one</hp>
            </hli>
            <hli>
              <hp>two</hp>
              <hul>
                <hli>
                  <hp>three</hp>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as Descendant[];

      const expected = (
        <editor>
          <hp>
            P
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as TestEditor;

      editorTest(input, fragment, expected);
    });
  });
});
