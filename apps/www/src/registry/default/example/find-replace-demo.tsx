import React, { useMemo, useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { findReplaceValue } from '@/plate/demo/values/findReplaceValue';
import { Plate } from '@udecode/plate-common';
import { createPlugins } from '@udecode/plate-core';
import { createFindReplacePlugin } from '@udecode/plate-find-replace';

import { Icons } from '@/components/icons';
import { Editor } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';

export interface SearchHighlightToolbarProps {
  icon: any;
  setSearch: any;
}

export function SearchHighlightToolbar({
  icon: Icon,
  setSearch,
}: SearchHighlightToolbarProps) {
  return (
    <FixedToolbar className="h-[38px]">
      <div
        style={{
          position: 'relative',
          paddingBottom: '10px',
          marginBottom: '10px',
        }}
      >
        <Icon
          size={18}
          style={{
            position: 'absolute',
            top: '0.5em',
            left: '0.5em',
            color: '#ccc',
          }}
        />
        <input
          data-testid="ToolbarSearchHighlightInput"
          type="search"
          placeholder="Search the text..."
          onChange={(e) => setSearch(e.target.value)}
          style={{
            boxSizing: 'border-box',
            fontSize: '0.85em',
            width: '100%',
            padding: '0.5em',
            paddingLeft: '2em',
            border: '2px solid #ddd',
            background: '#fafafa',
          }}
        />
      </div>
    </FixedToolbar>
  );
}

export default function FindReplaceDemo() {
  const [search, setSearch] = useState('');

  const plugins = useMemo(
    () =>
      createPlugins(
        [
          ...basicNodesPlugins,
          createFindReplacePlugin({ options: { search } }),
        ],
        {
          components: plateUI,
        }
      ),
    [search]
  );

  return (
    <>
      <SearchHighlightToolbar icon={Icons.search} setSearch={setSearch} />

      <Plate plugins={plugins} initialValue={findReplaceValue}>
        <Editor {...editableProps} />
      </Plate>
    </>
  );
}
