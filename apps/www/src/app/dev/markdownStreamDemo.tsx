'use client'
import { type HTMLAttributes, useCallback, useRef, useState } from "react";

import { streamInsertChunk } from "@platejs/ai";
import { AIChatPlugin } from "@platejs/ai/react";
import { getPluginType, KEYS, TrailingBlockPlugin } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";

import { Button } from "@/components/ui/button";
import { MarkdownJoiner } from "@/lib/markdown-joiner-transform";
import { cn } from "@/lib/utils";
import { AIKit } from "@/registry/components/editor/plugins/ai-kit";
import { AlignKit } from "@/registry/components/editor/plugins/align-kit";
import { AutoformatKit } from "@/registry/components/editor/plugins/autoformat-classic-kit";
import { BasicBlocksKit } from "@/registry/components/editor/plugins/basic-blocks-kit";
import { BasicMarksKit } from "@/registry/components/editor/plugins/basic-marks-kit";
import { BlockMenuKit } from "@/registry/components/editor/plugins/block-menu-kit";
import { CalloutKit } from "@/registry/components/editor/plugins/callout-kit";
import { CodeBlockKit } from "@/registry/components/editor/plugins/code-block-kit";
import { ColumnKit } from "@/registry/components/editor/plugins/column-kit";
import { CommentKit } from "@/registry/components/editor/plugins/comment-kit";
import { CursorOverlayKit } from "@/registry/components/editor/plugins/cursor-overlay-kit";
import { DateKit } from "@/registry/components/editor/plugins/date-kit";
import { DiscussionKit } from "@/registry/components/editor/plugins/discussion-kit";
import { DndKit } from "@/registry/components/editor/plugins/dnd-kit";
import { DocxKit } from "@/registry/components/editor/plugins/docx-kit";
import { EmojiKit } from "@/registry/components/editor/plugins/emoji-kit";
import { ExitBreakKit } from "@/registry/components/editor/plugins/exit-break-kit";
import { FontKit } from "@/registry/components/editor/plugins/font-kit";
import { LineHeightKit } from "@/registry/components/editor/plugins/line-height-kit";
import { LinkKit } from "@/registry/components/editor/plugins/link-kit";
import { ListKit } from "@/registry/components/editor/plugins/list-kit";
import { MarkdownKit } from "@/registry/components/editor/plugins/markdown-kit";
import { MathKit } from "@/registry/components/editor/plugins/math-kit";
import { MediaKit } from "@/registry/components/editor/plugins/media-kit";
import { MentionKit } from "@/registry/components/editor/plugins/mention-kit";
import { SlashKit } from "@/registry/components/editor/plugins/slash-kit";
import { SuggestionKit } from "@/registry/components/editor/plugins/suggestion-kit";
import { TableKit } from "@/registry/components/editor/plugins/table-kit";
import { TocKit } from "@/registry/components/editor/plugins/toc-kit";
import { ToggleKit } from "@/registry/components/editor/plugins/toggle-kit";
import { Editor, EditorContainer } from "@/registry/ui/editor";
const testScenarios = {
  // Basic markdown with complete elements
  columns: [
    "<",
    "column",
    "_group",
    ">\n",
    " ",
    " <",
    "column",
    " width",
    "=\"",
    "33",
    ".",
    "333",
    "333",
    "333",
    "333",
    "336",
    "%\">\n",
    "   ",
    " ",
    "1",
    "\n",
    " ",
    " </",
    "column",
    ">\n",
    " ",
    " <",
    "column",
    " width",
    "=\"",
    "33",
    ".",
    "333",
    "333",
    "333",
    "333",
    "336",
    "%\">\n",
    "   ",
    " ",
    "2",
    "\n",
    " ",
    " </",
    "column",
    ">\n",
    " ",
    " <",
    "column",
    " width",
    "=\"",
    "33",
    ".",
    "333",
    "333",
    "333",
    "333",
    "336",
    "%\">\n",
    "   ",
    " ",
    "3",
    "\n",
    " ",
    " </",
    "column",
    ">\n",
    "</",
    "column",
    "_group",
    ">",
  ],
  listWithImage: [
    "## ",
    "Links ",
    "and ",
    "Images\n\n",
    "- [Link ",
    "to OpenA",
    "I](https://www.openai.com)\n",
    "- ![Sample Image](https://via.placeholder.com/150)\n\n",
  ]
};

