# Basic example of using SuperDoc in Node

## Node version
Please use `Node >= 20`. In earlier versions, Node is missing the `File` object.
If you must use `Node < 20`, please create or inject the file polyfill (see example).

## Quick start
```
npm install && npm run dev
```

This will run a basic express server at `http://localhost:3000` with a single root endpoint.

Point your browser or Postman GET request to:  `http://localhost:3000`. The server will simply return an unchanged .docx template.
Now, you can add query params `text` or `html` to insert content into this document.

## Basic example
```

Text only: http://localhost:3000?text=hello world!

HTML only: http://localhost:3000?html=<p>I am a paragraph</p><p></p><p><strong>I AM BOLD!</strong></p>
```

## Additional docs
Please see [SuperDoc docs](https://docs.superdoc.dev/guide/components#superdoc) for additinoal editor commands and hooks.

You can get a list of all available editor commands from editor.commands as well. For instnace, commands such as the examples below all will work while using the SuperDoc editor in the backend:
```
editor.commands.toggleBold()

editor.commands.toggleOrderedList()

editor.commands.setColor()

editor.commands.setFontSize()

...etc

```

