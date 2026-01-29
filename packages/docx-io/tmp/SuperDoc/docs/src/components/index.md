---
{ 'home': False, 'prev': False, 'next': False }
---

# Components

Detailed reference documentation for SuperDoc's components and their APIs.

<p style="margin-bottom: 2rem;
    padding: 0.5rem 0.85rem;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    text-decoration: none;
    color: var(--vp-c-text-2);
    transition: color .4s ease-in-out;
    font-size: .8rem;">
SuperDoc provides a set of components that can be used individually or together to create a complete document editing experience. This reference documents the API for each component.
</p>

## SuperDoc Component {#superdoc}

The main component that orchestrates document editing, viewing, collaboration, and UI.

### Initialization

```javascript
import '@harbour-enterprises/superdoc/style.css';
import { SuperDoc } from '@harbour-enterprises/superdoc';

const superdoc = new SuperDoc({
  selector: '#root',
  documents: [
    id: 'pets-123',
    type: 'docx',
    url: 'http://my-document-url.docx',
  ],
  pagination: true,
  licenseKey: 'community-and-eval-agplv3',
  telemetry: {
    enabled: true,
  } //basic usage metrics and exceptions
})
```

### Configuration Options

| Property       | Type              | Description                                                 | Required | Default          |
| :------------- | :---------------- | :---------------------------------------------------------- | :------: | :--------------- |
| `selector`     | `string\|Element` | CSS selector or DOM element where SuperDoc will be rendered |    ✓     | -                |
| `documents`    | `array`           | Array of document objects to load                           |    ✓     | -                |
| `superdocId`   | `string`          | Unique identifier for this SuperDoc instance                |          | Random UUID      |
| `documentMode` | `string`          | Document mode: 'viewing', 'suggesting', or 'editing'        |          | 'editing'        |
| `role`         | `string`          | User role: 'editor', 'suggester', or 'viewer'               |          | 'editor'         |
| `user`         | `object`          | Current user information                                    |          | {}               |
| `toolbar`      | `string\|Element` | DOM element to render toolbar                               |          | Internal toolbar |
| `modules`      | `object`          | Additional modules configuration                            |          | {}               |

#### Document Object Properties

| Property | Type         | Description                             | Required |
| :------- | :----------- | :-------------------------------------- | :------: |
| `id`     | `string`     | Unique identifier for the document      |    ✓     |
| `type`   | `string`     | Document type: 'docx', 'pdf', or 'html' |    ✓     |
| `data`   | `File\|Blob` | Document data as a File or Blob object  |          |
| `url`    | `string`     | URL to fetch the document               |          |
| `state`  | `object`     | Initial document state                  |          |

#### User Object Properties

| Property | Type     | Description                    | Required |
| :------- | :------- | :----------------------------- | :------: |
| `name`   | `string` | User's display name            |    ✓     |
| `email`  | `string` | User's email address           |    ✓     |
| `image`  | `string` | URL for user's avatar          |          |
| `id`     | `string` | Unique identifier for the user |          |

#### Modules Configuration

```javascript
modules: {
  // Collaboration module configuration
  collaboration: {
    url: 'wss://collaboration-server.example.com',
    token: 'auth-token',
    params: { /* Additional connection parameters */ }
  },
}
```

### Methods

| Method                  | Parameters                                  | Return          | Description                                        |
| :---------------------- | :------------------------------------------ | :-------------- | :------------------------------------------------- |
| `export()`              | -                                           | `Promise<Void>` | Exports the SuperDocs and triggers download        |
| `setDocumentMode(mode)` | mode: 'viewing', 'suggesting', or 'editing' | -               | Switches between view, suggest, and edit modes     |
| `on(event, callback)`   | event: string, callback: function           | -               | Registers an event listener                        |
| `off(event, callback)`  | event: string, callback: function           | -               | Removes an event listener                          |
| `getHTML()`             | -                                           | -               | Get a list of HTML strings (one per DOCX document) |

### Hooks

| Hook                 | Parameters          | Description                                              |
| -------------------- | ------------------- | -------------------------------------------------------- |
| onEditorBeforeCreate | -                   | Called **before** the document editor is created.        |
| onEditorCreate       | `{ editor }`        | Called when the document editor is created.              |
| onEditorDestroy      | -                   | Called when the document editor is destroyed.            |
| onContentError       | `{ error, editor }` | Called when there's an error with document content.      |
| onReady              | -                   | Called when the document is fully initialized and ready. |
| onAwarenessUpdate    | `{ users }`         | Called when user presence information changes.           |
| onPdfDocumentReady   | -                   | Called when the PDF version of the document is ready.    |
| onCollaborationReady | `{ editor }`        | Called when collaboration is ready.                      |
| onException          | `{ error, editor }` | Called when an exception occurs.                         |

## SuperEditor Component {#supereditor}

The core editor component that powers DOCX editing in SuperDoc. For advanced use cases, you can use SuperEditor directly.

### Initialization

