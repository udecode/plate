import { Meta } from "@storybook/react/types-6-0";
import { Image } from "@styled-icons/material/Image";
import { Link } from "@styled-icons/material/Link";
import { Search } from "@styled-icons/material/Search";
import { createBlockquotePlugin } from "@udecode/plate-block-quote";
import { createCodeBlockPlugin } from "@udecode/plate-code-block";
import { createFindReplacePlugin } from "@udecode/plate-find-replace";
import { createHeadingPlugin } from "@udecode/plate-heading";
import { createImagePlugin } from "@udecode/plate-image";
import { createLinkPlugin } from "@udecode/plate-link";
import { createParagraphPlugin } from "@udecode/plate-paragraph";
import { HeadingToolbar } from "@udecode/plate-ui-toolbar";
import React, { useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  AlignToolbarButtons,
  BasicElementToolbarButtons,
  BasicMarkToolbarButtons,
  ListToolbarButtons,
  MarkBallonToolbar,
  TableToolbarButtons
} from "../docs/src/live/config/components/Toolbars";
import { withStyledDraggables } from "../docs/src/live/config/components/withStyledDraggables";
import { withStyledPlaceHolders } from "../docs/src/live/config/components/withStyledPlaceHolders";
import { CONFIG } from "../docs/src/live/config/config";
import { VALUES } from "../docs/src/live/config/values/values";
import { Plate } from "../packages/core/src/components/plate/Plate";
import { createPlugins } from "../packages/core/src/utils/plate/createPlugins";
import { createAutoformatPlugin } from "../packages/editor/autoformat/src/createAutoformatPlugin";
import { createExitBreakPlugin } from "../packages/editor/break/src/exit-break/createExitBreakPlugin";
import { createSoftBreakPlugin } from "../packages/editor/break/src/soft-break/createSoftBreakPlugin";
import { createNodeIdPlugin } from "../packages/editor/node-id/src/createNodeIdPlugin";
import { createNormalizeTypesPlugin } from "../packages/editor/normalizers/src/createNormalizeTypesPlugin";
import { createResetNodePlugin } from "../packages/editor/reset-node/src/createResetNodePlugin";
import { createSelectOnBackspacePlugin } from "../packages/editor/select/src/createSelectOnBackspacePlugin";
import { createTrailingBlockPlugin } from "../packages/editor/trailing-block/src/createTrailingBlockPlugin";
import { createAlignPlugin } from "../packages/nodes/alignment/src/createAlignPlugin";
import { createBoldPlugin } from "../packages/nodes/basic-marks/src/createBoldPlugin";
import { createCodePlugin } from "../packages/nodes/basic-marks/src/createCodePlugin";
import { createItalicPlugin } from "../packages/nodes/basic-marks/src/createItalicPlugin";
import { createStrikethroughPlugin } from "../packages/nodes/basic-marks/src/createStrikethroughPlugin";
import { createSubscriptPlugin } from "../packages/nodes/basic-marks/src/createSubscriptPlugin";
import { createSuperscriptPlugin } from "../packages/nodes/basic-marks/src/createSuperscriptPlugin";
import { createUnderlinePlugin } from "../packages/nodes/basic-marks/src/createUnderlinePlugin";
import { createHighlightPlugin } from "../packages/nodes/highlight/src/createHighlightPlugin";
import { createKbdPlugin } from "../packages/nodes/kbd/src/createKbdPlugin";
import { createListPlugin } from "../packages/nodes/list/src/createListPlugin";
import { createTodoListPlugin } from "../packages/nodes/list/src/todo-list/createTodoListPlugin";
import { createMediaEmbedPlugin } from "../packages/nodes/media-embed/src/createMediaEmbedPlugin";
import { createMentionPlugin } from "../packages/nodes/mention/src/createMentionPlugin";
import { createTablePlugin } from "../packages/nodes/table/src/createTablePlugin";
import { createDndPlugin } from "../packages/ui/dnd/src/createDndPlugin";
import { SearchHighlightToolbar } from "../packages/ui/find-replace/src/SearchHighlightToolbar/SearchHighlightToolbar";
import { ImageToolbarButton } from "../packages/ui/nodes/image/src/ImageToolbarButton/ImageToolbarButton";
import { LinkToolbarButton } from "../packages/ui/nodes/link/src/LinkToolbarButton/LinkToolbarButton";
import { MentionCombobox } from "../packages/ui/nodes/mention/src/MentionCombobox/MentionCombobox";
import { createPlateUI } from "../packages/ui/plate/src/utils/createPlateUI";
import "./dnd.css";

export default {
  title: 'Drag & Drop',
} as Meta;

export const Example = () => {
  let components = createPlateUI();
  components = withStyledPlaceHolders(components);
  components = withStyledDraggables(components);

  const Editor = () => {
    const [search, setSearch] = useState();

    const pluginsMemo = useMemo(
      () =>
        createPlugins(
          [
            createParagraphPlugin(),
            createBlockquotePlugin(),
            createTodoListPlugin(),
            createHeadingPlugin(),
            createImagePlugin(),
            createLinkPlugin(),
            createListPlugin(),
            createTablePlugin(),
            createMediaEmbedPlugin(),
            createCodeBlockPlugin(),
            createAlignPlugin(),
            createBoldPlugin(),
            createCodePlugin(),
            createItalicPlugin(),
            createHighlightPlugin(),
            createUnderlinePlugin(),
            createStrikethroughPlugin(),
            createSubscriptPlugin(),
            createSuperscriptPlugin(),
            createKbdPlugin(),
            createNodeIdPlugin(),
            createAutoformatPlugin(CONFIG.autoformat),
            createResetNodePlugin(CONFIG.resetBlockType),
            createSoftBreakPlugin(CONFIG.softBreak),
            createExitBreakPlugin(CONFIG.exitBreak),
            createNormalizeTypesPlugin(CONFIG.forceLayout),
            createTrailingBlockPlugin(CONFIG.trailingBlock),
            createSelectOnBackspacePlugin(CONFIG.selectOnBackspace),
            createMentionPlugin(),
            createFindReplacePlugin({ options: { search } }),
            createDndPlugin(),
          ],
          {
            components,
          }
        ),
      [search]
    );

    return (
      <Plate
        id="playground"
        plugins={pluginsMemo}
        editableProps={CONFIG.editableProps}
        initialValue={VALUES.playground}
      >
        <SearchHighlightToolbar icon={Search} setSearch={setSearch} />
        <HeadingToolbar>
          <BasicElementToolbarButtons />
          <ListToolbarButtons />
          <BasicMarkToolbarButtons />
          <AlignToolbarButtons />
          <LinkToolbarButton icon={<Link />} />
          <ImageToolbarButton icon={<Image />} />
          <TableToolbarButtons />
        </HeadingToolbar>

        <MarkBallonToolbar />

        <MentionCombobox items={CONFIG.mentionItems} />
      </Plate>
    );
  };

  return (
    <div className="main">
      <DndProvider backend={HTML5Backend}>
        <Editor />
      </DndProvider>
    </div>
  );
};
