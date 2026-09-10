import {
  type Descendant,
  type Element,
  NodeApi,
  type NodeEntry,
  type Path,
  type Point,
  type Range,
} from 'plitejs';
import { isHotkey } from 'plitejs/dom';
import { history } from 'plitejs/history';
import {
  Editable,
  Plite,
  type PliteDecoration,
  type PliteDecorationSource,
  type RenderElementProps,
  useEditor,
  useEditorContext,
} from 'plitejs/react';
import type React from 'react';
import type { ChangeEvent, PointerEvent } from 'react';

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { cn } from '@/utils/cn';

import { Button, Icon, Toolbar } from './components';
import type {
  CodeBlockElement,
  CustomEditor,
  CustomElement,
  CustomText,
  CustomValue,
} from './custom-types.d';
import { normalizeTokens } from './utils/normalize-tokens';
import { Prism } from './utils/prism-runtime';

const ParagraphType = 'paragraph';
const CodeBlockType = 'code-block';
const CodeIndent = '  ';

const CodeHighlightingExample = () => {
  const initialValue: CustomValue = [
    {
      type: ParagraphType,
      children: toChildren(
        "Here's one containing a single paragraph block with some text in it:"
      ),
    },
    {
      type: CodeBlockType,
      language: 'jsx',
      children: toChildren(`// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const editor = useEditor({
    initialValue,
  })

  return (
    <Plite editor={editor}>
      <Editable />
    </Plite>
  )
}`),
    },
    {
      type: ParagraphType,
      children: toChildren(
        'If you are using TypeScript, create the editor from the final value shape and pass extension factories at creation time. The example below includes the custom types required for the rest of this example.'
      ),
    },
    {
      type: CodeBlockType,
      language: 'typescript',
      children: toChildren(`// TypeScript users only add this code
import { Descendant } from 'plitejs'
import { useEditor } from 'plitejs/react'

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }
type CustomValue = CustomElement[]

const editor = useEditor<CustomValue>({ initialValue })`),
    },
    {
      type: ParagraphType,
      children: toChildren('There you have it!'),
    },
  ];
  const editor = useEditor({ extensions: [history()], initialValue });

  return (
    <Plite decorations={[codeHighlightingSource]} editor={editor}>
      <ExampleToolbar />
      <Editable
        onKeyDown={(event) => {
          if (isHotkey(['mod+shift+c', 'mod+alt+c'], event)) {
            convertSelectionToCodeBlock(editor);
            return true;
          }

          if (insertCodeBlockBreak(editor, event)) {
            return true;
          }

          if (preventLeadingCodeBlockBackspace(editor, event)) {
            return true;
          }

          const isTab = isHotkey('tab', event);
          const isShiftTab = isHotkey('shift+tab', event);

          if (!isTab && !isShiftTab) {
            return undefined;
          }

          const handledCode = updateSelectedCode(
            editor,
            isShiftTab ? 'outdent' : 'indent'
          );

          if (!handledCode && isTab) {
            editor.update.text.insert(CodeIndent);
          }

          return true;
        }}
        renderElement={ElementWrapper}
      />
      <style>{prismThemeStyles}</style>
    </Plite>
  );
};

const ElementWrapper = (props: RenderElementProps<CustomElement>) => {
  const { attributes, children, element } = props;
  const editor = useEditorContext();

  if (element.type === CodeBlockType) {
    const setLanguage = (language: string) => {
      editor.update.nodes.set({ language }, { at: element });
    };

    return (
      <div
        {...attributes}
        className="plite-code-highlighting-block plite-code-highlighting-positioned"
        spellCheck={false}
      >
        <LanguageSelect
          onChange={(e) => {
            setLanguage(e.target.value);
          }}
          value={element.language}
        />
        {children}
      </div>
    );
  }

  const Tag = editor.read.schema.isInline(element) ? 'span' : 'div';
  return (
    <Tag {...attributes} className="plite-code-highlighting-positioned">
      {children}
    </Tag>
  );
};

const ExampleToolbar = () => (
  <Toolbar>
    <CodeBlockButton />
  </Toolbar>
);

const CodeBlockButton = () => {
  const editor = useEditorContext();

  return (
    <Button
      active
      data-test-id="code-block-button"
      onClick={() => {
        convertSelectionToCodeBlock(editor);
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      }}
    >
      <Icon>code</Icon>
    </Button>
  );
};

