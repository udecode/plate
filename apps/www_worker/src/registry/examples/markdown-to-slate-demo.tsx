'use client';

import * as React from 'react';

import { MarkdownPlugin, remarkMdx, remarkMention } from '@platejs/markdown';
import { Plate, usePlateEditor } from 'platejs/react';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { useDebounce } from '@/registry/hooks/use-debounce';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const initialMarkdown = `## Basic Markdown

> The following node and marks is supported by the Markdown standard.

Format text with **bold**, _italic_, _**combined styles**_, ~~strikethrough~~, \`code\` formatting, and [hyperlinks](https://en.wikipedia.org/wiki/Hypertext).

\`\`\`javascript
// Use code blocks to showcase code snippets
function greet() {
  console.info("Hello World!")
}
\`\`\`

- Simple lists for organizing content

1. Numbered lists for sequential steps

| **Plugin**  | **Element** | **Inline** | **Void** |
| ----------- | ----------- | ---------- | -------- |
| **Heading** |             |            | No       |
| **Image**   | Yes         | No         | Yes      |
| **Mention** | Yes         | Yes        | Yes      |

![](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

- [x] Completed tasks

- [ ] Pending tasks

---

## Advanced Features

<callout>
The following node and marks are not supported in Markdown but can be serialized and deserialized using MDX or specialized UnifiedJS plugins.
</callout>

Advanced marks: <kbd>⌘ + B</kbd>,<u>underlined</u>, <mark>highlighted</mark> text, <span style="color: #93C47D;">colored text</span> and <span style="background-color: #6C9EEB;">background highlights</span> for visual emphasis.

Superscript like E=mc<sup>2</sup> and subscript like H<sub>2</sub>O demonstrate mathematical and chemical notation capabilities.

Add mentions like [Aayla Sxecura](mention:mention_id) 12312


, dates (<date>2025-05-08</date>), and math formulas ($E=mc^2$).

The table of contents feature automatically generates document structure for easy navigation.

<toc />

Math formula support makes displaying complex mathematical expressions simple.

$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

Multi-column layout features enable richer page designs and content layouts.

<column_group layout="[50,50]">
<column width="50%">
left
</column>

  <column width="50%">
    right
  </column>
</column_group>

PDF embedding makes document referencing simple and intuitive.
<file name="sample.pdf" align="center" src="https://s26.q4cdn.com/900411403/files/doc_downloads/test.pdf" width="80%" isUpload="true" />

Audio players can be embedded directly into documents, supporting online audio resources.
<audio align="center" src="https://samplelib.com/lib/preview/mp3/sample-3s.mp3" width="80%" />

Video playback features support embedding various online video resources, enriching document content.
<video align="center" src="https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4" width="80%" isUpload="true" />

:smile: :heart:
`;

export default function MarkdownDemo() {
  const [markdownValue, setMarkdownValue] = React.useState(initialMarkdown);
  const debouncedMarkdownValue = useDebounce(markdownValue, 300);

  const markdownEditor = usePlateEditor({
    plugins: [],
    value: [{ children: [{ text: markdownValue }], type: 'p' }],
  });

  const editor = usePlateEditor(
    {
      plugins: EditorKit,
      value: (editor) =>
        editor.getApi(MarkdownPlugin).markdown.deserialize(initialMarkdown, {
          remarkPlugins: [
            remarkMath,
            remarkGfm,
            remarkMdx,
            remarkMention,
            remarkEmoji as any,
          ],
        }),
    },
    []
  );

  React.useEffect(() => {
    if (debouncedMarkdownValue !== initialMarkdown) {
      editor.tf.reset();
      editor.tf.setValue(
        editor.api.markdown.deserialize(debouncedMarkdownValue, {
          remarkPlugins: [
            remarkMath,
            remarkGfm,
            remarkMdx,
            remarkMention,
            remarkEmoji as any,
          ],
        })
      );
    }
  }, [debouncedMarkdownValue, editor]);

  return (
    <div className="grid h-full grid-cols-2 overflow-y-auto">
      <Plate
        onValueChange={() => {
          const value = markdownEditor.children
            .map((node: any) => markdownEditor.api.string(node))
            .join('\n');
          setMarkdownValue(value);
        }}
        editor={markdownEditor}
      >
        <EditorContainer>
          <Editor
            variant="none"
            className="bg-muted/50 p-2 font-mono text-sm"
          />
        </EditorContainer>
      </Plate>

      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="none" className="px-4 py-2" />
        </EditorContainer>
      </Plate>
    </div>
  );
}
