import Prism from 'prismjs';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import type React from 'react';
import {
  useSyncExternalStore,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import { type Descendant, NodeApi } from '@platejs/plite';
import { isHotkey } from '@platejs/plite-dom';
import {
  Editable,
  type RenderElementProps,
  Plite,
  type PliteRangeDecoration,
  useEditor,
  usePliteEditor,
  usePliteRangeDecorationSource,
} from '@platejs/plite-react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { cn } from '@/utils/cn';
import { Button, Icon, Toolbar } from './components';
import type {
  CodeBlockElement,
  CodeLineElement,
  CustomEditor,
  CustomElement,
  CustomText,
  CustomValue,
} from './custom-types.d';
import { normalizeTokens } from './utils/normalize-tokens';

const ParagraphType = 'paragraph';
const CodeBlockType = 'code-block';
const CodeLineType = 'code-line';
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
      children: toCodeLines(`// Add the initial value.
const initialValue = [
  {
    type: 'paragraph',
    children: [{ text: 'A line of text in a paragraph.' }]
  }
]

const App = () => {
  const editor = usePliteEditor({
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
      children: toCodeLines(`// TypeScript users only add this code
import { Descendant } from '@platejs/plite'
import { usePliteEditor } from '@platejs/plite-react'

type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }
type CustomValue = CustomElement[]

const editor = usePliteEditor<CustomValue>({ initialValue })`),
    },
    {
      type: ParagraphType,
      children: toChildren('There you have it!'),
    },
  ];
  const editor = usePliteEditor({ initialValue });
  const commitVersion = useSyncExternalStore(
    (listener) => editor.subscribeCommit(listener),
    () => editor.read((state) => state.value.lastCommit()?.version ?? 0),
    () => 0
  );
  const codeHighlightingSource = usePliteRangeDecorationSource(editor, {
    deps: [commitVersion],
    id: 'code-highlighting',
    dirtiness: 'always',
    read: ({ snapshot }) => collectCodeRanges(snapshot.children),
  });

  return (
    <Plite decorationSources={[codeHighlightingSource]} editor={editor}>
      <ExampleToolbar />
      <Editable
        onKeyDown={(event) => {
          if (isHotkey(['mod+shift+c', 'mod+alt+c'], event)) {
            convertSelectionToCodeBlock(editor);
            return true;
          }

          if (preventLeadingCodeBlockBackspace(editor, event)) {
            return true;
          }

          const isTab = isHotkey('tab', event);
          const isShiftTab = isHotkey('shift+tab', event);

          if (!isTab && !isShiftTab) {
            return;
          }

          const handledCodeLines = updateSelectedCodeLines(
            editor,
            isShiftTab ? 'outdent' : 'indent'
          );

          if (!handledCodeLines && isTab) {
            editor.update((tx) => {
              tx.text.insert(CodeIndent);
            });
          }

          return true;
        }}
        renderElement={ElementWrapper}
        renderSegment={CodeSegment}
      />
      <style>{prismThemeStyles}</style>
    </Plite>
  );
};

const ElementWrapper = (props: RenderElementProps<CustomElement>) => {
  const { attributes, children, element } = props;
  const editor = useEditor<CustomEditor>();

  if (element.type === CodeBlockType) {
    const setLanguage = (language: string) => {
      editor.update((tx) => {
        const entry = tx.nodes.find({
          at: [],
          match: (node) => node === element,
        });

        if (!entry) {
          return;
        }

        const [, path] = entry;

        tx.nodes.set({ language }, { at: path });
      });
    };

    return (
      <div
        {...attributes}
        className="plite-code-highlighting-block plite-code-highlighting-positioned"
        spellCheck={false}
      >
        <LanguageSelect
          onChange={(e) => setLanguage(e.target.value)}
          value={element.language}
        />
        {children}
      </div>
    );
  }

  if (element.type === CodeLineType) {
    return (
      <div {...attributes} className="plite-code-highlighting-positioned">
        {children}
      </div>
    );
  }

  const Tag = editor.read((state) => state.schema.isInline(element))
    ? 'span'
    : 'div';
  return (
    <Tag {...attributes} className="plite-code-highlighting-positioned">
      {children}
    </Tag>
  );
};

const CodeSegment: NonNullable<
  React.ComponentProps<
    typeof Editable<CustomText, CustomElement>
  >['renderSegment']
> = (segment, children) => {
  const data = Object.assign(
    {},
    ...segment.slices.map((slice) => slice.data ?? {})
  );
  const hasTokenClass = Object.values(data).some((value) => value === true);

  return hasTokenClass ? (
    <span
      className={cn(
        Object.entries(data).map(([key, value]) => value === true && key)
      )}
    >
      {children}
    </span>
  ) : (
    children
  );
};

const ExampleToolbar = () => (
  <Toolbar>
    <CodeBlockButton />
  </Toolbar>
);

const CodeBlockButton = () => {
  const editor = useEditor<CustomEditor>();

  return (
    <Button
      active
      data-test-id="code-block-button"
      onClick={() => convertSelectionToCodeBlock(editor)}
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
    tx.nodes.wrap(
      { type: CodeBlockType, language: 'html', children: [] },
      {
        match: (node) => NodeApi.isElement(node) && node.type === ParagraphType,
        split: true,
      }
    );
    tx.nodes.set(
      { type: CodeLineType },
      {
        match: (node) => NodeApi.isElement(node) && node.type === ParagraphType,
      }
    );
  });
};

const collectCodeRanges = (
  nodes: readonly Descendant[],
  language?: string,
  path: number[] = []
): PliteRangeDecoration<Record<string, true>>[] => {
  const ranges: PliteRangeDecoration<Record<string, true>>[] = [];

  nodes.forEach((node, nodeIndex) => {
    const nodePath = [...path, nodeIndex];
    const nodeLanguage =
      NodeApi.isElement(node) && node.type === CodeBlockType
        ? (node as CodeBlockElement).language
        : language;

    if (NodeApi.isText(node) && nodeLanguage) {
      ranges.push(...collectCodeTextRanges(node.text, nodePath, nodeLanguage));
    }

    if (NodeApi.isElement(node)) {
      ranges.push(...collectCodeRanges(node.children, nodeLanguage, nodePath));
    }
  });

  return ranges;
};

const collectCodeTextRanges = (
  text: string,
  path: number[],
  language = 'jsx'
): PliteRangeDecoration<Record<string, true>>[] => {
  const grammar = Prism.languages[language];

  if (!grammar) {
    return [];
  }

  const tokens = Prism.tokenize(text, grammar);
  const normalizedTokens = normalizeTokens(tokens);
  const ranges: PliteRangeDecoration<Record<string, true>>[] = [];
  let start = 0;

  normalizedTokens.forEach((lineTokens, lineIndex) => {
    for (const token of lineTokens) {
      const length = token.content.length;
      if (!length) {
        continue;
      }

      const end = start + length;

      ranges.push({
        data: {
          token: true,
          ...Object.fromEntries(token.types.map((type) => [type, true])),
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

type CodeIndentAction = 'indent' | 'outdent';

type EditorPoint = {
  path: number[];
  offset: number;
};

type EditorRange = {
  anchor: EditorPoint;
  focus: EditorPoint;
};

const preventLeadingCodeBlockBackspace = (
  editor: CustomEditor,
  event: React.KeyboardEvent
) => {
  if (!isHotkey('backspace', event)) {
    return false;
  }

  const snapshot = editor.read((state) => ({
    children: state.runtime.snapshot().children,
    selection: state.selection.get(),
  }));
  const selection = snapshot.selection;

  if (
    !selection ||
    !isSamePoint(selection.anchor, selection.focus) ||
    selection.anchor.offset !== 0
  ) {
    return false;
  }

  const codeLinePath = getCodeLinePath(
    snapshot.children,
    selection.anchor.path
  );

  if (!codeLinePath || codeLinePath.at(-1) !== 0) {
    return false;
  }

  const codeBlockPath = codeLinePath.slice(0, -1);
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

const updateSelectedCodeLines = (
  editor: CustomEditor,
  action: CodeIndentAction
) => {
  const snapshot = editor.read((state) => ({
    children: state.runtime.snapshot().children,
    selection: state.selection.get(),
  }));
  const selection = snapshot.selection;

  if (!selection) {
    return false;
  }

  const isCollapsed = isSamePoint(selection.anchor, selection.focus);

  if (isCollapsed && action === 'indent') {
    return false;
  }

  const codeLinePaths = getSelectedCodeLinePaths(snapshot.children, selection);

  if (!codeLinePaths.length) {
    return false;
  }

  editor.update((tx) => {
    for (const linePath of [...codeLinePaths].reverse()) {
      const textPath = getFirstTextPath(snapshot.children, linePath);

      if (!textPath) {
        continue;
      }

      if (action === 'indent') {
        tx.text.insert(CodeIndent, { at: { path: textPath, offset: 0 } });
        continue;
      }

      const outdentWidth = getOutdentWidth(snapshot.children, textPath);

      if (outdentWidth > 0) {
        tx.text.delete({
          at: {
            anchor: { path: textPath, offset: 0 },
            focus: { path: textPath, offset: outdentWidth },
          },
        });
      }
    }
  });

  return true;
};

const getSelectedCodeLinePaths = (
  children: readonly Descendant[],
  selection: EditorRange
) => {
  const [start, end] = getOrderedPoints(selection);
  const startLinePath = getCodeLinePath(children, start.path);
  const endLinePath = getCodeLinePath(children, end.path);

  if (!startLinePath || !endLinePath) {
    return [];
  }

  const startCodeBlockPath = startLinePath.slice(0, -1);
  const endCodeBlockPath = endLinePath.slice(0, -1);

  if (!isSamePath(startCodeBlockPath, endCodeBlockPath)) {
    return [];
  }

  const codeBlock = getDescendant(children, startCodeBlockPath);
  const startIndex = startLinePath.at(-1);
  const endIndex = endLinePath.at(-1);

  if (
    startIndex == null ||
    endIndex == null ||
    !codeBlock ||
    !NodeApi.isElement(codeBlock) ||
    codeBlock.type !== CodeBlockType
  ) {
    return [];
  }

  const codeLinePaths: number[][] = [];

  codeBlock.children.slice(startIndex, endIndex + 1).forEach((node, index) => {
    if (NodeApi.isElement(node) && node.type === CodeLineType) {
      codeLinePaths.push([...startCodeBlockPath, startIndex + index]);
    }
  });

  return codeLinePaths;
};

const getCodeLinePath = (
  children: readonly Descendant[],
  path: readonly number[]
) => {
  const node = getDescendant(children, path);

  if (node && NodeApi.isElement(node) && node.type === CodeLineType) {
    return [...path];
  }

  const parentPath = path.slice(0, -1);
  const parent = getDescendant(children, parentPath);

  if (parent && NodeApi.isElement(parent) && parent.type === CodeLineType) {
    return parentPath;
  }

  return null;
};

const getFirstTextPath = (
  children: readonly Descendant[],
  linePath: readonly number[]
) => {
  const line = getDescendant(children, linePath);

  if (!line || !NodeApi.isElement(line)) {
    return null;
  }

  const textIndex = line.children.findIndex((child) => NodeApi.isText(child));

  return textIndex === -1 ? null : [...linePath, textIndex];
};

const getOutdentWidth = (
  children: readonly Descendant[],
  textPath: readonly number[]
) => {
  const textNode = getDescendant(children, textPath);

  if (!textNode || !NodeApi.isText(textNode)) {
    return 0;
  }

  if (textNode.text.startsWith(CodeIndent)) {
    return CodeIndent.length;
  }

  if (textNode.text.startsWith('\t') || textNode.text.startsWith(' ')) {
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

interface LanguageSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  value?: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
}

const LanguageSelect = (props: LanguageSelectProps) => (
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

const toChildren = (content: string): CustomText[] => [{ text: content }];
const toCodeLines = (content: string): CodeLineElement[] =>
  content
    .split('\n')
    .map((line) => ({ type: CodeLineType, children: toChildren(line) }));

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
