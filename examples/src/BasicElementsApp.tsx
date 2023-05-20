import {
  createBasicElementsPlugin,
  createExitBreakPlugin,
  createResetNodePlugin,
  createSoftBreakPlugin,
  Plate,
  PlateProvider
} from "@udecode/plate";
import React from "react";
import { createMyPlugins, MyValue } from "../apps/next/src/lib/plate/typescript/plateTypes";
import { basicElementsValue } from "./basic-elements/basicElementsValue";
import { BasicElementToolbarButtons } from "./basic-elements/BasicElementToolbarButtons";
import { editableProps } from "./common/editableProps";
import { plateUI } from "./common/plateUI";
import { exitBreakPlugin } from "./exit-break/exitBreakPlugin";
import { resetBlockTypePlugin } from "./reset-node/resetBlockTypePlugin";
import { softBreakPlugin } from "./soft-break/softBreakPlugin";
import { Toolbar } from "./toolbar/Toolbar";

const plugins = createMyPlugins(
  [
    createBasicElementsPlugin(),
    createResetNodePlugin(resetBlockTypePlugin),
    createSoftBreakPlugin(softBreakPlugin),
    createExitBreakPlugin(exitBreakPlugin),
  ],
  {
    components: plateUI,
  }
);

export default function BasicElementsApp() {
  return (
    <PlateProvider<MyValue> initialValue={basicElementsValue} plugins={plugins}>
      <Toolbar>
        <BasicElementToolbarButtons />
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
}
