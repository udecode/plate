import React from 'react';
import { Plate } from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { createPreviewPlugin } from './preview-markdown/createPreviewPlugin';
import { PreviewLeaf } from './preview-markdown/PreviewLeaf';
import { previewMdValue } from './preview-markdown/previewMdValue';

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