const convertSelectionToCodeBlock = (editor: CustomEditor) => {
  editor.update((tx) => {
    const selection = tx.selection();

    if (!selection) return;

    const [start, end] = getOrderedPoints(selection);
    const startBlock = tx.nodes.block({ at: start });
    const endBlock = tx.nodes.block({ at: end });

    if (!startBlock || !endBlock) return;

    const parentPath = startBlock[1].slice(0, -1);
    const endParentPath = endBlock[1].slice(0, -1);
    const startIndex = startBlock[1].at(-1);
    const endIndex = endBlock[1].at(-1);

    if (
      startIndex == null ||
      endIndex == null ||
      !isSamePath(parentPath, endParentPath)
    ) {
      return;
    }

    const blocks: Array<NodeEntry<Element>> = [];

    for (let index = startIndex; index <= endIndex; index++) {
      const entry = tx.nodes.get([...parentPath, index]);

      if (entry && NodeApi.isElement(entry[0])) {
        blocks.push(entry as NodeEntry<Element>);
      }
    }

    const firstBlock = blocks[0];

    if (!firstBlock) return;

    const values = blocks.map(([block]) => NodeApi.string(block));
    const mapPoint = (point: Point) => {
      let offset = 0;

      for (let index = 0; index < blocks.length; index++) {
        const [, blockPath] = blocks[index];

        if (isAncestorPath(blockPath, point.path)) {
          const blockStart = tx.points.start(blockPath);
          const range = blockStart && tx.ranges.get(blockStart, point);

          offset += range ? tx.text.string(range).length : 0;

          return { offset, path: [...firstBlock[1], 0] };
        }

        offset += values[index].length + 1;
      }

      return point;
    };
    const nextSelection = {
      anchor: mapPoint(selection.anchor),
      focus: mapPoint(selection.focus),
    };

    for (const [, blockPath] of blocks.slice(1).reverse()) {
      tx.nodes.remove({ at: blockPath });
    }

    tx.nodes.replace(
      {
        children: toChildren(values.join('\n')),
        language: 'html',
        type: CodeBlockType,
      },
      { at: firstBlock[1] }
    );
    tx.selection.set(nextSelection);
  });
};

const collectCodeTextRanges = (
  text: string,
  path: Path,
  language = 'jsx'
): PliteDecoration[] => {
  const grammar = Prism.languages[language];

  if (!grammar) {
    return [];
  }

  const tokens = Prism.tokenize(text, grammar);
  const normalizedTokens = normalizeTokens(tokens);
  const ranges: PliteDecoration[] = [];
  let start = 0;

  normalizedTokens.forEach((lineTokens, lineIndex) => {
    for (const token of lineTokens) {
      const { length } = token.content;
      if (!length) {
        continue;
      }

      const end = start + length;

      ranges.push({
        attributes: {
          className: cn('token', token.types),
          'data-token': true,
        },
        key: `code:${path.join('.')}:${start}:${end}`,
        range: {
          anchor: { path, offset: start },
          focus: { path, offset: end },
        },
      });

      start = end;
    }

    if (lineIndex < normalizedTokens.length - 1) {
      start += 1;
    }
  });

  return ranges;
};

const codeHighlightingSource = {
  id: 'code-highlighting',
  read: ({ entry: [node, path] }) =>
    NodeApi.isElement(node) && node.type === CodeBlockType
      ? collectCodeTextRanges(
          NodeApi.string(node),
          [...path, 0],
          (node as CodeBlockElement).language
        )
      : [],
} satisfies PliteDecorationSource<CustomEditor>;

type CodeIndentAction = 'indent' | 'outdent';

type EditorPoint = Point;
type EditorRange = Range;

