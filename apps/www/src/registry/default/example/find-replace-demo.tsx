import React, { useMemo, useState } from 'react';

import { Plate } from '@udecode/plate-common';
import { createPlugins } from '@udecode/plate-core';
import { createFindReplacePlugin } from '@udecode/plate-find-replace';

import { Icons } from '@/components/icons';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { findReplaceValue } from '@/plate/demo/values/findReplaceValue';
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
          marginBottom: '10px',
          paddingBottom: '10px',
          position: 'relative',
        }}
      >
        <Icon
          size={18}
          style={{
            color: '#ccc',
            left: '0.5em',
            position: 'absolute',
            top: '0.5em',
          }}
        />
        <input
          data-testid="ToolbarSearchHighlightInput"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the text..."
          style={{
            background: '#fafafa',
            border: '2px solid #ddd',
            boxSizing: 'border-box',
            fontSize: '0.85em',
            padding: '0.5em',
            paddingLeft: '2em',
            width: '100%',
          }}
          type="search"
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

      <Plate initialValue={findReplaceValue} plugins={plugins}>
        <Editor {...editableProps} />
      </Plate>
    </>
  );
}
