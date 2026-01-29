# Using collaboration with Editor.js 

A basic example of using collaboration with Editor.js

## Getting started
For this example, we recommend you run the provided ```fastify``` example in the examples directory.
With two terminals:

Terminal 1 (in this folder): The frontend using Editor.js directly
```
npm install && npm run dev
```

Terminal 2 (in ../fastify folder): The backend
```
npm install && npm run dev
```

Point your browser (2 tabs) to: ```http://localhost:5173```

This will run both a basic Editor.js frontend, and a Fastify server running ```superdoc-yjs-collaboration``` and a single websocket endpoint. The editors should be collaborating and [look something like this](https://cdn.zappy.app/02b7c71ea638080bee27cdd4740060de.mp4)
