'use client';
import React from 'react';

import { MarkdownPlugin } from '@platejs/markdown';
import { ElementApi, TextApi } from 'platejs';
import { createTPlatePlugin, Plate, usePlateEditor } from 'platejs/react';
import { useFilePicker } from 'use-file-picker';

import { Button } from '@/components/ui/button';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { BlockPlaceholderKit } from '@/registry/components/editor/plugins/block-placeholder-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { MarkdownKit } from '@/registry/components/editor/plugins/markdown-kit';
import { basicBlocksValue } from '@/registry/examples/values/basic-blocks-value';
import { AIChatEditor } from '@/registry/ui/ai-chat-editor';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const withCustomType = (value: any) => {
  const addCustomType = (item: any): any => {
    if (ElementApi.isElement(item)) {
      const { children, type, ...rest } = item;
      return {
        children: children.map(addCustomType),
        type: 'custom-' + type,
        ...rest,
      };
    }
    if (TextApi.isText(item)) {
      const { text, ...rest } = item;
      const props: any = {};
      for (const key in rest) {
        const value = rest[key];
        const newKey = 'custom-' + key;
        props[newKey] = value;
      }

      return {
        ...props,
        text: text.replace(/^custom-/, ''),
      };
    }
  };

  return value.map(addCustomType);
};

const withCustomPlugins = (plugins: any[]): any[] => {
  const newPlugins: any[] = [];

  plugins.forEach((plugin) => {
    newPlugins.push(
      plugin.extend({
        node: {
          type: 'custom-' + plugin.key,
        },
      })
    );
  });

  return newPlugins;
};

const value = [
  ...withCustomType(basicBlocksValue),
  // ...withCustomType(basicMarksValue),
  // ...withCustomType(tableValue),
  // ...withCustomType(codeBlockValue),
  // ...withCustomType(listValue),
  // ...listValue,
];

export const EditorViewClient = () => {
  const editor = usePlateEditor(
    {
      plugins: [
        ...withCustomPlugins([...CopilotKit, ...EditorKit]),
        ...BlockPlaceholderKit,

        createTPlatePlugin({
          key: 'ai-test',
          render: {
            afterEditable: () => (
              <AIChatEditor
                content={`| Element          | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| Third-level Headings | Provide further content structure and hierarchy.                           |
| Blockquotes      | Perfect for highlighting important information, quotes from external sources, or emphasizing key points in your content. |
| Headings         | Create a clear document structure that helps readers navigate your content effectively. |
| Combination      | Use headings with blockquotes to emphasize important information.             |`}
              />
            ),
          },
        }),
        ...MarkdownKit,
      ],
      value: value,
    },
    []
  );

  const getFileNodes = (text: string) => {
    return editor.getApi(MarkdownPlugin).markdown.deserialize(text);
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text);
    },
  });

  return (
    <>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor
            variant="demo"
            className="pb-[20vh]"
            placeholder="Type something..."
            spellCheck={false}
          />
        </EditorContainer>
      </Plate>

      <div className="mt-10 flex gap-10 px-10">
        <Button
          onClick={() => {
            console.log(editor.getApi(MarkdownPlugin).markdown.serialize());
          }}
        >
          Serialize
        </Button>

        <Button onClick={openMdFilePicker}>Deserialize</Button>

        <Button
          onClick={() => {
            console.log(editor.children);
          }}
        >
          Current Value
        </Button>
      </div>
    </>
  );
};
