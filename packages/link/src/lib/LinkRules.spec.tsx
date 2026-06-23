/** @jsx jsxt */

import type { BasePlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { defineInputRule } from 'platejs';

import { getCurrentRuntimeTransforms } from '../../../core/src/internal/currentRuntimeBridge';
import { InputRulesPlugin } from '../../../core/src/lib/plugins/input-rules/internal/InputRulesPlugin';
import { createPlateRuntimeEditor } from '../../../core/src/react/editor/createPlateRuntimeEditor';
import { BaseLinkPlugin } from './BaseLinkPlugin';
import { LinkRules } from './LinkRules';
import { upsertLink } from './transforms';

jsxt;

const autolinkRules = [
  LinkRules.autolink({ variant: 'break' }),
  LinkRules.autolink({ variant: 'paste' }),
  LinkRules.autolink({ variant: 'space' }),
];

const createClipboardData = (text: string) =>
  ({
    getData: (type: string) => (type === 'text/plain' ? text : ''),
  }) as any;

const createLinkEditor = (
  input: BasePlateEditor,
  config?: {
    inputRules?: any[];
    options?: Record<string, any>;
  }
) =>
  createPlateRuntimeEditor({
    initialSelection: input.selection,
    initialValue: input.children,
    plugins: [
      config ? BaseLinkPlugin.configure(config) : BaseLinkPlugin,
      InputRulesPlugin,
    ],
  });

const root = (editor: ReturnType<typeof createLinkEditor>) =>
  editor.read((state) => state.value.root());

const selection = (editor: ReturnType<typeof createLinkEditor>) =>
  editor.read((state) => state.selection.get());

describe('LinkRules', () => {
  describe('insertData', () => {
    it('inserts a link when plain url text is pasted into a paragraph', () => {
      const input = (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertData(
        createClipboardData('http://google.com') as DataTransfer
      );

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              test
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });

    it('keeps the selected text by default when a url is pasted over a selection', () => {
      const input = (
        <editor>
          <hp>
            start <anchor />
            of regular text
            <focus />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertData(
        createClipboardData('https://google.com') as DataTransfer
      );

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              start <ha url="https://google.com">of regular text</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });

    it('can replace the selected text with the pasted url when configured', () => {
      const input = (
        <editor>
          <hp>
            start <anchor />
            of regular text
            <focus />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
        options: {
          keepSelectedTextOnPaste: false,
        },
      });
      getCurrentRuntimeTransforms(editor).insertData(
        createClipboardData('https://google.com') as DataTransfer
      );

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              start <ha url="https://google.com">https://google.com</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });

    it('keeps pasted urls literal inside markdown link source entry by default', () => {
      const input = (
        <editor>
          <hp>
            [Example](
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertData(
        createClipboardData('https://google.com') as DataTransfer
      );

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>[Example](https://google.com</hp>
          </editor>
        ).children
      );
    });

    it('lets user code opt back into eager paste autolink by redefining the rule', () => {
      const input = (
        <editor>
          <hp>
            [Example](
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;
      const CustomLinkPlugin = BaseLinkPlugin.extend({
        inputRules: [
          defineInputRule({
            target: 'insertData',
            resolve: (context) =>
              context.text
                ? {
                    shouldLink: true,
                    text: context.text,
                    url: context.text,
                  }
                : undefined,
            apply: (
              context,
              match: { shouldLink: boolean; text: string; url: string }
            ) => {
              if (match.shouldLink) {
                const inserted = upsertLink(context.editor, {
                  insertTextInLink: true,
                  text: match.url,
                  url: match.url,
                });

                if (inserted) return true;
              }

              context.editor.update((tx) => {
                tx.text.insert(match.text);
              });

              return true;
            },
          }),
        ],
      });
      const editor = createPlateRuntimeEditor({
        initialSelection: input.selection,
        initialValue: input.children,
        plugins: [
          CustomLinkPlugin.configure({ inputRules: autolinkRules }),
          InputRulesPlugin,
        ],
      });
      getCurrentRuntimeTransforms(editor).insertData(
        createClipboardData('https://google.com') as DataTransfer
      );

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              [Example](
              <ha url="https://google.com">https://google.com</ha>
              <htext />
            </hp>
          </editor>
        ).children
      );
    });
  });

  describe('insertText', () => {
    it('wraps a plain url when the trailing space is inserted', () => {
      const input = (
        <editor>
          <hp>
            link: http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;
      const output = (
        <editor>
          <hp>
            link: <ha url="http://google.com">http://google.com</ha> <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertText(' ');

      expect(root(editor)).toEqual(output.children);
      expect(selection(editor)).toEqual(output.selection);
    });

    it('respects app-level enabled overrides for space autolink', () => {
      const input = (
        <editor>
          <hp>
            link: http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: [
          LinkRules.autolink({
            enabled: () => false,
            variant: 'space',
          }),
        ],
      });
      getCurrentRuntimeTransforms(editor).insertText(' ');

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>link: http://google.com </hp>
          </editor>
        ).children
      );
    });

    it('uses getUrlHref when the visible text is not itself a valid href', () => {
      const input = (
        <editor>
          <hp>
            google.com
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
        options: {
          getUrlHref: () => 'http://google.com',
        },
      });
      getCurrentRuntimeTransforms(editor).insertText(' ');

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">google.com</ha>{' '}
            </hp>
          </editor>
        ).children
      );
    });

    it('does not wrap again when the word before the cursor is already a link', () => {
      const input = (
        <editor>
          <hp>
            <htext />
            <ha url="http://google.com">http://google.com</ha>
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertText(' ');

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>{' '}
            </hp>
          </editor>
        ).children
      );
    });
  });

  describe('insertBreak', () => {
    it('finalizes an autolink before creating the next block', () => {
      const input = (
        <editor>
          <hp>
            http://google.com
            <cursor />
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input, {
        inputRules: autolinkRules,
      });
      getCurrentRuntimeTransforms(editor).insertBreak();

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              <htext />
              <ha url="http://google.com">http://google.com</ha>
              <htext />
            </hp>
            <hp>
              <cursor />
            </hp>
          </editor>
        ).children
      );
    });

    it('falls back to the normal block split when the selection is expanded', () => {
      const input = (
        <editor>
          <hp>
            before <anchor />
            http://google.com
            <focus /> after
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input);
      getCurrentRuntimeTransforms(editor).insertBreak();

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>before </hp>
            <hp> after</hp>
          </editor>
        ).children
      );
    });
  });

  describe('removeEmpty', () => {
    it('removes an empty link after its full contents are deleted', () => {
      const input = (
        <editor>
          <hp>
            Before <ha url="http://example.com">link text</ha> after
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input);

      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 9, path: [0, 1, 0] },
        });
      });
      getCurrentRuntimeTransforms(editor).deleteFragment();

      expect(root(editor)).toEqual([
        {
          children: [{ text: 'Before ' }, { text: ' after' }],
          type: 'p',
        },
      ]);
    });

    it('keeps the link node when it still contains a zero-width space', () => {
      const input = (
        <editor>
          <hp>
            Before <ha url="http://example.com">link text</ha> after
          </hp>
        </editor>
      ) as any as BasePlateEditor;

      const editor = createLinkEditor(input);

      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 1, 0] },
          focus: { offset: 9, path: [0, 1, 0] },
        });
      });
      getCurrentRuntimeTransforms(editor).insertText('\u200B');
      editor.update((tx) => {
        tx.normalize({ force: true });
      });

      expect(root(editor)).toEqual(
        (
          <editor>
            <hp>
              Before <ha url="http://example.com">{'\u200B'}</ha> after
            </hp>
          </editor>
        ).children
      );
    });
  });
});