const insertCodeBlockBreak = (
  editor: CustomEditor,
  event: React.KeyboardEvent
) => {
  if (!isHotkey('enter', event)) {
    return false;
  }

  const snapshot = editor.read((state) => ({
    children: state.children(),
    selection: state.selection(),
  }));
  const { selection } = snapshot;

  if (!selection) return false;

  const [start, end] = getOrderedPoints(selection);
  const codeBlockPath = getCodeBlockPath(snapshot.children, start.path);
  const endCodeBlockPath = getCodeBlockPath(snapshot.children, end.path);

  if (
    !codeBlockPath ||
    !endCodeBlockPath ||
    !isSamePath(codeBlockPath, endCodeBlockPath) ||
    !isSamePath(start.path, end.path)
  ) {
    return false;
  }

  const textNode = getDescendant(snapshot.children, start.path);

  if (!textNode || !NodeApi.isText(textNode)) return false;

  const lineStart =
    textNode.text.lastIndexOf('\n', Math.max(0, start.offset - 1)) + 1;
  const lineBreak = textNode.text.indexOf('\n', start.offset);
  const line = textNode.text.slice(
    lineStart,
    lineBreak === -1 ? textNode.text.length : lineBreak
  );
  const indentDepth = line.search(/\S|$/);
  const suffixIndent =
    textNode.text.slice(end.offset).match(/^[ \t]*/)?.[0].length ?? 0;
  const indent = ' '.repeat(Math.max(0, indentDepth - suffixIndent));

  editor.update.text.insert(`\n${indent}`, { at: selection });

  return true;
};

const preventLeadingCodeBlockBackspace = (
  editor: CustomEditor,
  event: React.KeyboardEvent
) => {
  if (!isHotkey('backspace', event)) {
    return false;
  }

  const snapshot = editor.read((state) => ({
    children: state.children(),
    selection: state.selection(),
  }));
  const { selection } = snapshot;

  if (
    !selection ||
    !isSamePoint(selection.anchor, selection.focus) ||
    selection.anchor.offset !== 0
  ) {
    return false;
  }

  const codeBlockPath = getCodeBlockPath(
    snapshot.children,
    selection.anchor.path
  );

  if (!codeBlockPath) return false;

  const codeBlock = getDescendant(snapshot.children, codeBlockPath);

  if (
    !codeBlock ||
    !NodeApi.isElement(codeBlock) ||
    codeBlock.type !== CodeBlockType
  ) {
    return false;
  }

  event.preventDefault();

  return true;
};

const updateSelectedCode = (editor: CustomEditor, action: CodeIndentAction) => {
  const snapshot = editor.read((state) => ({
    children: state.children(),
    selection: state.selection(),
  }));
  const { selection } = snapshot;

  if (!selection) {
    return false;
  }

  const isCollapsed = isSamePoint(selection.anchor, selection.focus);

  if (isCollapsed && action === 'indent') {
    return false;
  }

  const [start, end] = getOrderedPoints(selection);
  const codeBlockPath = getCodeBlockPath(snapshot.children, start.path);
  const endCodeBlockPath = getCodeBlockPath(snapshot.children, end.path);

  if (
    !codeBlockPath ||
    !endCodeBlockPath ||
    !isSamePath(codeBlockPath, endCodeBlockPath) ||
    !isSamePath(start.path, end.path)
  ) {
    return false;
  }

  const textNode = getDescendant(snapshot.children, start.path);

  if (!textNode || !NodeApi.isText(textNode)) return false;

  const lineStarts = getSelectedLineStarts(
    textNode.text,
    start.offset,
    end.offset
  ).reverse();

  editor.update((tx) => {
    for (const lineStart of lineStarts) {
      if (action === 'indent') {
        tx.text.insert(CodeIndent, {
          at: { path: start.path, offset: lineStart },
        });
        continue;
      }

      const outdentWidth = getOutdentWidth(textNode.text, lineStart);

      if (outdentWidth > 0) {
        tx.text.delete({
          at: {
            anchor: { path: start.path, offset: lineStart },
            focus: {
              path: start.path,
              offset: lineStart + outdentWidth,
            },
          },
        });
      }
    }
  });

  return true;
};

const getCodeBlockPath = (
  children: readonly Descendant[],
  path: readonly number[]
) => {
  const parentPath = path.slice(0, -1);
  const parent = getDescendant(children, parentPath);

  if (parent && NodeApi.isElement(parent) && parent.type === CodeBlockType) {
    return parentPath;
  }

  return null;
};

const getSelectedLineStarts = (text: string, start: number, end: number) => {
  const starts = [text.lastIndexOf('\n', Math.max(0, start - 1)) + 1];
  let nextBreak = text.indexOf('\n', starts[0]);

  while (nextBreak !== -1 && nextBreak < end) {
    starts.push(nextBreak + 1);
    nextBreak = text.indexOf('\n', nextBreak + 1);
  }

  return starts;
};

