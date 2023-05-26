import React from 'react';
import { Plate } from '@udecode/plate';

import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { createPreviewPlugin } from '@/plate/demo/plugins/preview-markdown/createPreviewPlugin';
import { PreviewLeaf } from '@/plate/demo/plugins/preview-markdown/PreviewLeaf';
import { previewMdValue } from '@/plate/demo/values/previewMdValue';

const plugins = createMyPlugins([...basicNodesPlugins, createPreviewPlugin()], {
  components: plateUI,
});

const _editableProps = {
  ...editableProps,
  renderLeaf: PreviewLeaf,
};

export default function PreviewMdApp() {
  return (
    <Plate<MyValue>
      editableProps={_editableProps}
      plugins={plugins}
      initialValue={previewMdValue}
    />
  );
}
