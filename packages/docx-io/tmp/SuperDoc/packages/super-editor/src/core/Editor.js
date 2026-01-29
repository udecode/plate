import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMSerializer } from 'prosemirror-model';
import { yXmlFragmentToProseMirrorRootNode } from 'y-prosemirror';
import { helpers } from '@core/index.js';
import { EventEmitter } from './EventEmitter.js';
import { ExtensionService } from './ExtensionService.js';
import { CommandService } from './CommandService.js';
import { Attribute } from './Attribute.js';
import { SuperConverter } from '@core/super-converter/SuperConverter.js';
import { Commands, Editable, EditorFocus, Keymap } from './extensions/index.js';
import { createDocument } from './helpers/createDocument.js';
import { isActive } from './helpers/isActive.js';
import { trackedTransaction } from '@extensions/track-changes/trackChangesHelpers/trackedTransaction.js';
import { TrackChangesBasePluginKey } from '@extensions/track-changes/plugins/index.js';
import {
  initPaginationData,
  PaginationPluginKey,
  toggleHeaderFooterEditMode,
} from '@extensions/pagination/pagination-helpers';
import { CommentsPluginKey } from '@extensions/comment/comments-plugin.js';
import { getNecessaryMigrations } from '@core/migrations/index.js';
import { getRichTextExtensions } from '../extensions/index.js';
import { AnnotatorHelpers } from '@helpers/annotator.js';
import { prepareCommentsForExport, prepareCommentsForImport } from '@extensions/comment/comments-helpers.js';
import DocxZipper from '@core/DocxZipper.js';
import { generateCollaborationData } from '@extensions/collaboration/collaboration.js';
import { hasSomeParentWithClass } from './super-converter/helpers.js';
import { useHighContrastMode } from '../composables/use-high-contrast-mode.js';
import { updateYdocDocxData } from '@extensions/collaboration/collaboration-helpers.js';
import { setWordSelection } from './helpers/setWordSelection.js';
import { setImageNodeSelection } from './helpers/setImageNodeSelection.js';
import {
  migrateListsToV2IfNecessary,
  migrateParagraphFieldsListsV2,
} from '@core/migrations/0.14-listsv2/listsv2migration.js';
import { createLinkedChildEditor } from '@core/child-editor/index.js';
import { unflattenListsInHtml } from './inputRules/html/html-helpers.js';
import { SuperValidator } from '@core/super-validator/index.js';
import { createDocFromMarkdown, createDocFromHTML } from '@core/helpers/index.js';

/**
 * @typedef {Object} FieldValue
 * @property {string} input_id The id of the input field
 * @property {string} input_value The value to insert into the field
 */

/**
 * A map of plugin names to their helper API objects.
 * Each plugin defines its own helper methods.
 *
 * Example:
 * editor.helpers.linkedStyles.getStyles()
 *
 * @typedef {Object<string, Object<string, Function>>} EditorHelpers
 */

/**
 * Editor main class.
 *
 * Expects a config object.
 * @class
 */
/**
 * @typedef {Object} User The current user of this superdoc
 * @property {string} name The user's name
 * @property {string} email The user's email
 * @property {string | null} image The user's photo
 */

/**
 * @typedef {Object} DocxNode A JSON representation of a docx node
 */

/**
 * @typedef {Object} EditorOptions
 * @property {HTMLElement} [element] - The container element for the editor
 * @property {string} [selector] - CSS selector for the editor container
 * @property {boolean} [isHeadless=false] - Whether the editor is running in headless mode
 * @property {Document} [mockDocument] - Mock document for testing
 * @property {Window} [mockWindow] - Mock window for testing
 * @property {string} [content=''] - XML content
 * @property {User} [user] - Current user information
 * @property {Array.<User>} [users=[]] - List of users for collaboration
 * @property {Object} [media={}] - Media configuration
 * @property {Object} [mediaFiles={}] - Media files
 * @property {Object} [fonts={}] - Font configuration
 * @property {string} [documentMode='editing'] - Document mode ('editing', 'viewing', 'suggesting')
 * @property {string} [mode='docx'] - Editor mode ('docx', 'text', 'html')
 * @property {string} [role='editor'] - User role ('editor', 'viewer', 'suggester')
 * @property {Array} [colors=[]] - Available colors
 * @property {Object} [converter] - Document converter
 * @property {Object} [fileSource] - Source of the file
 * @property {Object} [initialState] - Initial editor state
 * @property {string} [documentId] - Unique document identifier
 * @property {Array} [extensions=[]] - Editor extensions
 * @property {boolean} [editable=true] - Whether the editor is editable
 * @property {Object} [editorProps={}] - Editor properties
 * @property {Object} [parseOptions={}] - Parsing options
 * @property {Object} [coreExtensionOptions={}] - Core extension options
 * @property {boolean} [enableInputRules=true] - Whether to enable input rules
 * @property {boolean} [isCommentsEnabled=false] - Whether comments are enabled
 * @property {boolean} [isNewFile=false] - Whether this is a new file
 * @property {number} [scale=1] - Editor scale/zoom
 * @property {boolean} [annotations=false] - Whether annotations are enabled
 * @property {boolean} [isInternal=false] - Whether this is an internal editor
 * @property {Array} [externalExtensions=[]] - External extensions
 * @property {Object} [numbering={}] - Numbering configuration
 * @property {boolean} [isHeaderOrFooter=false] - Whether this is a header or footer editor
 * @property {Function} [onBeforeCreate] - Called before editor creation
 * @property {Function} [onCreate] - Called after editor creation
 * @property {Function} [onUpdate] - Called when editor content updates
 * @property {Function} [onSelectionUpdate] - Called when selection updates
 * @property {Function} [onTransaction] - Called when a transaction is processed
 * @property {Function} [onFocus] - Called when editor gets focus
 * @property {Function} [onBlur] - Called when editor loses focus
 * @property {Function} [onDestroy] - Called when editor is destroyed
 * @property {Function} [onContentError] - Called when there's a content error
 * @property {Function} [onTrackedChangesUpdate] - Called when tracked changes update
 * @property {Function} [onCommentsUpdate] - Called when comments update
 * @property {Function} [onCommentsLoaded] - Called when comments are loaded
 * @property {Function} [onCommentClicked] - Called when a comment is clicked
 * @property {Function} [onCommentLocationsUpdate] - Called when comment locations update
 * @property {Function} [onDocumentLocked] - Called when document is locked
 * @property {Function} [onFirstRender] - Called on first render
 * @property {Function} [onCollaborationReady] - Called when collaboration is ready
 * @property {Function} [onPaginationUpdate] - Called when pagination updates
 * @property {Function} [onException] - Called when an exception occurs
 * @property {Function} [onListDefinitionsChange] - Called when list definitions change
 * @property {Function} [handleImageUpload] - Handler for image uploads
 * @property {Object} [telemetry] - Telemetry configuration
 * @property {boolean} [suppressDefaultDocxStyles] - Prevent default styles from being applied in docx mode
 * @property {boolean} [jsonOverride] - Whether to override content with provided json
 * @property {string} [html] - HTML content to initialize the editor with
 * @property {string} [markdown] - Markdown content to initialize the editor with
 */