const getOutdentWidth = (text: string, lineStart: number) => {
  if (text.startsWith(CodeIndent, lineStart)) {
    return CodeIndent.length;
  }

  if (text.startsWith('\t', lineStart) || text.startsWith(' ', lineStart)) {
    return 1;
  }

  return 0;
};

const getDescendant = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let descendants = children;
  let node: Descendant | null = null;

  for (const index of path) {
    node = descendants[index] ?? null;

    if (!node) {
      return null;
    }

    descendants = NodeApi.isElement(node) ? node.children : [];
  }

  return node;
};

const getOrderedPoints = ({ anchor, focus }: EditorRange) =>
  comparePoints(anchor, focus) <= 0 ? [anchor, focus] : [focus, anchor];

const comparePoints = (point: EditorPoint, another: EditorPoint) => {
  const pathComparison = comparePaths(point.path, another.path);

  return pathComparison === 0 ? point.offset - another.offset : pathComparison;
};

const comparePaths = (path: readonly number[], another: readonly number[]) => {
  const length = Math.min(path.length, another.length);

  for (let index = 0; index < length; index++) {
    const left = path[index];
    const right = another[index];

    if (left !== right) {
      return left < right ? -1 : 1;
    }
  }

  return path.length - another.length;
};

const isSamePoint = (point: EditorPoint, another: EditorPoint) =>
  point.offset === another.offset && isSamePath(point.path, another.path);

const isSamePath = (path: readonly number[], another: readonly number[]) =>
  path.length === another.length &&
  path.every((segment, index) => segment === another[index]);

const isAncestorPath = (path: readonly number[], another: readonly number[]) =>
  path.length < another.length &&
  path.every((segment, index) => segment === another[index]);

const LanguageSelect = (
  props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
    value?: string;
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  }
) => (
  <NativeSelect
    className="absolute top-[5px] right-[5px] z-10"
    contentEditable={false}
    data-test-id="language-select"
    {...props}
  >
    <NativeSelectOption value="css">CSS</NativeSelectOption>
    <NativeSelectOption value="html">HTML</NativeSelectOption>
    <NativeSelectOption value="java">Java</NativeSelectOption>
    <NativeSelectOption value="javascript">JavaScript</NativeSelectOption>
    <NativeSelectOption value="jsx">JSX</NativeSelectOption>
    <NativeSelectOption value="markdown">Markdown</NativeSelectOption>
    <NativeSelectOption value="php">PHP</NativeSelectOption>
    <NativeSelectOption value="python">Python</NativeSelectOption>
    <NativeSelectOption value="sql">SQL</NativeSelectOption>
    <NativeSelectOption value="tsx">TSX</NativeSelectOption>
    <NativeSelectOption value="typescript">TypeScript</NativeSelectOption>
  </NativeSelect>
);

const toChildren = (content: string): [CustomText] => [{ text: content }];

// Prismjs theme stored as a string for copy/pasting alternate themes.
// It is useful for copy/pasting different themes. Also lets keeping simpler Leaf implementation
// In the real project better to use just css file
const prismThemeStyles = `
/**
 * prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */

code[class*="language-"],
pre[class*="language-"] {
    color: black;
    background: none;
    text-shadow: 0 1px white;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
}

pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
    text-shadow: none;
    background: #b3d4fc;
}

pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
code[class*="language-"]::selection, code[class*="language-"] ::selection {
    text-shadow: none;
    background: #b3d4fc;
}

@media print {
    code[class*="language-"],
    pre[class*="language-"] {
        text-shadow: none;
    }
}

/* Code blocks */
pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
    background: #f5f2f0;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
    padding: .1em;
    border-radius: .3em;
    white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
    color: slategray;
}

.token.punctuation {
    color: #999;
}

.token.namespace {
    opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
    color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
    color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
    color: #9a6e3a;
    /* This background color was intended by the author of this theme. */
    background: hsla(0, 0%, 100%, .5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
    color: #07a;
}

.token.function,
.token.class-name {
    color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
    color: #e90;
}

.token.important,
.token.bold {
    font-weight: bold;
}
.token.italic {
    font-style: italic;
}

.token.entity {
    cursor: help;
}
`;

export default CodeHighlightingExample;
