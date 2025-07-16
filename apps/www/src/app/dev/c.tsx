'use client';

import React from "react";

import { MarkdownPlugin } from "@platejs/markdown";
import { ElementApi, normalizeNodeId, TextApi } from "platejs";
import { usePlateViewEditor } from "platejs/react";

import { BaseEditorKit } from "@/registry/components/editor/editor-base-kit";
import { MarkdownKit } from "@/registry/components/editor/plugins/markdown-kit";
import { basicBlocksValue } from "@/registry/examples/values/basic-blocks-value";
import { basicMarksValue } from "@/registry/examples/values/basic-marks-value";
import { EditorView } from "@/registry/ui/editor";



const withCustomType = (value: any) => {
  const addCustomType = (item: any): any => {
    if (ElementApi.isElement(item)) {
      return {
        children: item.children.map(addCustomType),
        type: 'custom-' + item.type
      }
    }
    if (TextApi.isText(item)) {
      const { text, ...rest } = item
      const props: any = {}
      for (const key in rest) {
        const value = rest[key]
        const newKey = 'custom-' + key
        props[newKey] = value
      }

      return {
        ...props,
        text: text.replace(/^custom-/, '')
      }
    }
  };

  return value.map(addCustomType)
}

const withCustomPlugins = (plugins: any[]): any[] => {
  const newPlugins: any[] = []

  plugins.forEach(plugin => {
    newPlugins.push(plugin.extend({
      node: {
        type: 'custom-' + plugin.key
      }
    }))
  })

  return newPlugins
}


let index = 0

const value = normalizeNodeId([
  ...withCustomType(basicBlocksValue),
  ...withCustomType(basicMarksValue)
], {
  idCreator() {
    return 'id-' + index++;
  },
});






export const EditorViewClient = () => {
  const editor = usePlateViewEditor({
    plugins: [
      ...withCustomPlugins(BaseEditorKit),
      ...MarkdownKit
    ],
    value: value,
  });

  const markdown = editor.getApi(MarkdownPlugin).markdown.serialize()

  console.log("🚀 ~ EditorViewClient ~ markdown:", markdown)

  return <EditorView variant="none" className="px-10" editor={editor} />;
};
