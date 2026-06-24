import { SearchIcon } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import { memo } from 'react';
import { NodeApi } from '@platejs/plite';
import {
  Editable,
  type EditableProps,
  type ReactEditor,
  Plite,
  type PliteDecorationSource,
  usePliteEditor,
  usePliteRangeDecorationSource,
} from '@platejs/plite-react';

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
  const editor = usePliteEditor<CustomValue>({
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
  const searchSource = usePliteRangeDecorationSource<{ highlight: true }>(
    editor,
    {
      data: { highlight: true },
      deps: [search],
      id: 'search-highlighting',
      dirtiness: 'text',
      read: ({ snapshot }) =>
        search
          ? NodeApi.findTextRanges({ children: snapshot.children }, search, {
              caseSensitive: false,
            })
          : [],
    }
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
    editor: ReactEditor<CustomValue>;
    searchSource: PliteDecorationSource<{ highlight: true }>;
  }) => (
    <Plite decorationSources={[searchSource]} editor={editor}>
      <Editable
        id="search-highlighting"
        renderLeaf={Leaf}
        renderSegment={(segment, children) =>
          segment.slices.some(
            (slice) =>
              (slice.data as { highlight?: true } | undefined)?.highlight
          ) ? (
            <span
              className="plite-search-highlighting-highlight"
              data-cy="search-highlighted"
            >
              {children}
            </span>
          ) : (
            children
          )
        }
      />
    </Plite>
  )
);

interface HighlightLeaf extends CustomText {
  highlight?: boolean;
}

type SearchLeafProps = Parameters<NonNullable<EditableProps['renderLeaf']>>[0];

const Leaf = ({ attributes, children, leaf }: SearchLeafProps) => {
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
