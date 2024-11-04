'use client';

import React, { useState } from 'react';

import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { Plate, usePlateEditor } from '@udecode/plate-common/react';
import { FindReplacePlugin } from '@udecode/plate-find-replace';

import { Icons } from '@/components/icons';
import { editableProps } from '@/plate/demo/editableProps';
import { PlateUI } from '@/plate/demo/plate-ui';
import { findReplaceValue } from '@/plate/demo/values/findReplaceValue';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
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
          style={{
            background: '#fafafa',
            border: '2px solid #ddd',
            boxSizing: 'border-box',
            fontSize: '0.85em',
            padding: '0.5em',
            paddingLeft: '2em',
            width: '100%',
          }}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the text..."
          type="search"
        />
      </div>
    </FixedToolbar>
  );
}

export default function FindReplaceDemo() {
  const [search, setSearch] = useState('');

  const editor = usePlateEditor(
    {
      override: {
        components: PlateUI,
      },
      plugins: [
        BasicElementsPlugin,
        BasicMarksPlugin,
        FindReplacePlugin.configure({ options: { search } }),
      ],
      value: findReplaceValue,
    },
    [search]
  );

  return (
    <>
      <SearchHighlightToolbar icon={Icons.search} setSearch={setSearch} />

      <Plate editor={editor}>
        <EditorContainer>
          <Editor {...editableProps} />
        </EditorContainer>
      </Plate>
    </>
  );
}
