import {
  createDeserializeCsvPlugin,
  createHighlightPlugin,
  createImagePlugin,
  createLinkPlugin,
  createListPlugin,
  createMediaEmbedPlugin,
  createMentionPlugin,
  createSoftBreakPlugin,
  createTablePlugin,
  createTodoListPlugin,
  Plate
} from "@udecode/plate";
import { createExcalidrawPlugin } from "@udecode/plate-excalidraw";
import React from "react";
import { createMyPlugins, MyValue } from "../apps/next/src/lib/plate/typescript/plateTypes";
import { basicNodesPlugins } from "./basic-nodes/basicNodesPlugins";
import { editableProps } from "./common/editableProps";
import { plateUI } from "./common/plateUI";
import { linkPlugin } from "./link/linkPlugin";
import { deserializeCsvValue } from "./serializing-csv/deserializeCsvValue";
import { softBreakPlugin } from "./soft-break/softBreakPlugin";

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createImagePlugin(),
    createLinkPlugin(linkPlugin),
    createListPlugin(),
    createTablePlugin(),
    createTodoListPlugin(),
    createMediaEmbedPlugin(),
    createExcalidrawPlugin(),
    createHighlightPlugin(),
    createMentionPlugin(),
    createSoftBreakPlugin(softBreakPlugin),
    createDeserializeCsvPlugin({
      options: {
        parseOptions: {
          header: false,
        },
      },
    }),
  ],
  {
    components: plateUI,
  }
);

export default function SerializingCsvApp() {
  return (
    <Plate<MyValue>
      editableProps={editableProps}
      plugins={plugins}
      initialValue={deserializeCsvValue}
    />
  );
}
