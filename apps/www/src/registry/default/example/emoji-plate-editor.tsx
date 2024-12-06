'use client';

import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, useEditorPlugin } from '@udecode/plate-common/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';

import { wordToEmojisMap } from '@/components/editor/lint/emoji-utils';
import { LintLeaf } from '@/components/editor/lint/lint-leaf';
import { LintPlugin } from '@/components/editor/lint/lint-plugin';
import { emojiLintPlugin } from '@/components/editor/lint/lint-plugin-emoji';
import { LintPopover } from '@/components/editor/lint/lint-popover';
import {
  useCreateEditor,
  viewComponents,
} from '@/components/editor/use-create-editor';
import { Button } from '@/registry/default/potion-ui/button';
import { Editor, EditorContainer } from '@/registry/default/potion-ui/editor';

export function EmojiPlateEditor() {
  const editor = useCreateEditor({
    override: {
      components: viewComponents,
    },
    plugins: [
      LintPlugin.configure({
        render: {
          afterEditable: LintPopover,
          node: LintLeaf,
        },
      }),
      NodeIdPlugin,
      BasicMarksPlugin,
    ],
    value: [
      {
        children: [
          {
            text: "I'm happy to see my cat and dog. I love them even when I'm sad.",
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            text: 'I like to eat pizza and ice cream.',
          },
        ],
        type: 'p',
      },
    ],
  });

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center p-4">
      <Plate editor={editor}>
        <EmojiPlateEditorContent />
      </Plate>
    </div>
  );
}

function EmojiPlateEditorContent() {
  const { api, editor } = useEditorPlugin(LintPlugin);

  const runFirst = () => {
    api.lint.run([
      {
        ...emojiLintPlugin.configs.all,
        targets: [
          { id: editor.children[0].id as string },
          { id: editor.children[1].id as string },
        ],
      },
      {
        languageOptions: {
          parserOptions: {
            minLength: 4,
          },
        },
        targets: [{ id: editor.children[0].id as string }],
      },
      {
        settings: {
          emojiMap: wordToEmojisMap,
          maxSuggestions: 5,
        },
      },
    ]);
  };

  const runMax = () => {
    api.lint.run([
      emojiLintPlugin.configs.all,
      {
        languageOptions: {
          parserOptions: {
            maxLength: 4,
          },
        },
        settings: {
          emojiMap: wordToEmojisMap,
        },
      },
    ]);
  };

  const runAll = () => {
    api.lint.run([
      emojiLintPlugin.configs.all,
      {
        settings: {
          emojiMap: wordToEmojisMap,
        },
      },
    ]);
  };

  return (
    <>
      <div className="mb-4 flex gap-4">
        <Button size="md" className="mb-4 px-4" onClick={runFirst}>
          First
        </Button>
        <Button size="md" className="mb-4 px-4" onClick={runMax}>
          Max Length
        </Button>
        <Button size="md" className="mb-4 px-4" onClick={runAll}>
          All
        </Button>
        <Button size="md" className="mb-4 px-4" onClick={api.lint.reset}>
          Reset
        </Button>
      </div>
      <EditorContainer>
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </>
  );
}
