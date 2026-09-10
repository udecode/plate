import { SearchIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { NodeApi } from 'plitejs';
import {
  Editable,
  type EditableProps,
  type Editor,
  Plite,
  type PliteDecorationSource,
  useEditor,
} from 'plitejs/react';
import { memo, useMemo } from 'react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { cn } from '@/utils/cn';

import { Toolbar } from './components';
import type { CustomText, CustomValue } from './custom-types.d';
import { replaceQueryOptions } from './query-controls';

const SearchHighlightingExample = () => {
  const [search, setSearch] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions(replaceQueryOptions)
  );
  const editor = useEditor<CustomValue>({
    initialValue: [
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
    ],
  });
  const searchSource = useMemo<PliteDecorationSource<Editor<CustomValue>>>(
    () => ({
      id: 'search-highlighting',
      read: ({ entry: [node, path] }) => {
        if (!search || !NodeApi.isText(node)) return [];

        const ranges = [];
        const haystack = node.text.toLocaleLowerCase();
        const needle = search.toLocaleLowerCase();
        let start = haystack.indexOf(needle);

        while (start !== -1) {
          const end = start + needle.length;

          ranges.push({
            attributes: {
              className: 'plite-search-highlighting-highlight',
              'data-cy': 'search-highlighted',
            },
            key: `search:${path.join('.')}:${start}:${end}`,
            range: {
              anchor: { offset: start, path },
              focus: { offset: end, path },
            },
          });
          start = haystack.indexOf(needle, end);
        }

        return ranges;
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
              void setSearch(event.target.value);
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
    searchSource: PliteDecorationSource<Editor<CustomValue>>;
  }) => (
    <Plite decorations={[searchSource]} editor={editor}>
      <Editable id="search-highlighting" renderLeaf={Leaf} />
    </Plite>
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
      className={cn(highlightLeaf.bold && 'plite-search-highlighting-bold')}
    >
      {children}
    </span>
  );
};

export default SearchHighlightingExample;
