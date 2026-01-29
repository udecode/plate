# Super Editor (docx editor)

This package exports the SuperEditor Vue 3 component, as well as various utils needed.

## Development

For development purposes:

```
npm install && npm run dev
```

## Prose Mirror

- [ProseMirror Guide](https://prosemirror.net/docs/guide/#schema)
- [Schema example](https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.ts)
- [ProseMirror Reference](https://prosemirror.net/docs/ref/)
- [ProseMirror Cookbook - Examples](https://github.com/PierBover/prosemirror-cookbook)
- [prosemirror-commands](https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts#L745)
- [prosemirror-schema-basic](https://github.com/ProseMirror/prosemirror-schema-basic/blob/master/src/schema-basic.ts)

## Key files

### src/core/SuperConverter.js

This handles converting from XML document to prose mirror schema, and back.

Note: This is very much an experimental / POC version of this file. I want to make several improvements and abstractions here but use it as an example of how tags need to be processed in and out of the docx.

- When converting from XML to Schema, We need to make sure all xml tags are correctly handled here.
- When converting from Schema back to XML, we have to handle various special cases. Need to figure out how to abstract as much of this as possible.

### src/core/DocxZipper.js

This util handles extracting a .docx file and returning a list of its xml files.
It can also handle creating a new .docx file from updated xml files

- Need to add 'marks' for style tags. ie: `<w:b>` becomes a `strong` mark.
