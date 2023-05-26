import React, { useMemo, useState } from 'react';
import { createFindReplacePlugin, Plate } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { findReplaceValue } from '@/plate/find-replace/findReplaceValue';
import { SearchHighlightToolbar } from '@/plate/find-replace/SearchHighlightToolbar';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

export default function FindReplaceApp() {
  const [search, setSearch] = useState('');

  const plugins = useMemo(
    () =>
      createMyPlugins(
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

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={findReplaceValue}
      />
    </>
  );
}
