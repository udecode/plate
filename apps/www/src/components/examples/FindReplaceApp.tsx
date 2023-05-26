import React, { useMemo, useState } from 'react';
import { createFindReplacePlugin, Plate } from '@udecode/plate';

import { Icons } from '@/components/icons';
import { editableProps } from '@/plate/demo/editableProps';
import { SearchHighlightToolbar } from '@/plate/demo/find-replace/SearchHighlightToolbar';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { findReplaceValue } from '@/plate/demo/values/findReplaceValue';

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