```javascript
import '@harbour-enterprises/superdoc/super-editor/style.css';
import { SuperEditor } from '@harbour-enterprises/superdoc/super-editor';

const editor = new SuperEditor({
  selector: '#editor-container',
  fileSource: docxFile,
  state: initialState,
  documentId: 'doc-123',
  options: {
    user: {
      name: 'Editor User',
      email: 'editor@example.com',
    },
    // Additional options...
  },
});
```

### Configuration Options

| Property     | Type                 | Description                | Required | Default |
| :----------- | :------------------- | :------------------------- | :------: | :------ |
| `selector`   | `string\|Element`    | Where to render the editor |    ✓     | -       |
| `fileSource` | `File\|Blob\|string` | Document file or URL       |    ✓     | -       |
| `state`      | `object`             | Initial document state     |          | null    |
| `documentId` | `string`             | Unique document ID         |    ✓     | -       |
| `options`    | `object`             | Editor options             |    ✓     | -       |

#### Editor Options

| Property                | Type       | Description                                | Default        |
| :---------------------- | :--------- | :----------------------------------------- | :------------- |
| `user`                  | `object`   | Current user information                   | {}             |
| `colors`                | `object`   | Theme color configuration                  | Default colors |
| `role`                  | `string`   | User role: 'editor', 'suggester', 'viewer' | 'editor'       |
| `documentMode`          | `string`   | 'editing', 'viewing', or 'suggesting'      | 'viewing'      |
| `pagination`            | `boolean`  | Enable pagination                          | true           |
| `rulers`                | `array`    | Document ruler configuration               | []             |
| `ydoc`                  | `Y.Doc`    | Yjs document for collaboration             | null           |
| `collaborationProvider` | `object`   | Collaboration provider instance            | null           |
| `isNewFile`             | `boolean`  | Whether this is a new document             | false          |
| `handleImageUpload`     | `function` | Custom image upload handler                | null           |
| `telemetry`             | `object`   | Telemetry configuration                    | null           |

### Methods

| Method                    | Parameters               | Return          | Description                                                                                                                                                                                            |
| :------------------------ | :----------------------- | :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `destroy()`               | -                        | -               | Destroys the editor instance                                                                                                                                                                           |
| `getHTML()`               | -                        | `string`        | Gets document content as HTML                                                                                                                                                                          |
| `getJSON()`               | -                        | `object`        | Gets document content as JSON                                                                                                                                                                          |
| `getPageStyles()`         | -                        | `object`        | Gets page style information                                                                                                                                                                            |
| `focus()`                 | -                        | -               | Focuses the editor                                                                                                                                                                                     |
| `blur()`                  | -                        | -               | Removes focus from the editor                                                                                                                                                                          |
| `exportDocx()`            | -                        | `Promise<Blob>` | Exports as DOCX                                                                                                                                                                                        |
| `getInternalXmlFile()`    | `{name, type}`           | `string/object` | Returns internal docx file content.<br/>_name_ param is a full path;<br/>_type_: 'string', 'json'.                                                                                                     |
| `updateInternalXmlFile()` | `{name, updatedContent}` | -               | Updates content of internal xml file.<br/> _name_ param is a full path;<br/>_updatedContent_ could be string or json.<br/>**Pay attention that we do not execute any validations of updated content.** |

### Hooks

SuperEditor has a variety of hooks

| Hook                     | Parameters  | Description                                        |
| ------------------------ | ----------- | -------------------------------------------------- |
| onBeforeCreate           | -           | Called **before** the creation process starts.     |
| onCreate                 | -           | Called when the document is created.               |
| onUpdate                 | -           | Called when the document is updated.               |
| onSelectionUpdate        | -           | Called when the document selection is updated.     |
| onTransaction            | -           | Called during document transactions.               |
| onFocus                  | -           | Called when the document gains focus.              |
| onBlur                   | -           | Called when the document loses focus.              |
| onDestroy                | -           | Called when the document is destroyed.             |
| onContentError           | `{ error }` | Called when there's a content error.               |
| onTrackedChangesUpdate   | -           | Called when tracked changes are updated.           |
| onCommentsUpdate         | -           | Called when comments are updated.                  |
| onCommentsLoaded         | -           | Called when comments have finished loading.        |
| onCommentClicked         | -           | Called when a comment is clicked.                  |
| onCommentLocationsUpdate | -           | Called when the locations of comments are updated. |
| onDocumentLocked         | -           | Called when the document lock state changes.       |
| onFirstRender            | -           | Called on the first render of the document.        |
| onCollaborationReady     | -           | Called when collaboration features are ready.      |
| onPaginationUpdate       | -           | Called when pagination is updated.                 |
| onException              | -           | Called when an exception occurs.                   |

### Example: Basic Editor Commands

You can get a list of currently available commands from `editor.commands`

## Next Steps

- See [Integration](/integration/) for framework-specific integration guides
- Check out [Resources](/resources/) for examples, FAQ, and community resources
- Learn more about [Getting Started](/) for basic concepts and setup
