import React from 'react';
import { Image, Link, Search } from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  createHistoryPlugin,
  createReactPlugin,
  Plate,
  PlatePlugin,
  SPEditor,
} from '@udecode/plate-core';
import { ReactEditor } from 'slate-react';
import { initialValuePlayground } from '../../../../docs/src/live/config/initialValues';
import {
  editableProps,
  optionsAutoformat,
  optionsExitBreakPlugin,
  optionsResetBlockTypePlugin,
  optionsSoftBreakPlugin,
} from '../../../../docs/src/live/config/pluginOptions';
import {
  BallonToolbarMarks,
  ToolbarButtonsAlign,
  ToolbarButtonsBasicElements,
  ToolbarButtonsBasicMarks,
  ToolbarButtonsList,
  ToolbarButtonsTable,
} from '../../../../docs/src/live/config/Toolbars';
import { createAutoformatPlugin } from '../../../autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../break/src/soft-break/createSoftBreakPlugin';
import { createAlignPlugin } from '../../../elements/alignment/src/createAlignPlugin';
import { createBasicElementPlugins } from '../../../elements/basic-elements/src/createBasicElementPlugins';
import { createBlockquotePlugin } from '../../../elements/block-quote/src/createBlockquotePlugin';
import { createHeadingPlugin } from '../../../elements/heading/src/createHeadingPlugin';
import { ELEMENT_H1 } from '../../../elements/heading/src/defaults';
import { createImagePlugin } from '../../../elements/image/src/createImagePlugin';
import { ELEMENT_IMAGE } from '../../../elements/image/src/defaults';
import { ToolbarImage } from '../../../elements/image-ui/src/ToolbarImage/ToolbarImage';
import { createLinkPlugin } from '../../../elements/link/src/createLinkPlugin';
import { ToolbarLink } from '../../../elements/link-ui/src/ToolbarLink/ToolbarLink';
import { createListPlugin } from '../../../elements/list/src/createListPlugin';
import { createTodoListPlugin } from '../../../elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../elements/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../../../elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../../../elements/mention-ui/src/MentionCombobox';
import { ELEMENT_PARAGRAPH } from '../../../elements/paragraph/src/defaults';
import { createTablePlugin } from '../../../elements/table/src/createTablePlugin';
import { useFindReplacePlugin } from '../../../find-replace/src/useFindReplacePlugin';
import { ToolbarSearchHighlight } from '../../../find-replace-ui/src/ToolbarSearchHighlight/ToolbarSearchHighlight';
import { createBasicMarkPlugins } from '../../../marks/basic-marks/src/createBasicMarkPlugins';
import { createHighlightPlugin } from '../../../marks/highlight/src/createHighlightPlugin';
import { createNodeIdPlugin } from '../../../node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../select/src/createSelectOnBackspacePlugin';
import { createDeserializeHTMLPlugin } from '../../../serializers/html-serializer/src/deserializer/createDeserializeHTMLPlugin';
import { createTrailingBlockPlugin } from '../../../trailing-block/src/createTrailingBlockPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { createPlateComponents } from '../utils/createPlateComponents';
import { createPlateOptions } from '../utils/createPlateOptions';

const components = createPlateComponents();
const options = createPlateOptions();

const PlateContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();

  const plugins: PlatePlugin<SPEditor & ReactEditor>[] = [
    createReactPlugin(),
    createHistoryPlugin(),
    createBlockquotePlugin(),
    createTodoListPlugin(),
    createHeadingPlugin({ levels: 5 }),
    ...createBasicElementPlugins(),
    ...createBasicMarkPlugins(),
    createTodoListPlugin(),
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createTablePlugin(),
    createMediaEmbedPlugin(),
    createAlignPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    findReplacePlugin,
    createNodeIdPlugin(),
    createAutoformatPlugin(optionsAutoformat),
    createResetNodePlugin(optionsResetBlockTypePlugin),
    createSoftBreakPlugin(optionsSoftBreakPlugin),
    createExitBreakPlugin(optionsExitBreakPlugin),
    createNormalizeTypesPlugin({
      rules: [{ path: [0], strictType: ELEMENT_H1 }],
    }),
    createTrailingBlockPlugin({ type: ELEMENT_PARAGRAPH }),
    createSelectOnBackspacePlugin({ allow: ELEMENT_IMAGE }),
  ];
  plugins.push(createDeserializeHTMLPlugin({ plugins }));

  return (
    <Plate
      plugins={plugins}
      components={components}
      options={options}
      editableProps={editableProps}
      initialValue={initialValuePlayground}
    >
      <ToolbarSearchHighlight icon={Search} setSearch={setSearch} />
      <HeadingToolbar>
        <ToolbarButtonsBasicElements />
        <ToolbarButtonsList />
        <ToolbarButtonsBasicMarks />
        <ToolbarButtonsAlign />
        <ToolbarLink icon={<Link />} />
        <ToolbarImage icon={<Image />} />
        <ToolbarButtonsTable />
      </HeadingToolbar>

      <BallonToolbarMarks />

      <MentionCombobox />
    </Plate>
  );
};

it('should render', () => {
  render(<PlateContainer />);

  expect(1).toBe(1);
});
