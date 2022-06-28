import React from 'react';
import { Keyboard } from '@styled-icons/material/Keyboard';
import {
  createKbdPlugin,
  createPlateUI,
  getPluginType,
  HeadingToolbar,
  Plate,
  withPlateEventProvider,
} from '@udecode/plate';
import { MARK_KBD } from '@udecode/plate-kbd/src/index';
import { MarkToolbarButton } from '@udecode/plate-ui-toolbar/src/index';
import { basicNodesPlugins } from './basic-elements/basicNodesPlugins';
import { editableProps } from './common/editableProps';
import { kbdValue } from './kbd/kbdValue';
import {
  createMyPlugins,
  MyValue,
  useMyPlateEditorRef,
} from './typescript/plateTypes';

const KbdToolbarButton = withPlateEventProvider(() => {
  const editor = useMyPlateEditorRef()!;

  return (
    <MarkToolbarButton
      type={getPluginType(editor, MARK_KBD)}
      icon={<Keyboard />}
    />
  );
});

const plugins = createMyPlugins([...basicNodesPlugins, createKbdPlugin()], {
  components: createPlateUI(),
});

export default () => (
  <>
    <HeadingToolbar>
      <KbdToolbarButton />
    </HeadingToolbar>

    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={kbdValue}
    />
  </>
);