/**
 * Main editor class that manages document state, extensions, and user interactions
 * @class
 * @extends EventEmitter
 */
export class Editor extends EventEmitter {
  /**
   * Command service for handling editor commands
   * @private
   */
  #commandService;

  /**
   * Service for managing extensions
   * @type {Object}
   */
  extensionService;

  /**
   * Storage for extension data
   * @type {Object}
   */
  extensionStorage = {};

  /**
   * ProseMirror schema for the editor
   * @type {Object}
   */
  schema;

  /**
   * ProseMirror view instance
   * @type {Object}
   */
  view;

  /**
   * Whether the editor currently has focus
   * @type {boolean}
   */
  isFocused = false;

  options = {
    element: null,
    selector: null,
    isHeadless: false,
    mockDocument: null,
    mockWindow: null,
    content: '', // XML content
    user: null,
    users: [],
    media: {},
    mediaFiles: {},
    fonts: {},
    documentMode: 'editing',
    mode: 'docx',
    role: 'editor',
    colors: [],
    converter: null,
    fileSource: null,
    initialState: null,
    documentId: null,
    extensions: [],
    editable: true,
    editorProps: {},
    parseOptions: {},
    coreExtensionOptions: {},
    enableInputRules: true,
    isCommentsEnabled: false,
    isNewFile: false,
    scale: 1,
    annotations: false,
    isInternal: false,
    externalExtensions: [],
    numbering: {},
    isHeaderOrFooter: false,
    lastSelection: null,
    suppressDefaultDocxStyles: false,
    jsonOverride: false,
    onBeforeCreate: () => null,
    onCreate: () => null,
    onUpdate: () => null,
    onSelectionUpdate: () => null,
    onTransaction: () => null,
    onFocus: () => null,
    onBlur: () => null,
    onDestroy: () => null,
    onContentError: ({ error }) => {
      throw error;
    },
    onTrackedChangesUpdate: () => null,
    onCommentsUpdate: () => null,
    onCommentsLoaded: () => null,
    onCommentClicked: () => null,
    onCommentLocationsUpdate: () => null,
    onDocumentLocked: () => null,
    onFirstRender: () => null,
    onCollaborationReady: () => null,
    onPaginationUpdate: () => null,
    onException: () => null,
    onListDefinitionsChange: () => null,
    // async (file) => url;
    handleImageUpload: null,

    // telemetry
    telemetry: null,

    // Docx xml updated by User
    customUpdatedFiles: {},

    isHeaderFooterChanged: false,
    isCustomXmlChanged: false,

    focusTarget: null,
  };

  /**
   * Create a new Editor instance
   * @param {EditorOptions} options - Editor configuration options
   * @returns {void}
   */
  constructor(options) {
    super();

    this.#initContainerElement(options);
    this.#checkHeadless(options);
    this.setOptions(options);

    let modes = {
      docx: () => this.#init(),
      text: () => this.#initRichText(),
      html: () => this.#initRichText(),
      default: () => {
        console.log('Not implemented.');
      },
    };

    let initMode = modes[this.options.mode] ?? modes.default;

    const { setHighContrastMode } = useHighContrastMode();
    this.setHighContrastMode = setHighContrastMode;
    initMode();
  }

  /**
   * Getter which indicates if any changes happen in Editor
   * @returns {boolean}
   */
  get docChanged() {
    return (
      this.options.isHeaderFooterChanged ||
      this.options.isCustomXmlChanged ||
      !this.options.initialState.doc.eq(this.state.doc)
    );
  }

