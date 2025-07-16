'use client';

import React from "react";

import { MarkdownPlugin } from "@platejs/markdown";
import { ElementApi, normalizeNodeId, TextApi } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useFilePicker } from "use-file-picker";

import { Button } from "@/components/ui/button";
import { BaseEditorKit } from "@/registry/components/editor/editor-base-kit";
import { ListKit } from "@/registry/components/editor/plugins/list-classic-kit";
import { MarkdownKit } from "@/registry/components/editor/plugins/markdown-kit";
import { listValue } from "@/registry/examples/values/list-classic-value";
import { Editor, EditorContainer } from "@/registry/ui/editor";



const withCustomType = (value: any) => {
  const addCustomType = (item: any): any => {
    if (ElementApi.isElement(item)) {
      const { children, type, ...rest } = item
      return {
        children: children.map(addCustomType),
        type: 'custom-' + type,
        ...rest
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
  // ...withCustomType(basicBlocksValue),
  // ...withCustomType(basicMarksValue),
  // ...withCustomType(tableValue),
  // ...withCustomType(codeBlockValue),
  ...withCustomType(listValue),
  // ...listValue,
], {
  idCreator() {
    return 'id-' + index++;
  },
});



export const EditorViewClient = () => {

  const editor = usePlateEditor({
    plugins: [
      ...withCustomPlugins([...BaseEditorKit, ...ListKit,]),
      ...MarkdownKit
    ],
    value: value,
  });

  const getFileNodes = (text: string,) => {

    return editor.getApi(MarkdownPlugin).markdown.deserialize(text);
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text);
      console.log("🚀 ~ onFilesSelected: ~ nodes:", nodes)
    },
  });


  return <>

    <Plate editor={editor}>
      <EditorContainer>
        <Editor
          variant="demo"
          className="pb-[20vh]"
          placeholder="Type something..."
          spellCheck={false}
        />
      </EditorContainer>
    </Plate>


    <div className="mt-10 px-10">
      <Button className="mr-10" onClick={
        () => {
          console.log(editor.getApi(MarkdownPlugin).markdown.serialize());
        }
      }>Serialize</Button>


      <Button onClick={openMdFilePicker}>Deserialize</Button>
    </div>
  </>
};
