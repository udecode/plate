# SuperDoc
## SuperDoc: Creating a custom mark

An example of creating a custom Mark to use with SuperDoc.
Note: Requires `SuperDoc 0.10.15` or later

[We create a custom mark here](https://github.com/Harbour-Enterprises/SuperDoc/blob/main/examples/vue-custom-mark/src/custom-mark.js)
Note that we added a custom command to the mark, called setMyCustomMark. We can now insert this mark by calling this command from `superdoc.activeEditor.commands`

[Then we can pass it into the editor via the `editorExtensions` key](https://github.com/Harbour-Enterprises/SuperDoc/blob/e724d31eaba50a423ed0d73a4264a09b33d06eaa/examples/vue-custom-mark/src/App.vue#L20)

## Exporting the docx
This example also shows one way to export the docx to a blob whenever the content changes in the editor
