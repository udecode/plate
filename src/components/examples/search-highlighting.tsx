import React, { useCallback, useMemo, useState } from 'react';
import { css } from 'emotion';
import { createEditor, Text } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { Editable, Slate } from 'slate-react-next';
import {
  CustomDecorationProps,
  CustomMarkProps,
} from 'slate-react/lib/components/custom';
import { Icon, Toolbar } from '../components';

const initialValue = [
  {
    children: [
      {
        text:
          'This is editable text that you can search. As you search, it looks for matching strings of text, and adds ',
        marks: [],
      },
      {
        text: 'decorations',
        marks: [{ type: 'bold' }],
      },
      {
        text: ' to them in realtime.',
        marks: [],
      },
    ],
  },
  {
    children: [
      {
        text: 'Try it out for yourself by typing in the search box above!',
        marks: [],
      },
    ],
  },
];

const Decoration = ({
  decoration,
  attributes,
  children,
}: CustomDecorationProps) => {
  switch (decoration.type) {
    case 'highlight':
      return (
        <span {...attributes} style={{ backgroundColor: '#ffeeba' }}>
          {children}
        </span>
      );
    default:
      return <span {...attributes}>{children}</span>;
  }
};

const Mark = ({ attributes, children, mark }: CustomMarkProps) => {
  switch (mark.type) {
    case 'bold':
      return <strong {...attributes}>{children}</strong>;
    default:
      return <span {...attributes}>{children}</span>;
  }
};

export const SearchHighlighting = () => {
  const [search, setSearch] = useState();
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const decorate = useCallback(
    ([node, path]) => {
      const ranges: any = [];

      if (search && Text.isText(node)) {
        const { text } = node;
        const parts = text.split(search);
        let offset = 0;

        parts.forEach((part, i) => {
          if (i !== 0) {
            ranges.push({
              type: 'highlight',
              anchor: { path, offset: offset - search.length },
              focus: { path, offset },
            });
          }

          offset = offset + part.length + search.length;
        });
      }

      return ranges;
    },
    [search]
  );

  return (
    <Slate editor={editor} defaultValue={initialValue}>
      <Toolbar>
        <div
          className={css`
            position: relative;
          `}
        >
          <Icon
            className={css`
              position: absolute;
              top: 0.5em;
              left: 0.5em;
              color: #ccc;
            `}
          >
            search
          </Icon>
          <input
            type="search"
            placeholder="Search the text..."
            onChange={e => setSearch(e.target.value)}
            className={css`
              padding-left: 2em;
              width: 100%;
            `}
          />
        </div>
      </Toolbar>
      <Editable
        decorate={decorate}
        renderDecoration={props => <Decoration {...props} />}
        renderMark={props => <Mark {...props} />}
      />
    </Slate>
  );
};