  /**
   * Initialize the container element for the editor
   * @private
   * @param {EditorOptions} options - Editor options
   * @returns {void}
   */
  #initContainerElement(options) {
    if (!options.element && options.selector) {
      const { selector } = options;
      if (selector.startsWith('#') || selector.startsWith('.')) {
        options.element = document.querySelector(selector);
      } else {
        options.element = document.getElementById(selector);
      }

      const textModes = ['text', 'html'];
      if (textModes.includes(options.mode) && options.element) {
        options.element.classList.add('sd-super-editor-html');
      }
    }
    options.element = options.isHeadless ? null : options.element || document.createElement('div');
  }

  /**
   * Initialize the editor with the given options
   * @private
   * @returns {void}
   */
  #init() {
    this.#createExtensionService();
    this.#createCommandService();
    this.#createSchema();
    this.#createConverter();
    this.#initMedia();

    if (!this.options.isHeadless) {
      this.#initFonts();
    }

    this.on('beforeCreate', this.options.onBeforeCreate);
    this.emit('beforeCreate', { editor: this });
    this.on('contentError', this.options.onContentError);
    this.on('exception', this.options.onException);

    this.mount(this.options.element);

    this.on('create', this.options.onCreate);
    this.on('update', this.options.onUpdate);
    this.on('selectionUpdate', this.options.onSelectionUpdate);
    this.on('transaction', this.options.onTransaction);
    this.on('focus', this.#onFocus);
    this.on('blur', this.options.onBlur);
    this.on('destroy', this.options.onDestroy);
    this.on('trackedChangesUpdate', this.options.onTrackedChangesUpdate);
    this.on('commentsLoaded', this.options.onCommentsLoaded);
    this.on('commentClick', this.options.onCommentClicked);
    this.on('commentsUpdate', this.options.onCommentsUpdate);
    this.on('locked', this.options.onDocumentLocked);
    this.on('collaborationReady', this.#onCollaborationReady);
    this.on('paginationUpdate', this.options.onPaginationUpdate);
    this.on('comment-positions', this.options.onCommentLocationsUpdate);
    this.on('list-definitions-change', this.options.onListDefinitionsChange);

    if (!this.options.isHeadless) {
      this.initializeCollaborationData();
      this.initDefaultStyles();
    }

    if (!this.options.ydoc) this.migrateListsToV2();

    this.setDocumentMode(this.options.documentMode);

    // Init pagination only if we are not in collaborative mode. Otherwise
    // it will be in itialized via this.#onCollaborationReady
    if (!this.options.ydoc) {
      if (!this.options.isChildEditor) {
        this.#initPagination();
        this.#initComments();

        this.#validateDocumentInit();
      }
    }
  }

  /**
   * Initialize the editor in rich text mode
   * @private
   * @param {EditorOptions} options - Editor options
   * @returns {void}
   */
  #initRichText() {
    if (!this.options.extensions || !this.options.extensions.length) {
      this.options.extensions = getRichTextExtensions();
    }

    this.#createExtensionService();
    this.#createCommandService();
    this.#createSchema();

    this.on('beforeCreate', this.options.onBeforeCreate);
    this.emit('beforeCreate', { editor: this });
    this.on('contentError', this.options.onContentError);

    this.mount(this.options.element);

    this.on('create', this.options.onCreate);
    this.on('update', this.options.onUpdate);
    this.on('selectionUpdate', this.options.onSelectionUpdate);
    this.on('transaction', this.options.onTransaction);
    this.on('focus', this.#onFocus);
    this.on('blur', this.options.onBlur);
    this.on('destroy', this.options.onDestroy);
    this.on('commentsLoaded', this.options.onCommentsLoaded);
    this.on('commentClick', this.options.onCommentClicked);
    this.on('locked', this.options.onDocumentLocked);
    this.on('list-definitions-change', this.options.onListDefinitionsChange);
  }

  mount(el) {
    this.#createView(el);

    window.setTimeout(() => {
      if (this.isDestroyed) return;
      this.emit('create', { editor: this });
    }, 0);
  }

  unmount() {
    if (this.view) {
      this.view.destroy();
    }

    this.view = null;
  }

  /**
   *
   * @private
   * @param {Object} param0
   * @param {Object} param0.editor
   * @param {Object} param0.event
   * @returns {void}
   */
  #onFocus({ editor, event }) {
    this.toolbar?.setActiveEditor(editor);
    this.options.onFocus({ editor, event });
  }

  /**
   * Set the toolbar for this editor
   * @param {Object} toolbar - The toolbar instance
   * @returns {void}
   */
  setToolbar(toolbar) {
    this.toolbar = toolbar;
  }

  /**
   * Check if the editor should run in headless mode
   * @private
   * @param {EditorOptions} options - Editor options
   * @returns {void}
   */
  #checkHeadless(options) {
    if (!options.isHeadless) return;

    if (typeof navigator === 'undefined') {
      global.navigator = { isHeadless: true };
    }

    if (options.mockDocument) {
      global.document = options.mockDocument;
      global.window = options.mockWindow;
    }
  }

  /**
   * Focus the editor.
   * @returns {void}
   */
  focus() {
    this.view?.focus();
  }

  /**
   * Get the editor state
   * @returns {Object} ProseMirror state
   */
  get state() {
    return this.view?.state;
  }

  /**
   * Get the editor storage.
   * @returns {Object} Editor storage object
   */
  get storage() {
    return this.extensionStorage;
  }

  /**
   * Get object of registered commands.
   * @returns {Object} Commands object
   */
  get commands() {
    return this.#commandService?.commands;
  }

  /**
   * Get extension helpers.
   * @returns {EditorHelpers} Object with helper methods for extensions
   */
  get helpers() {
    return this.extensionService.helpers;
  }

  /**
   * Check if the editor is editable.
   * @returns {boolean}
   */
  get isEditable() {
    return this.options.editable && this.view && this.view.editable;
  }

  /**
   * Check if editor is destroyed.
   * @returns {boolean}
   */
  get isDestroyed() {
    return this.view?.isDestroyed ?? true;
  }

  /**
   * Get the editor element
   * @returns {HTMLElement} The editor element
   */
  get element() {
    return this.options.element;
  }

  /**
   * Get possible users of the editor.
   * @returns {Array.<User>} List of users
   */
  get users() {
    return this.options.users;
  }

  /**
   * Create a chain of commands to call multiple commands at once.
   * @returns {Object} Command chain
   */
  chain() {
    return this.#commandService.chain();
  }

  /**
   * Check if a command or a chain of commands can be executed. Without executing it.
   * @returns {Object} Object with methods to check command availability
   */
  can() {
    return this.#commandService.can();
  }

  /**
   * Set the document mode
   * @param {string} documentMode - The document mode ('editing', 'viewing', 'suggesting')
   */
  setDocumentMode(documentMode) {
    let cleanedMode = documentMode?.toLowerCase() || 'editing';
    if (!this.extensionService || !this.state) return;

    const pm = document.querySelector('.ProseMirror');

    if (this.options.role === 'viewer') cleanedMode = 'viewing';
    if (this.options.role === 'suggester' && cleanedMode === 'editing') cleanedMode = 'suggesting';
    // Viewing mode: Not editable, no tracked changes, no comments
    if (cleanedMode === 'viewing') {
      // this.unregisterPlugin('comments');
      this.commands.toggleTrackChangesShowOriginal();
      this.setEditable(false, false);
      this.setOptions({ documentMode: 'viewing' });
      toggleHeaderFooterEditMode({
        editor: this,
        focusedSectionEditor: null,
        isEditMode: false,
        documentMode: cleanedMode,
      });
      if (!this.options.isHeaderOrFooter && pm) pm.classList.add('view-mode');
    }

    // Suggesting: Editable, tracked changes plugin enabled, comments
    else if (cleanedMode === 'suggesting') {
      // this.#registerPluginByNameIfNotExists('comments')
      this.#registerPluginByNameIfNotExists('TrackChangesBase');
      this.commands.disableTrackChangesShowOriginal();
      this.commands.enableTrackChanges();
      this.setOptions({ documentMode: 'suggesting' });
      this.setEditable(true, false);
      if (pm) pm.classList.remove('view-mode');
    }

    // Editing: Editable, tracked changes plguin disabled, comments
    else if (cleanedMode === 'editing') {
      this.#registerPluginByNameIfNotExists('TrackChangesBase');
      // this.#registerPluginByNameIfNotExists('comments');
      this.commands.disableTrackChangesShowOriginal();
      this.commands.disableTrackChanges();
      this.setEditable(true, false);
      this.setOptions({ documentMode: 'editing' });
      toggleHeaderFooterEditMode({
        editor: this,
        focusedSectionEditor: null,
        isEditMode: false,
        documentMode: cleanedMode,
      });
      if (pm) pm.classList.remove('view-mode');
    }
  }

  /**
   * Export the yjs binary from the current state.
   * @returns {Promise<Uint8Array>} The exported yjs binary
   */
  async generateCollaborationUpdate() {
    return await generateCollaborationData(this);
  }

  /**
   * Initialize data for collaborative editing
   * If we are replacing data and have a valid provider, listen for synced event
   * so that we can initialize the data
   * @returns {void}
   */
  initializeCollaborationData() {
    if (!this.options.isNewFile || !this.options.collaborationProvider) return;
    const { collaborationProvider: provider } = this.options;

    const postSyncInit = () => {
      provider.off('synced', postSyncInit);
      this.#insertNewFileData();
    };

    if (provider.synced) this.#insertNewFileData();
    // If we are not sync'd yet, wait for the event then insert the data
    else provider.on('synced', postSyncInit);
  }

  /**
   * Replace content of editor that was created with loadFromSchema option
   * Used to replace content of other header/footer when one of it was edited
   *
   * @param {object} content - new editor content json (retrieved from editor.getUpdatedJson)
   * @returns {void}
   */
  replaceContent(content) {
    this.setOptions({
      content,
    });

    this.#createConverter();
    this.initDefaultStyles();

    this.#createConverter();
    this.#initMedia();

    const doc = this.#generatePmData();
    const tr = this.state.tr.replaceWith(0, this.state.doc.content.size, doc);
    tr.setMeta('replaceContent', true);
    this.view.dispatch(tr);
  }

  /**
   * Replace the current document with new data. Necessary for initializing a new collaboration file,
   * since we need to insert the data only after the provider has synced.
   */
  /**
   * Insert data for a new file
   * @private
   * @returns {void}
   */
  #insertNewFileData() {
    if (!this.options.isNewFile) return;
    this.options.isNewFile = false;
    const doc = this.#generatePmData();
    // hiding this transaction from history so it doesn't appear in undo stack
    const tr = this.state.tr.replaceWith(0, this.state.doc.content.size, doc).setMeta('addToHistory', false);
    this.view.dispatch(tr);

    setTimeout(() => {
      this.#initPagination();
      this.#initComments();
    }, 50);
  }

  /**
   * Register a plugin by name if it doesn't already exist
   * @private
   * @param {string} name - Plugin name
   * @returns {string|void}
   */
  #registerPluginByNameIfNotExists(name) {
    const plugin = this.extensionService?.plugins.find((p) => p.key.startsWith(name));
    const hasPlugin = this.state?.plugins?.find((p) => p.key.startsWith(name));
    if (plugin && !hasPlugin) this.registerPlugin(plugin);
    return plugin?.key;
  }

  /**
   * Set editor options and update state.
   * @param {EditorOptions} options - Editor options
   * @returns {void}
   */
  setOptions(options = {}) {
    this.options = {
      ...this.options,
      ...options,
    };

    if (this.options.collaborationProvider && this.options.ydoc) {
      const nonCollabHistoryIndex = this.options.extensions.findIndex((e) => e.name === 'history');
      if (nonCollabHistoryIndex !== -1) {
        this.options.extensions.splice(nonCollabHistoryIndex, 1);
      }
    }

    if ((this.options.isNewFile || !this.options.ydoc) && this.options.isCommentsEnabled) {
      this.options.shouldLoadComments = true;
    }

    if (!this.view || !this.state || this.ifsDestroyed) {
      return;
    }

    if (this.options.editorProps) {
      this.view.setProps(this.options.editorProps);
    }

    this.view.updateState(this.state);
  }

  /**
   * Set whether the editor is editable
   * @param {boolean} [editable=true] - Whether the editor is editable
   * @param {boolean} [emitUpdate=true] - Whether to emit an update event
   * @returns {void}
   */
  setEditable(editable = true, emitUpdate = true) {
    this.setOptions({ editable });

    if (emitUpdate) {
      this.emit('update', { editor: this, transaction: this.state.tr });
    }
  }

  /**
   * Register PM plugin.
   * @param plugin PM plugin.
   * @param handlePlugins Optional function for handling plugin merge.
   * @returns {void}
   */
  registerPlugin(plugin, handlePlugins) {
    if (!this.state?.plugins) return;
    const plugins =
      typeof handlePlugins === 'function'
        ? handlePlugins(plugin, [...this.state.plugins])
        : [...this.state.plugins, plugin];

    const state = this.state.reconfigure({ plugins });
    this.view.updateState(state);
  }

  /**
   * Unregister a PM plugin
   * @param {string|Object} nameOrPluginKey - Plugin name or plugin instance
   * @returns {void}
   */
  unregisterPlugin(nameOrPluginKey) {
    if (this.isDestroyed) return;

    const name = typeof nameOrPluginKey === 'string' ? `${nameOrPluginKey}$` : nameOrPluginKey.key;

    const state = this.state.reconfigure({
      plugins: this.state.plugins.filter((plugin) => !plugin.key.startsWith(name)),
    });

    this.view.updateState(state);
  }

  /**
   * Creates extension service.
   * @private
   * @returns {void}
   */
  #createExtensionService() {
    const allowedExtensions = ['extension', 'node', 'mark'];

    const coreExtensions = [Editable, Commands, EditorFocus, Keymap];
    const externalExtensions = this.options.externalExtensions || [];

    const allExtensions = [...coreExtensions, ...this.options.extensions].filter((e) =>
      allowedExtensions.includes(e?.type),
    );

    this.extensionService = ExtensionService.create(allExtensions, externalExtensions, this);
  }

  /**
   * Creates a command service.
   * @private
   * @returns {void}
   */
  #createCommandService() {
    this.#commandService = CommandService.create({
      editor: this,
    });
  }

  /**
   * Creates a SuperConverter.
   */
  /**
   * Create the document converter as this.converter.
   * @private
   * @returns {void}
   */
  #createConverter() {
    if (this.options.converter) {
      this.converter = this.options.converter;
    } else {
      this.converter = new SuperConverter({
        docx: this.options.content,
        media: this.options.mediaFiles,
        fonts: this.options.fonts,
        debug: true,
        telemetry: this.options.telemetry,
        fileSource: this.options.fileSource,
        documentId: this.options.documentId,
      });
    }
  }

  /**
   * Initialize media.
   * @private
   * @returns {void}
   */
  #initMedia() {
    if (this.options.isChildEditor) return;
    if (!this.options.ydoc) return (this.storage.image.media = this.options.mediaFiles);

    const mediaMap = this.options.ydoc.getMap('media');

    // We are creating a new file and need to set the media
    if (this.options.isNewFile) {
      Object.entries(this.options.mediaFiles).forEach(([key, value]) => {
        mediaMap.set(key, value);
      });

      // Set the storage to the imported media files
      this.storage.image.media = this.options.mediaFiles;
    }

    // If we are opening an existing file, we need to get the media from the ydoc
    else {
      this.storage.image.media = Object.fromEntries(mediaMap.entries());
    }
  }

  /**
   * Initialize fonts
   * @private
   * @returns {void}
   */
  #initFonts() {
    const styleString = this.converter.getDocumentFonts();

    if (styleString?.length) {
      const style = document.createElement('style');
      style.textContent = styleString;
      document.head.appendChild(style);
    }
  }

  /**
   * Load the data from DOCX to be used in the schema.
   * Expects a DOCX file.
   * @static
   * @async
   * @param {File|Blob|Buffer} fileSource - The DOCX file to load (File/Blob in browser, Buffer in Node.js)
   * @param {boolean} [isNode=false] - Whether the method is being called in a Node.js environment
   * @returns {Promise<Array>} - A promise that resolves to an array containing:
   *   - [0] xmlFiles - Array of XML files extracted from the DOCX
   *   - [1] mediaFiles - Object containing media files with URLs (browser only)
   *   - [2] mediaFiles - Object containing media files with base64 data
   *   - [3] fonts - Object containing font files from the DOCX
   */
  static async loadXmlData(fileSource, isNode = false) {
    if (!fileSource) return;

    const zipper = new DocxZipper();
    const xmlFiles = await zipper.getDocxData(fileSource, isNode);
    const mediaFiles = zipper.media;

    return [xmlFiles, mediaFiles, zipper.mediaFiles, zipper.fonts];
  }

  /**
   * Get the document version
   * @static
   * @param {Object} doc - Document object
   * @returns {string} Document version
   */
  static getDocumentVersion(doc) {
    const version = SuperConverter.getStoredSuperdocVersion(doc);
    return version;
  }

  /**
   * Update the document version
   * @static
   * @param {Object} doc - Document object
   * @param {string} version - New version
   * @returns {Object}
   */
  static updateDocumentVersion(doc, version) {
    const updatedContent = SuperConverter.updateDocumentVersion(doc, version);
    return updatedContent;
  }

  /**
   * Creates document PM schema.
   * @private
   * @returns {void
   */
  #createSchema() {
    this.schema = this.extensionService.schema;
  }

  /**
   * Generate ProseMirror data from file
   * @private
   * @returns {Object} ProseMirror data
   */
  #generatePmData() {
    let doc;

    try {
      const { mode, fragment, content, loadFromSchema } = this.options;

      if (mode === 'docx') {
        if (loadFromSchema) {
          doc = this.schema.nodeFromJSON(content);
          doc = this.#prepareDocumentForImport(doc);
        } else {
          doc = createDocument(this.converter, this.schema, this);

          // Perform any additional document processing prior to finalizing the doc here
          doc = this.#prepareDocumentForImport(doc);

          // Check for markdown BEFORE html (since markdown gets converted to HTML)
          if (this.options.markdown) {
            doc = createDocFromMarkdown(this.options.markdown, this.schema);
          }
          // If we have a new doc, and have html data, we initialize from html
          else if (this.options.html) doc = createDocFromHTML(this.options.html, this.schema);
          else if (this.options.jsonOverride) doc = this.schema.nodeFromJSON(this.options.jsonOverride);

          if (fragment) doc = yXmlFragmentToProseMirrorRootNode(fragment, this.schema);
        }
      }

      // If we are in HTML mode, we initialize from either content or html (or blank)
      else if (mode === 'text' || mode === 'html') {
        if (loadFromSchema) doc = this.schema.nodeFromJSON(content);
        else if (content) doc = createDocFromHTML(content, this.schema);
        else doc = this.schema.topNodeType.createAndFill();
      }
    } catch (err) {
      console.error(err);
      this.emit('contentError', { editor: this, error: err });
    }

    return doc;
  }

  /**
   * Create the PM editor view
   * @private
   * @returns {void}
   */
  #createView(element) {
    let doc = this.#generatePmData();

    // Only initialize the doc if we are not using Yjs/collaboration.
    const state = { schema: this.schema };
    if (!this.options.ydoc) state.doc = doc;

    this.options.initialState = EditorState.create(state);

    this.view = new EditorView(element, {
      ...this.options.editorProps,
      dispatchTransaction: this.#dispatchTransaction.bind(this),
      state: this.options.initialState,
      handleClick: this.#handleNodeSelection.bind(this),
      handleDoubleClick: async (view, pos, event) => {
        // Prevent edits if editor is not editable
        if (this.options.documentMode !== 'editing') return;

        // Deactivates header/footer editing mode when double-click on main editor
        const isHeader = hasSomeParentWithClass(event.target, 'pagination-section-header');
        const isFooter = hasSomeParentWithClass(event.target, 'pagination-section-footer');
        if (isHeader || isFooter) {
          const eventClone = new event.constructor(event.type);
          event.target.dispatchEvent(eventClone);

          // Imitate default double click behavior - word selection
          if (this.options.isHeaderOrFooter && this.options.editable) setWordSelection(view, pos);
          return;
        }
        event.stopPropagation();

        if (!this.options.editable) {
          // ToDo don't need now but consider to update pagination when recalculate header/footer height
          // this.storage.pagination.sectionData = await initPaginationData(this);
          //
          // const newTr = this.view.state.tr;
          // newTr.setMeta('forceUpdatePagination', true);
          // this.view.dispatch(newTr);

          this.setEditable(true, false);
          toggleHeaderFooterEditMode({
            editor: this,
            focusedSectionEditor: null,
            isEditMode: false,
            documentMode: this.options.documentMode,
          });
          const pm = document.querySelector('.ProseMirror');
          pm.classList.remove('header-footer-edit');
          pm.setAttribute('aria-readonly', false);
        }

        // Imitate default double click behavior - word selection
        setWordSelection(view, pos);
      },
    });

    const newState = this.state.reconfigure({
      plugins: [...this.extensionService.plugins],
    });

    this.view.updateState(newState);

    this.createNodeViews();

    this.options.telemetry?.sendReport();
  }

  /**
   * Creates all node views.
   * @returns {void}
   */
  createNodeViews() {
    this.view.setProps({
      nodeViews: this.extensionService.nodeViews,
    });
  }

  /**
   * Get the maximum content size
   * @returns {Object} Size object with width and height
   */
  getMaxContentSize() {
    if (!this.converter) return {};
    const { pageSize = {}, pageMargins = {} } = this.converter.pageStyles ?? {};
    const { width, height } = pageSize;
    const { top = 0, bottom = 0, left = 0, right = 0 } = pageMargins;

    // All sizes are in inches so we multiply by 96 to get pixels
    if (!width || !height) return {};

    const maxHeight = height * 96 - top * 96 - bottom * 96 - 50;
    const maxWidth = width * 96 - left * 96 - right * 96 - 20;
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  /**
   * Attach styles and attributes to the editor element
   */
  updateEditorStyles(element, proseMirror, hasPaginationEnabled = true) {
    const { pageSize, pageMargins } = this.converter.pageStyles ?? {};

    if (!proseMirror || !element) {
      return;
    }

    proseMirror.setAttribute('role', 'document');
    proseMirror.setAttribute('aria-multiline', true);
    proseMirror.setAttribute('aria-label', 'Main content area, start typing to enter text.');
    proseMirror.setAttribute('aria-description', '');
    proseMirror.classList.remove('view-mode');

    // Set fixed dimensions and padding that won't change with scaling
    if (pageSize) {
      element.style.width = pageSize.width + 'in';
      element.style.minWidth = pageSize.width + 'in';
      element.style.minHeight = pageSize.height + 'in';
    }

    if (pageMargins) {
      element.style.paddingLeft = pageMargins.left + 'in';
      element.style.paddingRight = pageMargins.right + 'in';
    }

    element.style.boxSizing = 'border-box';
    element.style.isolation = 'isolate'; // to create new stacking context.

    proseMirror.style.outline = 'none';
    proseMirror.style.border = 'none';

    // Typeface and font size
    const { typeface, fontSizePt } = this.converter.getDocumentDefaultStyles() ?? {};

    if (typeface) {
      element.style.fontFamily = typeface;
    }
    if (fontSizePt) {
      element.style.fontSize = `${fontSizePt}pt`;
    }

    // Mobile styles
    element.style.transformOrigin = 'top left';
    element.style.touchAction = 'auto';
    element.style.webkitOverflowScrolling = 'touch';

    // Calculate line height
    const defaultLineHeight = 1.2;
    proseMirror.style.lineHeight = defaultLineHeight;

    // If we are not using pagination, we still need to add some padding for header/footer
    if (!hasPaginationEnabled) {
      proseMirror.style.paddingTop = '1in';
      proseMirror.style.paddingBottom = '1in';
    } else {
      proseMirror.style.paddingTop = '0';
      proseMirror.style.paddingBottom = '0';
    }
  }

  /**
   * Initialize default styles for the editor container and ProseMirror.
   * Get page size and margins from the converter.
   * Set document default font and font size.
   *
   * @param {HTMLElement} [element=this.element] - The DOM element to apply styles to
   * @returns {void}
   */
  initDefaultStyles(element = this.element, isPaginationEnabled = true) {
    if (this.options.isHeadless || this.options.suppressDefaultDocxStyles) return;

    const proseMirror = element?.querySelector('.ProseMirror');

    this.updateEditorStyles(element, proseMirror, isPaginationEnabled);

    this.initMobileStyles(element);
  }

  /**
   * Initializes responsive styles for mobile devices.
   * Sets up scaling based on viewport width and handles orientation changes.
   *
   * @param {HTMLElement|void} element - The DOM element to apply mobile styles to
   * @returns {void}
   */
  initMobileStyles(element) {
    if (!element) {
      return;
    }

    const initialWidth = element.offsetWidth;

    const updateScale = () => {
      const minPageSideMargin = 10;
      const elementWidth = initialWidth;
      const availableWidth = document.documentElement.clientWidth - minPageSideMargin;

      this.options.scale = Math.min(1, availableWidth / elementWidth);

      const superEditorElement = element.closest('.super-editor');
      const superEditorContainer = element.closest('.super-editor-container');

      if (!superEditorElement || !superEditorContainer) {
        return;
      }

      if (this.options.scale < 1) {
        superEditorElement.style.maxWidth = `${elementWidth * this.options.scale}px`;
        superEditorContainer.style.minWidth = '0px';

        element.style.transform = `scale(${this.options.scale})`;
      } else {
        superEditorElement.style.maxWidth = '';
        superEditorContainer.style.minWidth = '';

        element.style.transform = 'none';
      }
    };

    // Initial scale
    updateScale();

    const handleResize = () => {
      setTimeout(() => {
        updateScale();
      }, 150);
    };

    if ('orientation' in screen && 'addEventListener' in screen.orientation) {
      screen.orientation.addEventListener('change', handleResize);
    } else {
      window.matchMedia('(orientation: portrait)').addEventListener('change', handleResize);
    }

    window.addEventListener('resize', () => handleResize);
  }

  /**
   * Handler called when collaboration is ready.
   * Initializes pagination and comments if not a new file.
   *
   * @private
   * @param {Object} params - Collaboration parameters
   * @param {Editor} params.editor - The editor instance
   * @param {Object} params.ydoc - The Yjs document
   * @returns {void}
   */
  #onCollaborationReady({ editor, ydoc }) {
    if (this.options.collaborationIsReady) return;
    console.debug('🔗 [super-editor] Collaboration ready');

    this.#validateDocumentInit();

    this.options.onCollaborationReady({ editor, ydoc });
    this.options.collaborationIsReady = true;
    this.options.initialState = this.state;

    const { tr } = this.state;
    tr.setMeta('collaborationReady', true);
    this.view.dispatch(tr);

    if (!this.options.isNewFile) {
      this.#initPagination();
      this.#initComments();
      updateYdocDocxData(this);
    }
  }

  /**
   * Initialize comments plugin
   * @private
   * @returns {void}
   */
  #initComments() {
    if (!this.options.isCommentsEnabled) return;
    if (this.options.isHeadless) return;
    if (!this.options.shouldLoadComments) return;
    const replacedFile = this.options.replacedFile;
    this.emit('commentsLoaded', { editor: this, replacedFile, comments: this.converter.comments || [] });

    setTimeout(() => {
      this.options.replacedFile = false;
      const { state, dispatch } = this.view;
      const tr = state.tr.setMeta(CommentsPluginKey, { type: 'force' });
      dispatch(tr);
    }, 50);
  }

  /**
   * Initialize pagination, if the pagination extension is enabled.
   * @async
   * @returns {Promise<void>}
   */
  async #initPagination() {
    if (this.options.isHeadless || !this.extensionService || this.options.isHeaderOrFooter) {
      return;
    }

    const pagination = this.options.extensions.find((e) => e.name === 'pagination');
    if (pagination && this.options.pagination) {
      const sectionData = await initPaginationData(this);
      this.storage.pagination.sectionData = sectionData;

      // Trigger transaction to initialize pagination
      const { state, dispatch } = this.view;
      const tr = state.tr.setMeta(PaginationPluginKey, { isReadyToInit: true });
      dispatch(tr);
    }
  }

  /**
   * Dispatch a transaction to update the editor state
   * @private
   * @param {Object} transaction - ProseMirror transaction
   */
  #dispatchTransaction(transaction) {
    if (this.isDestroyed) return;
    const start = Date.now();

    let state;
    try {
      const trackChangesState = TrackChangesBasePluginKey.getState(this.view.state);
      const isTrackChangesActive = trackChangesState?.isTrackChangesActive ?? false;

      const tr = isTrackChangesActive
        ? trackedTransaction({
            tr: transaction,
            state: this.state,
            user: this.options.user,
          })
        : transaction;

      const { state: newState } = this.view.state.applyTransaction(tr);
      state = newState;
    } catch (error) {
      // just in case
      state = this.state.apply(transaction);
      console.log(error);
    }

    const selectionHasChanged = !this.state.selection.eq(state.selection);
    this.view.updateState(state);

    const end = Date.now();
    this.emit('transaction', {
      editor: this,
      transaction,
      duration: end - start,
    });

    if (selectionHasChanged) {
      this.emit('selectionUpdate', {
        editor: this,
        transaction,
      });
    }

    const focus = transaction.getMeta('focus');
    if (focus) {
      this.emit('focus', {
        editor: this,
        event: focus.event,
        transaction,
      });
    }

    const blur = transaction.getMeta('blur');
    if (blur) {
      this.emit('blur', {
        editor: this,
        event: blur.event,
        transaction,
      });
    }

    if (!transaction.docChanged) {
      return;
    }

    this.emit('update', {
      editor: this,
      transaction,
    });
  }

  /**
   * Get attrs of the currently selected node or mark.
   * @param {String} nameOrType
   * @example
   * editor.getAttributes('textStyle').color
   */
  getAttributes(nameOrType) {
    return Attribute.getAttributes(this.state, nameOrType);
  }

  /**
   * Returns if the currently selected node or mark is active.
   * @param {String|Object} nameOrAttributes - The name of the node/mark or an attributes object
   * @param {Object} [attributesOrUndefined] - Optional attributes to check when first parameter is a name
   * @returns {Boolean} Whether the node or mark is active with the specified attributes
   * @example
   * editor.isActive('bold')
   * editor.isActive('textStyle', { color: 'purple' })
   * editor.isActive({ textAlign: 'center' })
   */
  isActive(nameOrAttributes, attributesOrUndefined) {
    const name = typeof nameOrAttributes === 'string' ? nameOrAttributes : null;
    const attributes = typeof nameOrAttributes === 'string' ? attributesOrUndefined : nameOrAttributes;
    return isActive(this.state, name, attributes);
  }

  /**
   * Get the editor content as JSON
   * @returns {Object} Editor content as JSON
   */
  getJSON() {
    return this.state.doc.toJSON();
  }

  /**
   * Get the editor content as HTML
   * @returns {string} Editor content as HTML
   */
  getHTML({ unflattenLists = false } = {}) {
    const tempDocument = document.implementation.createHTMLDocument();
    const container = tempDocument.createElement('div');
    const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(this.state.doc.content);
    container.appendChild(fragment);
    let html = container.innerHTML;
    if (unflattenLists) {
      html = unflattenListsInHtml(html);
    }
    return html;
  }

  /**
   * Create a child editor linked to this editor.
   * This is useful for creating header/footer editors that are linked to the main editor.
   * Or paragraph fields that rely on the same underlying document and list defintions
   * @param {EditorOptions} options - Options for the child editor
   * @returns {Editor} A new child editor instance linked to this editor
   */
  createChildEditor(options) {
    return createLinkedChildEditor(this, options);
  }

  /**
   * Get page styles
   * @returns {Object} Page styles
   */
  getPageStyles() {
    return this.converter?.pageStyles || {};
  }

  /**
   * Update page styles
   *
   * @param {Object} param0
   * @param {Object} param0.pageMargins The new page margins
   * @returns {void}
   */
  updatePageStyle({ pageMargins }) {
    if (!this.converter) return;

    let hasMadeUpdate = false;
    if (pageMargins) {
      this.converter.pageStyles.pageMargins = pageMargins;
      this.initDefaultStyles();
      hasMadeUpdate = true;
    }

    if (hasMadeUpdate) {
      const newTr = this.view.state.tr;
      newTr.setMeta('forceUpdatePagination', true);
      this.view.dispatch(newTr);
    }
  }

  /**
   * Handles image node selection for header/footer editor
   */
  #handleNodeSelection(view, pos) {
    this.setOptions({
      lastSelection: null,
    });

    if (this.options.isHeaderOrFooter) {
      return setImageNodeSelection(view, pos);
    }
  }

  /**
   * Perform any post conversion pre prosemirror import processing.
   * Comments are processed here.
   * @private
   * @param {Object} doc The prosemirror document
   * @returns {Object} The updated prosemirror document
   */
  #prepareDocumentForImport(doc) {
    const newState = EditorState.create({
      schema: this.schema,
      doc,
    });

    const { tr, doc: newDoc } = newState;

    // Perform comments processing (replaces comment nodes with marks)
    prepareCommentsForImport(newDoc, tr, this.schema, this.converter);

    const updatedState = newState.apply(tr);
    return updatedState.doc;
  }

  migrateListsToV2() {
    if (this.options.isHeaderOrFooter) return [];
    const replacements = migrateListsToV2IfNecessary(this);
    return replacements;
  }

  /**
   * Prepare the document for export. Any necessary pre-export processing to the state
   * can happen here.
   * @private
   * @returns {Object} The updated document in JSON
   */
  #prepareDocumentForExport(comments = []) {
    const newState = EditorState.create({
      schema: this.schema,
      doc: this.state.doc,
      plugins: this.state.plugins,
    });

    const { tr, doc } = newState;

    prepareCommentsForExport(doc, tr, this.schema, comments);
    const updatedState = newState.apply(tr);
    return updatedState.doc.toJSON();
  }

  getUpdatedJson() {
    return this.#prepareDocumentForExport();
  }

  /**
   * Export the editor document to DOCX.
   * @async
   * @param {Object} options - The export options
   * @param {boolean} [options.isFinalDoc=false] - Whether this is the final document version
   * @param {string} [options.commentsType] - The type of comments to include
   * @param {Array} [options.comments=[]] - Array of comments to include in the document
   * @param {boolean} [options.getUpdatedDocs=false] - When set to true return only updated docx files
   * @returns {Promise<Blob|ArrayBuffer|Object>} The exported DOCX file or updated docx files
   */
  async exportDocx({
    isFinalDoc = false,
    commentsType = 'external',
    exportJsonOnly = false,
    exportXmlOnly = false,
    comments = [],
    getUpdatedDocs = false,
    fieldsHighlightColor = null,
  } = {}) {
    // Pre-process the document state to prepare for export
    const json = this.#prepareDocumentForExport(comments);

    // Export the document to DOCX
    const documentXml = await this.converter.exportToDocx(
      json,
      this.schema,
      this.storage.image.media,
      isFinalDoc,
      commentsType,
      comments,
      this,
      exportJsonOnly,
      fieldsHighlightColor,
    );

    if (exportXmlOnly || exportJsonOnly) return documentXml;

    const customXml = this.converter.schemaToXml(this.converter.convertedXml['docProps/custom.xml'].elements[0]);
    const styles = this.converter.schemaToXml(this.converter.convertedXml['word/styles.xml'].elements[0]);
    const customSettings = this.converter.schemaToXml(this.converter.convertedXml['word/settings.xml'].elements[0]);
    const rels = this.converter.schemaToXml(this.converter.convertedXml['word/_rels/document.xml.rels'].elements[0]);
    const media = this.converter.addedMedia;

    const updatedHeadersFooters = {};
    Object.entries(this.converter.convertedXml).forEach(([name, json]) => {
      if (name.includes('header') || name.includes('footer')) {
        const resultXml = this.converter.schemaToXml(json.elements[0]);
        updatedHeadersFooters[name] = String(resultXml);
      }
    });

    const numberingData = this.converter.convertedXml['word/numbering.xml'];
    const numbering = this.converter.schemaToXml(numberingData.elements[0]);
    const updatedDocs = {
      ...this.options.customUpdatedFiles,
      'word/document.xml': String(documentXml),
      'docProps/custom.xml': String(customXml),
      'word/settings.xml': String(customSettings),
      'word/_rels/document.xml.rels': String(rels),
      'word/numbering.xml': String(numbering),

      // Replace & with &amp; in styles.xml as DOCX viewers can't handle it
      'word/styles.xml': String(styles).replace(/&/gi, '&amp;'),
      ...updatedHeadersFooters,
    };

    if (comments.length) {
      const commentsXml = this.converter.schemaToXml(this.converter.convertedXml['word/comments.xml'].elements[0]);
      const commentsExtendedXml = this.converter.schemaToXml(
        this.converter.convertedXml['word/commentsExtended.xml'].elements[0],
      );
      const commentsExtensibleXml = this.converter.schemaToXml(
        this.converter.convertedXml['word/commentsExtensible.xml'].elements[0],
      );
      const commentsIdsXml = this.converter.schemaToXml(
        this.converter.convertedXml['word/commentsIds.xml'].elements[0],
      );

      updatedDocs['word/comments.xml'] = String(commentsXml);
      updatedDocs['word/commentsExtended.xml'] = String(commentsExtendedXml);
      updatedDocs['word/commentsExtensible.xml'] = String(commentsExtensibleXml);
      updatedDocs['word/commentsIds.xml'] = String(commentsIdsXml);
    }

    const zipper = new DocxZipper();

    if (getUpdatedDocs) {
      updatedDocs['[Content_Types].xml'] = await zipper.updateContentTypes(
        {
          files: this.options.content,
        },
        media,
        true,
      );
      return updatedDocs;
    }

    const result = await zipper.updateZip({
      docx: this.options.content,
      updatedDocs: updatedDocs,
      originalDocxFile: this.options.fileSource,
      media,
      fonts: this.options.fonts,
      isHeadless: this.options.isHeadless,
    });

    this.options.telemetry?.trackUsage('document_export', {
      documentType: 'docx',
      timestamp: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Destroy collaboration provider and ydoc
   * @private
   * @returns {void}
   */
  #endCollaboration() {
    if (!this.options.ydoc) return;
    try {
      console.debug('🔗 [super-editor] Ending collaboration');
      if (this.options.collaborationProvider) this.options.collaborationProvider.disconnect();
      if (this.options.ydoc) this.options.ydoc.destroy();
    } catch {}
  }

  /**
   * Destroy the editor and clean up resources
   * @returns {void}
   */
  destroy() {
    this.emit('destroy');

    this.unmount();

    this.destroyHeaderFooterEditors();
    this.#endCollaboration();
    this.removeAllListeners();
  }

  destroyHeaderFooterEditors() {
    try {
      const editors = [...this.converter.headerEditors, ...this.converter.footerEditors];
      for (let editorData of editors) {
        editorData.editor.destroy();
      }
      this.converter.headerEditors.length = 0;
      this.converter.footerEditors.length = 0;
    } catch {}
  }

  /**
   * Check if migrations are needed for the data
   * @static
   * @param {Object} data - Document data
   * @returns {boolean} Whether migrations are needed
   */
  static checkIfMigrationsNeeded() {
    const dataVersion = version || 'initial';
    const migrations = getNecessaryMigrations(dataVersion) || [];
    console.debug('[checkVersionMigrations] Migrations needed:', dataVersion, migrations.length);
    return migrations.length > 0;
  }

  /**
   * Process collaboration migrations
   * @returns {Object | void} Migration results
   */
  processCollaborationMigrations() {
    console.debug('[checkVersionMigrations] Current editor version', __APP_VERSION__);
    if (!this.options.ydoc) return;

    const metaMap = this.options.ydoc.getMap('meta');
    let docVersion = metaMap.get('version');
    if (!docVersion) docVersion = 'initial';
    console.debug('[checkVersionMigrations] Document version', docVersion);
    const migrations = getNecessaryMigrations(docVersion) || [];

    const plugins = this.state.plugins;
    const syncPlugin = plugins.find((p) => p.key.startsWith('y-sync'));
    if (!syncPlugin) return this.options.ydoc;

    let hasRunMigrations = false;
    for (let migration of migrations) {
      console.debug('🏃‍♂️ Running migration', migration.name);
      const result = migration(this);
      if (!result) throw new Error('Migration failed at ' + migration.name);
      else hasRunMigrations = true;
    }

    // If no migrations were run, return undefined (no updated ydoc).
    if (!hasRunMigrations) return;

    // Return the updated ydoc
    const pluginState = syncPlugin?.getState(this.state);
    return pluginState.doc;
  }

  /**
   * Replace the current file
   * @async
   * @param {Object} newFile - New file data
   * @returns {Promise<void>}
   */
  async replaceFile(newFile) {
    this.setOptions({ annotations: true });
    const [docx, media, mediaFiles, fonts] = await Editor.loadXmlData(newFile);
    this.setOptions({
      fileSource: newFile,
      content: docx,
      media,
      mediaFiles,
      fonts,
      isNewFile: true,
      shouldLoadComments: true,
      replacedFile: true,
    });

    this.#createConverter();
    this.#initMedia();
    this.initDefaultStyles();

    if (this.options.ydoc && this.options.collaborationProvider) {
      updateYdocDocxData(this);
      this.initializeCollaborationData(true);
    } else {
      this.#insertNewFileData();
    }

    if (!this.options.ydoc) {
      this.#initPagination();
      this.#initComments();
    }
  }

  /**
   * Get internal docx file content
   * @param {string} name - File name
   * @param {string} type - type of result (json, string)
   * @returns {Object|String} - file content
   */
  getInternalXmlFile(name, type = 'json') {
    if (!this.converter.convertedXml[name]) {
      console.warn('Cannot find file in docx');
      return null;
    }

    if (type === 'json') {
      return this.converter.convertedXml[name].elements[0] || null;
    }
    return this.converter.schemaToXml(this.converter.convertedXml[name].elements[0]);
  }

  /**
   * Update internal docx file content
   * @param {string} name - File name
   * @param {string} updatedContent - new file content
   */
  updateInternalXmlFile(name, updatedContent) {
    if (typeof updatedContent === 'string') {
      this.options.customUpdatedFiles[name] = String(updatedContent);
    } else {
      const internalFileXml = this.converter.schemaToXml(updatedContent);
      this.options.customUpdatedFiles[name] = String(internalFileXml);
    }
    this.options.isCustomXmlChanged = true;
  }

  /**
   * Get all nodes of a specific type
   * @param {string} type - Node type
   * @returns {Array} Array of nodes
   */
  getNodesOfType(type) {
    const { findChildren } = helpers;
    return findChildren(this.state.doc, (node) => node.type.name === type);
  }

  /**
   * Replace a node with HTML content
   * @param {Object} targetNode - The node to replace
   * @param {string} html - HTML content to replace with
   * @returns {void}
   */
  replaceNodeWithHTML(targetNode, html) {
    const { tr } = this.state;
    const { dispatch } = this.view;

    if (!targetNode || !html) return;
    const start = targetNode.pos;
    const end = start + targetNode.node.nodeSize;
    const htmlNode = createDocFromHTML(html, this.schema);
    tr.replaceWith(start, end, htmlNode);
    dispatch(tr);
  }

  /**
   * A command to prepare the editor to receive annotations. This will
   * pre-process the document as needed prior to running in the annotator.
   *
   * Currently this is only used for table generation but additional pre-processing can be done here.
   *
   * @param {FieldValue[]} annotationValues
   * @returns {void}
   */
  prepareForAnnotations(annotationValues = []) {
    const { tr } = this.state;
    const newTr = AnnotatorHelpers.processTables({ state: this.state, tr, annotationValues });
    this.view.dispatch(newTr);
  }

  /**
   * Migrate paragraph fields to lists V2 structure if necessary.
   * @param {FieldValue[]} annotationValues - List of field values to migrate.
   * @returns {Promise<FieldValue[]>} - Returns a promise that resolves to the migrated
   */
  async migrateParagraphFields(annotationValues = []) {
    if (!Array.isArray(annotationValues) || !annotationValues.length) return annotationValues;
    const result = await migrateParagraphFieldsListsV2(annotationValues, this);
    return result;
  }

  /**
   * Annotate the document with the given annotation values.
   *
   * @param {FieldValue[]} annotationValues List of field values to apply.
   * @param {String[]} hiddenIds List of field ids to remove from the document.
   * @returns {void}
   */
  annotate(annotationValues = [], hiddenIds = [], removeEmptyFields = false) {
    const { state, view, schema } = this;
    let tr = state.tr;

    tr = AnnotatorHelpers.processTables({ state: this.state, tr, annotationValues });
    tr = AnnotatorHelpers.annotateDocument({
      tr,
      schema,
      annotationValues,
      hiddenFieldIds: hiddenIds,
      removeEmptyFields,
      editor: this,
    });

    // Dispatch everything in a single transaction, which makes this undo-able in a single undo
    if (tr.docChanged) view.dispatch(tr.scrollIntoView());
  }

  /**
   * Preview annotations in the editor. It stores a copy of the original state.
   * This can be reverted via closePreview()
   *
   * @param {Object[]} annotationValues
   * @param {string[]} hiddenIds
   * @returns {void}
   */
  previewAnnotations(annotationValues = [], hiddenIds = []) {
    this.originalState = this.view.state;
    this.annotate(annotationValues, hiddenIds);
  }

  /**
   * If there is a preview active, this will revert the editor to the original state.
   *
   * @returns {void}
   */
  closePreview() {
    if (!this.originalState) return;
    this.view.updateState(this.originalState);
  }

  /**
   * Run the SuperValidator's active document validation to check and fix potential known issues.
   * @returns {void}
   */
  #validateDocumentInit() {
    if (this.options.isHeaderOrFooter || this.options.isChildEditor) return;

    /** @type {import('./super-validator/index.js').SuperValidator} */
    const validator = new SuperValidator({ editor: this, dryRun: false, debug: false });
    validator.validateActiveDocument();
  }
}
