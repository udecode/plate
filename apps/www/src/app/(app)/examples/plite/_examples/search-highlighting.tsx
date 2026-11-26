import { SearchIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { NodeApi } from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  type EditableProps,
  type Editor,
  EditorRoot,
  type DecorationSource,
  useEditor,
} from 'plitejs/react';
import { memo, useMemo, useState } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/utils/cn';

import { Toolbar } from './components';
import type { CustomText, CustomValue } from './custom-types.d';
import { replaceQueryOptions } from './query-controls';

const initialValue: CustomValue = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
      },
      { text: 'decorations', bold: true },
      { text: ' to them in realtime.' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try it out for yourself by typing in the search box above!',
      },
    ],
  },
];

const SearchHighlightingExample = () => {
  const [query, setQuery] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions(replaceQueryOptions)
  );
  // nuqs echoes each throttled URL write back into its state after a later
  // render, which resets the box to an older value when typing outruns it.
  const [search, setSearch] = useState(query);
  const editor = useEditor({
    plugins: [history()],
    initialValue,
  });
  const searchSource = useMemo<DecorationSource<Editor<CustomValue>>>(
    () => ({
      id: 'search-highlighting',
      read: ({ entry: [node, path] }) => {
        if (
          !search ||
          !NodeApi.isElement(node) ||
          !node.children.every((child) => NodeApi.isText(child))
        ) {
          return [];
        }

        return NodeApi.findTextRanges(node, search, {
          caseSensitive: false,
        }).map(({ anchor, focus }) => ({
          attributes: {
            className: 'editor-search-highlighting-highlight',
            'data-cy': 'search-highlighted',
          },
          key: `search:${[...path, ...anchor.path].join('.')}:${anchor.offset}`,
          range: {
            anchor: { ...anchor, path: [...path, ...anchor.path] },
            focus: { ...focus, path: [...path, ...focus.path] },
          },
        }));
      },
    }),
    [search]
  );

  return (
    <>
      <Toolbar>
        <InputGroup className="!flex max-w-sm">
          <InputGroupInput
            onChange={(event) => {
              setSearch(event.target.value);
              void setQuery(event.target.value);
            }}
            placeholder="Search the text..."
            type="search"
            value={search}
          />
          <InputGroupAddon>
            <SearchIcon aria-hidden />
          </InputGroupAddon>
        </InputGroup>
      </Toolbar>
      <SearchHighlightingEditor editor={editor} searchSource={searchSource} />
    </>
  );
};

const SearchHighlightingEditor = memo(
  ({
    editor,
    searchSource,
  }: {
    editor: Editor<CustomValue>;
    searchSource: DecorationSource<Editor<CustomValue>>;
  }) => (
    <EditorRoot decorations={[searchSource]} editor={editor}>
      <Editable id="search-highlighting" renderLeaf={Leaf} />
    </EditorRoot>
  )
);

SearchHighlightingEditor.displayName = 'SearchHighlightingEditor';

type HighlightLeaf = Omit<CustomText, 'text'>;

const Leaf = ({
  attributes,
  children,
  leaf,
}: Parameters<NonNullable<EditableProps['renderLeaf']>>[0]) => {
  const highlightLeaf = leaf as HighlightLeaf;
  return (
    <span
      {...attributes}
      className={cn(highlightLeaf.bold && 'editor-search-highlighting-bold')}
    >
      {children}
    </span>
  );
};

export default SearchHighlightingExample;
