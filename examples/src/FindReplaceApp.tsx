import React, { useMemo, useState } from 'react';
import { createFindReplacePlugin, Plate } from '@udecode/plate';
import { SearchHighlightToolbar } from 'examples-next/src/components/ui/find-replace/SearchHighlightToolbar';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { Icons } from './common/icons';
import { plateUI } from './common/plateUI';
import { findReplaceValue } from './find-replace/findReplaceValue';

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
