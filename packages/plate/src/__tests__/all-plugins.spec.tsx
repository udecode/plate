import React from 'react';
import {
  Image,
  LineWeight,
  Link,
  OndemandVideo,
  Search,
} from '@styled-icons/material';
import { render } from '@testing-library/react';
import {
  createHistoryPlugin,
  createReactPlugin,
  Plate,
  PlatePlugin,
} from '@udecode/plate-core';
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  IndentToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar,
  TableToolbarButtons,
} from '../../../../docs/src/live/config/components/Toolbars';
import { CONFIG } from '../../../../docs/src/live/config/config';
import { VALUES } from '../../../../docs/src/live/config/values/values';
import { useFindReplacePlugin } from '../../../decorators/find-replace/src/useFindReplacePlugin';
import { SearchHighlightToolbar } from '../../../decorators/find-replace-ui/src/SearchHighlightToolbar/SearchHighlightToolbar';
import { createAutoformatPlugin } from '../../../editor/autoformat/src/createAutoformatPlugin';
import { createExitBreakPlugin } from '../../../editor/break/src/exit-break/createExitBreakPlugin';
import { createSoftBreakPlugin } from '../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createNodeIdPlugin } from '../../../editor/node-id/src/createNodeIdPlugin';
import { createNormalizeTypesPlugin } from '../../../editor/normalizers/src/createNormalizeTypesPlugin';
import { createResetNodePlugin } from '../../../editor/reset-node/src/createResetNodePlugin';
import { createSelectOnBackspacePlugin } from '../../../editor/select/src/createSelectOnBackspacePlugin';
import { createTrailingBlockPlugin } from '../../../editor/trailing-block/src/createTrailingBlockPlugin';
import { createAlignPlugin } from '../../../elements/alignment/src/createAlignPlugin';
import { createBasicElementPlugins } from '../../../elements/basic-elements/src/createBasicElementPlugins';
import { createBlockquotePlugin } from '../../../elements/block-quote/src/createBlockquotePlugin';
import { createHeadingPlugins } from '../../../elements/heading/src/createHeadingPlugins';
import { createImagePlugin } from '../../../elements/image/src/createImagePlugin';
import { ImageToolbarButton } from '../../../elements/image-ui/src/ImageToolbarButton/ImageToolbarButton';
import { LineHeightToolbarDropdown } from '../../../elements/line-height-ui/src/LineHeightToolbarButton/LineHeightToolbarDropdown';
import { createLinkPlugin } from '../../../elements/link/src/createLinkPlugin';
import { LinkToolbarButton } from '../../../elements/link-ui/src/LinkToolbarButton/LinkToolbarButton';
import { createListPlugin } from '../../../elements/list/src/createListPlugins';
import { createTodoListPlugin } from '../../../elements/list/src/todo-list/createTodoListPlugin';
import { createMediaEmbedPlugin } from '../../../elements/media-embed/src/createMediaEmbedPlugin';
import { MediaEmbedToolbarButton } from '../../../elements/media-embed-ui/src/MediaEmbedToolbarButton/MediaEmbedToolbarButton';
import { createMentionPlugin } from '../../../elements/mention/src/createMentionPlugin';
import { MentionCombobox } from '../../../elements/mention-ui/src/MentionCombobox';
import { createTablePlugin } from '../../../elements/table/src/createTablePlugins';
import { createBasicMarkPlugins } from '../../../marks/basic-marks/src/createBasicMarkPlugins';
import { createHighlightPlugin } from '../../../marks/highlight/src/createHighlightPlugin';
import { createDeserializeHTMLPlugin } from '../../../serializers/html/src/deserializer/createDeserializeHTMLPlugin';
import { HeadingToolbar } from '../../../ui/toolbar/src/HeadingToolbar/HeadingToolbar';
import { createPlateComponents } from '../utils/createPlateComponents';
import { createPlateOptions } from '../utils/createPlateOptions';

const components = createPlateComponents();
const options = createPlateOptions();

const PlateContainer = () => {
  const { setSearch, plugin: findReplacePlugin } = useFindReplacePlugin();

  const plugins: PlatePlugin[] = [
    createReactPlugin(),
    createHistoryPlugin(),
    createBlockquotePlugin(),
    createTodoListPlugin(),
    createHeadingPlugins({ levels: 5 }),
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
    createAutoformatPlugin(CONFIG.autoformat),
    createResetNodePlugin(CONFIG.resetBlockType),
    createSoftBreakPlugin(CONFIG.softBreak),
    createExitBreakPlugin(CONFIG.exitBreak),
    createNormalizeTypesPlugin(CONFIG.forceLayout),
    createTrailingBlockPlugin(CONFIG.trailingBlock),
    createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
  ];
  plugins.push(createDeserializeHTMLPlugin({ plugins }));

  return (
    <Plate
      plugins={plugins}
      components={components}
      options={options}
      editableProps={CONFIG.editableProps}
      initialValue={VALUES.playground}
    >
      <SearchHighlightToolbar icon={Search} setSearch={setSearch} />
      <HeadingToolbar>
        <BasicElementToolbarButtons />
        <ListToolbarButtons />
        <IndentToolbarButtons />
        <BasicMarkToolbarButtons />
        <AlignToolbarButtons />
        <LineHeightToolbarDropdown icon={<LineWeight />} />
        <LinkToolbarButton icon={<Link />} />
        <ImageToolbarButton icon={<Image />} />
        <MediaEmbedToolbarButton icon={<OndemandVideo />} />
        <TableToolbarButtons />
      </HeadingToolbar>

      <MarkBallonToolbar />

      <MentionCombobox />
    </Plate>
  );
};

it('should render', () => {
  render(<PlateContainer />);

  expect(1).toBe(1);
});
