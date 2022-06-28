import React, { useMemo, useState } from 'react';
import { Search } from '@styled-icons/material/Search';
import { createPlateUI, Plate } from '@udecode/plate';
import { createFindReplacePlugin } from '@udecode/plate-find-replace/src/index';
import { SearchHighlightToolbar } from '@udecode/plate-ui-find-replace/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { findReplaceValue } from './find-replace/findReplaceValue';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

export default () => {
  const [search, setSearch] = useState('');

  const plugins = useMemo(
    () =>
      createMyPlugins(
        [
          ...basicNodesPlugins,
          createFindReplacePlugin({ options: { search } }),
        ],
        {
          components: createPlateUI(),
        }
      ),
    [search]
  );

  return (
    <>
      <SearchHighlightToolbar icon={Search} setSearch={setSearch} />

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={findReplaceValue}
      />
    </>
  );
};