const transformedChunks = (chunks: string[]) => {
  const result = [];
  const joiner = new MarkdownJoiner();
  for (const chunk of chunks) {
    const processed = joiner.processText(chunk);
    if (processed) {
      result.push(processed);
    }
  }
  // flush any remaining buffered content
  const remaining = joiner.flush();
  if (remaining) {
    result.push(remaining);
  }
  return result;
}


const Tokens = ({ activeIndex, chunks, ...props }: { activeIndex: number; chunks: TChunks[] } & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="bg-gray-100 h-[500px] overflow-y-auto my-1 p-4 rounded font-mono " {...props}>
      {
        chunks.map((chunk, index) => {

          return <div key={index} className="py-1">
            {
              chunk.chunks.map((c, j) => {
                const lineBreak = c.text.replaceAll('\n', '⤶')
                const space = lineBreak.replaceAll(' ', '␣')

                return (
                  <span key={j} className={cn(
                    "inline-block border p-1 mx-1 rounded",
                    activeIndex && c.index < activeIndex && 'bg-amber-500'
                  )}>{space}</span>
                )
              })
            }
          </div>
        })
      }
    </div>
  )
}

export const MarkdownStreamDemo = () => {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof testScenarios>('columns');
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const isPauseRef = useRef(false);
  const streamSessionRef = useRef(0);

  const editor = usePlateEditor({
    plugins: [
      ...AIKit,
      ...BlockMenuKit,

      // Elements
      ...BasicBlocksKit,
      ...CodeBlockKit,
      ...TableKit,
      ...ToggleKit,
      ...TocKit,
      ...MediaKit,
      ...CalloutKit,
      ...ColumnKit,
      ...MathKit,
      ...DateKit,
      ...LinkKit,
      ...MentionKit,

      // Marks
      ...BasicMarksKit,
      ...FontKit,

      // Block Style
      ...ListKit,
      ...AlignKit,
      ...LineHeightKit,

      // Collaboration
      ...DiscussionKit,
      ...CommentKit,
      ...SuggestionKit,

      // Editing
      ...SlashKit,
      ...AutoformatKit,
      ...CursorOverlayKit,
      ...DndKit,
      ...EmojiKit,
      ...ExitBreakKit,
      TrailingBlockPlugin,

      // Parsers
      ...DocxKit,
      ...MarkdownKit,
    ],
    value: [],
  }, []);


  const currentChunks = testScenarios[selectedScenario];
  const transformedCurrentChunks = transformedChunks(currentChunks);

  const onStreaming = useCallback(async () => {
    streamSessionRef.current += 1;
    const sessionId = streamSessionRef.current;

    isPauseRef.current = false;
    setActiveIndex(0);
    // editor.tf.setValue([]);

    editor.setOption(AIChatPlugin, 'streaming', false);
    editor.setOption(AIChatPlugin, '_blockChunks', '');
    editor.setOption(AIChatPlugin, '_blockPath', null);

    for (let i = 0; i < transformedCurrentChunks.length; i++) {
      while (isPauseRef.current) {
        if (sessionId !== streamSessionRef.current) return;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (sessionId !== streamSessionRef.current) return;

      setActiveIndex(i + 1);

      const chunk = transformedCurrentChunks[i]

      streamInsertChunk(editor, chunk, {
        textProps: {
          [getPluginType(editor, KEYS.ai)]: true,
        },
      });

      await new Promise(resolve => setTimeout(resolve, 50));
      if (sessionId !== streamSessionRef.current) return;
    }
  }, [editor, transformedCurrentChunks]);


  return (
    <section className="p-20 ">
      <div className="mb-10">
        {/* Scenario Selection */}
        <div className="mb-4">
          <span className="block text-sm font-medium mb-2">Test Scenario:</span>
          <select
            className="border rounded px-3 py-2 w-64"
            value={selectedScenario}
            onChange={(e) => {
              setSelectedScenario(e.target.value as keyof typeof testScenarios);
              setActiveIndex(0);
              editor.tf.setValue([]);
            }}
          >
            <option value="columns">Columns</option>
            <option value="listWithImage">List with Image</option>
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 mb-4">
          <Button onClick={onStreaming}>Start Streaming</Button>

          <Button onClick={() => isPauseRef.current = !isPauseRef.current}>
            {isPauseRef.current ? 'Resume' : 'Pause'}
          </Button>

          <Button onClick={() => {
            if (activeIndex > 0) {
              editor.tf.setValue([])

              editor.setOption(AIChatPlugin, 'streaming', false);
              editor.setOption(AIChatPlugin, '_blockChunks', '');
              editor.setOption(AIChatPlugin, '_blockPath', null);

              for (const chunk of transformedCurrentChunks.slice(0, activeIndex - 1)) {
                streamInsertChunk(editor, chunk, {
                  textProps: {
                    [getPluginType(editor, KEYS.ai)]: true,
                  },
                });
              }
              setActiveIndex(prev => Math.max(0, prev - 1));
            }
          }}>Prev</Button>

          <Button onClick={() => {
            if (activeIndex < transformedCurrentChunks.length) {
              editor.tf.setValue([])

              editor.setOption(AIChatPlugin, 'streaming', false);
              editor.setOption(AIChatPlugin, '_blockChunks', '');
              editor.setOption(AIChatPlugin, '_blockPath', null);

              for (const chunk of transformedCurrentChunks.slice(0, activeIndex + 1)) {
                streamInsertChunk(editor, chunk, {
                  textProps: {
                    [getPluginType(editor, KEYS.ai)]: true,
                  },
                });
              }
              setActiveIndex(prev => Math.min(transformedCurrentChunks.length, prev + 1));
            }
          }}>Next</Button>


          <Button onClick={(() => {
            editor.setOption(AIChatPlugin, 'streaming', false);
            editor.setOption(AIChatPlugin, '_blockChunks', '');
            editor.setOption(AIChatPlugin, '_blockPath', null);

            streamInsertChunk(editor, 'test', {
              textProps: {
                [getPluginType(editor, KEYS.ai)]: true,
              },
            });
          })}>Test Button</Button>
        </div>

      </div>

      <div className="flex gap-10 my-2">
        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Transformed Chunks ({activeIndex}/{transformedCurrentChunks.length})</h3>
          <Tokens activeIndex={activeIndex} chunks={splitChunksByLinebreak(transformedCurrentChunks)} />
        </div>

        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Editor Output</h3>
          <Plate editor={editor}>
            <EditorContainer className="border rounded h-[500px] overflow-y-auto">
              <Editor
                variant="demo"
                className="pb-[20vh]"
                placeholder="Type something..."
                spellCheck={false}
              />
            </EditorContainer>
          </Plate>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Raw Token Comparison</h2>
      <div className="flex gap-10 my-2">
        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Original Chunks</h3>
          <Tokens activeIndex={0} chunks={splitChunksByLinebreak(currentChunks)} />
        </div>

        <div className="w-1/2">
          <h3 className="font-semibold mb-2">Raw Markdown Text</h3>
          <textarea
            className={cn("w-full border rounded h-[500px] overflow-y-auto p-4 font-mono text-sm")}
            readOnly
            value={currentChunks.join('')}
          />
        </div>
      </div>
    </section>
  );
};





type TChunks = {
  chunks: {
    index: number;
    text: string;
  }[];
  linebreaks: number;
}

function splitChunksByLinebreak(chunks: string[]) {
  const result: TChunks[] = [];
  let current: { index: number; text: string; }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    current.push({ index: i, text: chunk });

    const match = /(\n+)$/.exec(chunk);
    if (match) {
      const linebreaks = match[1].length;
      result.push({
        chunks: [...current],
        linebreaks,
      });
      current = [];
    }
  }

  if (current.length > 0) {
    result.push({
      chunks: [...current],
      linebreaks: 0,
    });
  }

  return result;
}


