# SuperDoc
## SuperDoc: Creating a custom node

An example of creating a custom node to use with SuperDoc.
Note: Requires `SuperDoc 0.10.15` or later

[We create a custom node here](https://github.com/Harbour-Enterprises/SuperDoc/blob/develop/examples/vue-custom-node-example/src/custom-node.js#L62)
Note that we added a custom command to the node, called insertCustomNode. We can now insert this node by simply calling this command from editor.commands.insertCustomNode

[Then we can pass it into the editor via the `editorExtensions` key](https://github.com/Harbour-Enterprises/SuperDoc/blob/e724d31eaba50a423ed0d73a4264a09b33d06eaa/examples/vue-custom-mark/src/App.vue#L20)

