'use client';

import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, useEditorPlugin } from '@udecode/plate-common/react';
import {
  ExperimentalLintPlugin,
  caseLintPlugin,
  replaceLintPlugin,
} from '@udecode/plate-lint/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { type Gemoji, gemoji } from 'gemoji';

import {
  useCreateEditor,
  viewComponents,
} from '@/registry/default/components/editor/use-create-editor';
import { Button } from '@/registry/default/plate-ui/button';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { LintLeaf } from '@/registry/default/plate-ui/lint-leaf';
import { LintPopover } from '@/registry/default/plate-ui/lint-popover';

export default function LintEmojiDemo() {
  const editor = useCreateEditor({
    override: {
      components: viewComponents,
    },
    plugins: [
      ExperimentalLintPlugin.configure({
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
      {
        children: [
          {
            text: 'hello world! this is a test. new sentence here. the cat is happy.',
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
  const { api, editor } = useEditorPlugin(ExperimentalLintPlugin);

  const runFirst = () => {
    api.lint.run([
      {
        ...replaceLintPlugin.configs.all,
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
          maxSuggestions: 5,
          replaceMap: emojiMap,
        },
      },
    ]);
  };

  const runMax = () => {
    api.lint.run([
      replaceLintPlugin.configs.all,
      {
        languageOptions: {
          parserOptions: {
            maxLength: 4,
          },
        },
        settings: {
          replaceMap: emojiMap,
        },
      },
    ]);
  };

  const runAll = () => {
    api.lint.run([
      replaceLintPlugin.configs.all,
      {
        settings: {
          replaceMap: emojiMap,
        },
      },
    ]);
  };

  const runCase = () => {
    api.lint.run([
      caseLintPlugin.configs.all,
      {
        settings: {
          ignoredWords: ['iPhone', 'iOS', 'iPad'],
        },
      },
    ]);
  };

  const runBoth = () => {
    api.lint.run([
      replaceLintPlugin.configs.all,
      caseLintPlugin.configs.all,
      {
        settings: {
          ignoredWords: ['iPhone', 'iOS', 'iPad'],
          replaceMap: emojiMap,
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
        <Button size="md" className="mb-4 px-4" onClick={runCase}>
          Case
        </Button>
        <Button size="md" className="mb-4 px-4" onClick={runBoth}>
          Both
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

const excludeWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'for',
  'from',
  'if',
  'in',
  'into',
  'is',
  'it',
  'no',
  'not',
  'of',
  'on',
  'or',
  'such',
  'that',
  'the',
  'their',
  'then',
  'there',
  'these',
  'they',
  'this',
  'to',
  'was',
  'was',
  'will',
  'with',
]);

type WordSource = 'description' | 'exact_name' | 'name' | 'tag';

function splitWords(text: string): string[] {
  return text.toLowerCase().split(/[^\d_a-z]+/);
}

const emojiMap = new Map<
  string,
  (Gemoji & { text: string; type: 'emoji' })[]
>();

gemoji.forEach((emoji) => {
  const wordSources = new Map<string, WordSource>();

  // Priority 1: Exact name matches (highest priority)
  emoji.names.forEach((name) => {
    const nameLower = name.toLowerCase();
    splitWords(name).forEach((word) => {
      if (!excludeWords.has(word)) {
        // If the name is exactly this word, it gets highest priority
        wordSources.set(word, word === nameLower ? 'exact_name' : 'name');
      }
    });
  });

  // Priority 3: Tags
  emoji.tags.forEach((tag) => {
    splitWords(tag).forEach((word) => {
      if (!excludeWords.has(word) && !wordSources.has(word)) {
        wordSources.set(word, 'tag');
      }
    });
  });

  // Priority 4: Description (lowest priority)
  if (emoji.description) {
    splitWords(emoji.description).forEach((word) => {
      if (!excludeWords.has(word) && !wordSources.has(word)) {
        wordSources.set(word, 'description');
      }
    });
  }

  wordSources.forEach((source, word) => {
    if (!emojiMap.has(word)) {
      emojiMap.set(word, []);
    }

    const emojis = emojiMap.get(word)!;

    const insertIndex = emojis.findIndex((e) => {
      const existingSource = getWordSource(e, word);

      return source > existingSource;
    });

    if (insertIndex === -1) {
      emojis.push({
        ...emoji,
        text: emoji.emoji,
        type: 'emoji',
      });
    } else {
      emojis.splice(insertIndex, 0, {
        ...emoji,
        text: emoji.emoji,
        type: 'emoji',
      });
    }
  });
});

function getWordSource(emoji: Gemoji, word: string): WordSource {
  // Check for exact name match first
  if (emoji.names.some((name) => name.toLowerCase() === word))
    return 'exact_name';
  // Then check for partial name matches
  if (emoji.names.some((name) => splitWords(name).includes(word)))
    return 'name';
  if (emoji.tags.some((tag) => splitWords(tag).includes(word))) return 'tag';

  return 'description';
}
