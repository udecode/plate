import '../style.css';

import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { HocuspocusProviderWebsocket } from '@hocuspocus/provider';

import { DOCX, PDF, HTML } from '@harbour-enterprises/common';
import { SuperToolbar, createZip } from '@harbour-enterprises/super-editor';
import { SuperComments } from '../components/CommentsLayer/commentsList/super-comments-list.js';
import { createSuperdocVueApp } from './create-app.js';
import { shuffleArray } from '@harbour-enterprises/common/collaboration/awareness.js';
import { Telemetry } from '@harbour-enterprises/common/Telemetry.js';
import { createDownload, cleanName } from './helpers/export.js';
import { initSuperdocYdoc, initCollaborationComments, makeDocumentsCollaborative } from './collaboration/helpers.js';

/**
 * @typedef {Object} User The current user of this superdoc
 * @property {string} name The user's name
 * @property {string} email The user's email
 * @property {string | null} [image] The user's photo
 */

/**
 * @typedef {Object} TelemetryConfig Telemetry configuration
 * @property {boolean} [enabled=true] Whether telemetry is enabled
 * @property {string} [licenseKey] The licence key for telemetry
 * @property {string} [endpoint] The endpoint for telemetry
 * @property {string} [superdocVersion] The version of the superdoc
 */

/**
 * @typedef {Object} Document
 * @property {string} [id] The ID of the document
 * @property {string} type The type of the document
 * @property {File | null} [data] The initial data of the document
 * @property {string} [name] The name of the document
 * @property {string} [url] The URL of the document
 * @property {boolean} [isNewFile] Whether the document is a new file
 * @property {import('yjs').Doc} [ydoc] The Yjs document for collaboration
 * @property {import('@hocuspocus/provider').HocuspocusProvider} [provider] The provider for collaboration
 */

/**
 * @typedef {Object} Modules
 * @property {Object} [comments] Comments module configuration
 * @property {Object} [ai] AI module configuration
 * @property {string} [ai.apiKey] Harbour API key for AI features
 * @property {string} [ai.endpoint] Custom endpoint URL for AI services
 * @property {Object} [collaboration] Collaboration module configuration
 * @property {Object} [toolbar] Toolbar module configuration
 */

/** @typedef {import('@harbour-enterprises/super-editor').Editor} Editor */

/**
 * @typedef {string} DocumentMode
 * @property {'editing'} editing The document is in editing mode
 * @property {'viewing'} viewing The document is in viewing mode
 * @property {'suggesting'} suggesting The document is in suggesting mode
 */

/**
 * @typedef {Object} Config
 * @property {string} [superdocId] The ID of the SuperDoc
 * @property {string} selector The selector to mount the SuperDoc into
 * @property {DocumentMode} documentMode The mode of the document
 * @property {'editor' | 'viewer' | 'suggester'} [role] The role of the user in this SuperDoc
 * @property {Object | string} [document] The document to load. If a string, it will be treated as a URL
 * @property {Array<Document>} documents The documents to load
 * @property {User} [user] The current user of this SuperDoc
 * @property {Array<User>} [users] All users of this SuperDoc (can be used for "@"-mentions)
 * @property {Array<string>} [colors] Colors to use for user awareness
 * @property {Modules} [modules] Modules to load
 * @property {boolean} [pagination] Whether to show pagination in SuperEditors
 * @property {string} [toolbar] Optional DOM element to render the toolbar in
 * @property {Array<string>} [toolbarGroups] Toolbar groups to show
 * @property {Object} [toolbarIcons] Icons to show in the toolbar
 * @property {Object} [toolbarTexts] Texts to override in the toolbar
 * @property {boolean} [isDev] Whether the SuperDoc is in development mode
 * @property {TelemetryConfig} [telemetry] Telemetry configuration
 * @property {(editor: Editor) => void} [onEditorBeforeCreate] Callback before an editor is created
 * @property {(editor: Editor) => void} [onEditorCreate] Callback after an editor is created
 * @property {(params: { editor: Editor, transaction: any, duration: number }) => void} [onTransaction] Callback when a transaction is made
 * @property {() => void} [onEditorDestroy] Callback after an editor is destroyed
 * @property {(params: { error: object, editor: Editor, documentId: string, file: File }) => void} [onContentError] Callback when there is an error in the content
 * @property {(editor: { superdoc: SuperDoc }) => void} [onReady] Callback when the SuperDoc is ready
 * @property {(params: { type: string, data: object}) => void} [onCommentsUpdate] Callback when comments are updated
 * @property {(params: { context: SuperDoc, states: Array }) => void} [onAwarenessUpdate] Callback when awareness is updated
 * @property {(params: { isLocked: boolean, lockedBy: User }) => void} [onLocked] Callback when the SuperDoc is locked
 * @property {() => void} [onPdfDocumentReady] Callback when the PDF document is ready
 * @property {(isOpened: boolean) => void} [onSidebarToggle] Callback when the sidebar is toggled
 * @property {(params: { editor: Editor }) => void} [onCollaborationReady] Callback when collaboration is ready
 * @property {(params: { editor: Editor }) => void} [onEditorUpdate] Callback when document is updated
 * @property {(params: { error: Error }) => void} [onException] Callback when an exception is thrown
 * @property {(params: { isRendered: boolean }) => void} [onCommentsListChange] Callback when the comments list is rendered
 * @property {(params: {})} [onListDefinitionsChange] Callback when the list definitions change
 * @property {string} [format] The format of the document (docx, pdf, html)
 * @property {Object[]} [editorExtensions] The extensions to load for the editor
 * @property {boolean} [isInternal] Whether the SuperDoc is internal
 * @property {string} [title] The title of the SuperDoc
 * @property {Object[]} [conversations] The conversations to load
 * @property {boolean} [isLocked] Whether the SuperDoc is locked
 * @property {Object} [pdfViewer] The PDF viewer configuration
 * @property {function(File): Promise<string>} [handleImageUpload] The function to handle image uploads
 * @property {User} [lockedBy] The user who locked the SuperDoc
 * @property {boolean} [rulers] Whether to show the ruler in the editor
 * @property {boolean} [suppressDefaultDocxStyles] Whether to suppress default styles in docx mode
 * @property {boolean} [jsonOverride] Whether to override content with provided JSON
 * @property {boolean} [disableContextMenu] Whether to disable slash / right-click custom context menu
 * @property {string} [html] HTML content to initialize the editor with
 * @property {string} [markdown] Markdown content to initialize the editor with
 */

/**
 * SuperDoc class
 * Expects a config object
 *
 * @class
 * @extends EventEmitter
 */
export class SuperDoc extends EventEmitter {
  /** @type {Array<string>} */
  static allowedTypes = [DOCX, PDF, HTML];

  /** @type {string} */
  version;

  /** @type {User[]} */
  users;

  /** @type {import('yjs').Doc | undefined} */
  ydoc;

  /** @type {import('@hocuspocus/provider').HocuspocusProvider | undefined} */
  provider;

  /** @type {Config} */
  config = {
    superdocId: null,
    selector: '#superdoc',
    documentMode: 'editing',
    role: 'editor',
    document: {},
    documents: [],
    format: null,
    editorExtensions: [],

    colors: [],
    user: { name: null, email: null },
    users: [],

    modules: {}, // Optional: Modules to load. Use modules.ai.{your_key} to pass in your key

    title: 'SuperDoc',
    conversations: [],
    pagination: false, // Optional: Whether to show pagination in SuperEditors
    isInternal: false,

    // toolbar config
    toolbar: null, // Optional DOM element to render the toolbar in
    toolbarGroups: ['left', 'center', 'right'],
    toolbarIcons: {},
    toolbarTexts: {},

    isDev: false,

    // telemetry config
    telemetry: null,

    pdfViewer: {},

    // Events
    onEditorBeforeCreate: () => null,
    onEditorCreate: () => null,
    onEditorDestroy: () => null,
    onContentError: () => null,
    onReady: () => null,
    onCommentsUpdate: () => null,
    onAwarenessUpdate: () => null,
    onLocked: () => null,
    onPdfDocumentReady: () => null,
    onSidebarToggle: () => null,
    onCollaborationReady: () => null,
    onEditorUpdate: () => null,
    onCommentsListChange: () => null,
    onException: () => null,
    onListDefinitionsChange: () => null,
    onTransaction: () => null,
    // Image upload handler
    // async (file) => url;
    handleImageUpload: null,

    // Disable context menus (slash and right-click) globally
    disableContextMenu: false,
  };

  /**
   * @param {Config} config
   */
  constructor(config) {
    super();
    this.#init(config);
  }

  async #init(config) {
    this.config = {
      ...this.config,
      ...config,
    };

    this.config.colors = shuffleArray(this.config.colors);
    this.userColorMap = new Map();
    this.colorIndex = 0;

    // @ts-ignore
    this.version = __APP_VERSION__;
    this.#log('🦋 [superdoc] Using SuperDoc version:', this.version);

    this.superdocId = config.superdocId || uuidv4();
    this.colors = this.config.colors;

    // Preprocess document
    this.#initDocuments();

    // Initialize collaboration if configured
    await this.#initCollaboration(this.config.modules);

    // Apply csp nonce if provided
    if (this.config.cspNonce) this.#patchNaiveUIStyles();

    // this.#initTelemetry();
    this.#initVueApp();
    this.#initListeners();

    this.user = this.config.user; // The current user
    this.users = this.config.users || []; // All users who have access to this superdoc
    this.socket = null;

    this.isDev = this.config.isDev || false;

    this.activeEditor = null;
    this.comments = [];

    this.app.mount(this.config.selector);

    // Required editors
    this.readyEditors = 0;

    this.isLocked = this.config.isLocked || false;
    this.lockedBy = this.config.lockedBy || null;

    // If a toolbar element is provided, render a toolbar
    this.#addToolbar();
  }

  /**
   * Get the number of editors that are required for this superdoc
   * @returns {number} The number of required editors
   */
  get requiredNumberOfEditors() {
    return this.superdocStore.documents.filter((d) => d.type === DOCX).length;
  }

  get state() {
    return {
      documents: this.superdocStore.documents,
      users: this.users,
    };
  }

  #patchNaiveUIStyles() {
    const cspNonce = this.config.cspNonce;

    const originalCreateElement = document.createElement;
    document.createElement = function (tagName) {
      const element = originalCreateElement.call(this, tagName);
      if (tagName.toLowerCase() === 'style') {
        element.setAttribute('nonce', cspNonce);
      }
      return element;
    };
  }

  #initDocuments() {
    const doc = this.config.document;
    const hasDocumentConfig = !!doc && typeof doc === 'object' && Object.keys(this.config.document)?.length;
    const hasDocumentUrl = !!doc && typeof doc === 'string' && doc.length > 0;
    const hasDocumentFile = !!doc && doc instanceof File;
    const hasListOfDocuments = this.config.documents && this.config.documents?.length;
    if (hasDocumentConfig && hasListOfDocuments) {
      console.warn('🦋 [superdoc] You can only provide one of document or documents');
    }

    if (hasDocumentConfig) {
      this.config.documents = [this.config.document];
    } else if (hasDocumentUrl) {
      this.config.documents = [
        {
          type: DOCX,
          url: this.config.document,
          name: 'document.docx',
          isNewFile: true,
        },
      ];
    } else if (hasDocumentFile) {
      this.config.documents = [
        {
          type: this.config.document.type,
          data: this.config.document,
          name: this.config.document.name,
          isNewFile: true,
        },
      ];
    }
  }

  #initVueApp() {
    const { app, pinia, superdocStore, commentsStore, highContrastModeStore } = createSuperdocVueApp();
    this.app = app;
    this.pinia = pinia;
    this.app.config.globalProperties.$config = this.config;
    this.app.config.globalProperties.$documentMode = this.config.documentMode;

    this.app.config.globalProperties.$superdoc = this;
    this.superdocStore = superdocStore;
    this.commentsStore = commentsStore;
    this.highContrastModeStore = highContrastModeStore;
    this.superdocStore.init(this.config);
    this.commentsStore.init(this.config.modules.comments);
  }

  #initListeners() {
    this.on('editorBeforeCreate', this.config.onEditorBeforeCreate);
    this.on('editorCreate', this.config.onEditorCreate);
    this.on('editorDestroy', this.config.onEditorDestroy);
    this.on('ready', this.config.onReady);
    this.on('comments-update', this.config.onCommentsUpdate);
    this.on('awareness-update', this.config.onAwarenessUpdate);
    this.on('locked', this.config.onLocked);
    this.on('pdf-document-ready', this.config.onPdfDocumentReady);
    this.on('sidebar-toggle', this.config.onSidebarToggle);
    this.on('collaboration-ready', this.config.onCollaborationReady);
    this.on('editor-update', this.config.onEditorUpdate);
    this.on('content-error', this.onContentError);
    this.on('exception', this.config.onException);
    this.on('list-definitions-change', this.config.onListDefinitionsChange);
  }

  /**
   * Initialize collaboration if configured
   * @param {Object} config
   * @returns {Promise<Object[]>} The processed documents with collaboration enabled
   */
  async #initCollaboration({ collaboration: collaborationModuleConfig, comments: commentsConfig = {} } = {}) {
    if (!collaborationModuleConfig) return this.config.documents;

    // Flag this superdoc as collaborative
    this.isCollaborative = true;

    // Start a socket for all documents and general metaMap for this SuperDoc
    if (collaborationModuleConfig.providerType === 'hocuspocus') {
      this.config.socket = new HocuspocusProviderWebsocket({
        url: collaborationModuleConfig.url,
      });
    }

    // Initialize collaboration for documents
    const processedDocuments = makeDocumentsCollaborative(this);

    // Optionally, initialize separate superdoc sync - for comments, view, etc.
    if (commentsConfig.useInternalExternalComments && !commentsConfig.suppressInternalExternalComments) {
      const { ydoc: sdYdoc, provider: sdProvider } = initSuperdocYdoc(this);
      this.ydoc = sdYdoc;
      this.provider = sdProvider;
    } else {
      this.ydoc = processedDocuments[0].ydoc;
      this.provider = processedDocuments[0].provider;
    }

    // Initialize comments sync, if enabled
    initCollaborationComments(this);

    return processedDocuments;
  }

  /**
   * Add a user to the shared users list
   * @param {Object} user The user to add
   * @returns {void}
   */
  addSharedUser(user) {
    if (this.users.some((u) => u.email === user.email)) return;
    this.users.push(user);
  }

  /**
   * Remove a user from the shared users list
   * @param {String} email The email of the user to remove
   * @returns {void}
   */
  removeSharedUser(email) {
    this.users = this.users.filter((u) => u.email !== email);
  }

  /**
   * Initialize telemetry service.
   */
  #initTelemetry() {
    this.telemetry = new Telemetry({
      enabled: this.config.telemetry?.enabled ?? true,
      licenseKey: this.config.telemetry?.licenseKey,
      endpoint: this.config.telemetry?.endpoint,
      superdocId: this.superdocId,
      superdocVersion: this.version,
    });
  }

  /**
   * Triggered when there is an error in the content
   * @param {Object} param0
   * @param {Error} param0.error The error that occurred
   * @param {Editor} param0.editor The editor that caused the error
   */
  onContentError({ error, editor }) {
    const { documentId } = editor.options;
    const doc = this.superdocStore.documents.find((d) => d.id === documentId);
    this.config.onContentError({ error, editor, documentId: doc.id, file: doc.data });
  }

  /**
   * Triggered when the PDF document is ready
   * @returns {void}
   */
  broadcastPdfDocumentReady() {
    this.emit('pdf-document-ready');
  }

  /**
   * Triggered when the superdoc is ready
   * @returns {void}
   */
  broadcastReady() {
    if (this.readyEditors === this.requiredNumberOfEditors) {
      this.emit('ready', { superdoc: this });
    }
  }

  /**
   * Triggered before an editor is created
   * @param {Editor} editor The editor that is about to be created
   * @returns {void}
   */
  broadcastEditorBeforeCreate(editor) {
    this.emit('editorBeforeCreate', { editor });
  }

  /**
   * Triggered when an editor is created
   * @param {Editor} editor The editor that was created
   * @returns {void}
   */
  broadcastEditorCreate(editor) {
    this.readyEditors++;
    this.broadcastReady();
    this.emit('editorCreate', { editor });
  }

  /**
   * Triggered when an editor is destroyed
   * @returns {void}
   */
  broadcastEditorDestroy() {
    this.emit('editorDestroy');
  }

  /**
   * Triggered when the comments sidebar is toggled
   * @param {boolean} isOpened
   */
  broadcastSidebarToggle(isOpened) {
    this.emit('sidebar-toggle', isOpened);
  }

  #log(...args) {
    (console.debug ? console.debug : console.log)('🦋 🦸‍♀️ [superdoc]', ...args);
  }

  /**
   * Set the active editor
   * @param {Editor} editor The editor to set as active
   * @returns {void}
   */
  setActiveEditor(editor) {
    this.activeEditor = editor;
    if (this.toolbar) {
      this.activeEditor.toolbar = this.toolbar;
      this.toolbar.setActiveEditor(editor);
    }
  }

  /**
   * Toggle the ruler visibility for SuperEditors
   *
   * @returns {void}
   */
  toggleRuler() {
    this.config.rulers = !this.config.rulers;
    this.superdocStore.documents.forEach((doc) => {
      doc.rulers = this.config.rulers;
    });
  }

  /**
   * Toggle pagination for SuperEditors
   * @returns {void}
   */
  togglePagination() {
    this.config.pagination = !this.config.pagination;
    this.superdocStore.documents.forEach((doc) => {
      const editor = doc.getEditor();
      if (editor) {
        editor.commands.togglePagination();
      }
    });
  }

  #addToolbar() {
    const moduleConfig = this.config.modules?.toolbar || {};
    this.toolbarElement = this.config.modules?.toolbar?.selector || this.config.toolbar;
    this.toolbar = null;

    const config = {
      selector: this.toolbarElement || null,
      isDev: this.isDev || false,
      toolbarGroups: this.config.modules?.toolbar?.groups || this.config.toolbarGroups,
      role: this.config.role,
      pagination: this.config.pagination,
      icons: this.config.modules?.toolbar?.icons || this.config.toolbarIcons,
      texts: this.config.modules?.toolbar?.texts || this.config.toolbarTexts,
      fonts: this.config.modules?.toolbar?.fonts || null,
      hideButtons: this.config.modules?.toolbar?.hideButtons ?? true,
      responsiveToContainer: this.config.modules?.toolbar?.responsiveToContainer ?? false,
      documentMode: this.config.documentMode,
      superdoc: this,
      aiApiKey: this.config.modules?.ai?.apiKey,
      aiEndpoint: this.config.modules?.ai?.endpoint,
      ...moduleConfig,
    };

    this.toolbar = new SuperToolbar(config);

    this.toolbar.on('superdoc-command', this.onToolbarCommand.bind(this));
    this.once('editorCreate', () => this.toolbar.updateToolbarState());
  }

  /**
   * Add a comments list to the superdoc
   * Requires the comments module to be enabled
   * @param {Element} element The DOM element to render the comments list in
   * @returns {void}
   */
  addCommentsList(element) {
    if (!this.config?.modules?.comments || this.config.role === 'viewer') return;
    this.#log('🦋 [superdoc] Adding comments list to:', element);
    if (element) this.config.modules.comments.element = element;
    this.commentsList = new SuperComments(this.config.modules?.comments, this);
    if (this.config.onCommentsListChange) this.config.onCommentsListChange({ isRendered: true });
  }

  /**
   * Remove the comments list from the superdoc
   * @returns {void}
   */
  removeCommentsList() {
    if (this.commentsList) {
      this.commentsList.close();
      this.commentsList = null;
      if (this.config.onCommentsListChange) this.config.onCommentsListChange({ isRendered: false });
    }
  }

  /**
   * Triggered when a toolbar command is executed
   * @param {Object} param0
   * @param {Object} param0.item The toolbar item that was clicked
   * @param {string} param0.argument The argument passed to the command
   */
  onToolbarCommand({ item, argument }) {
    if (item.command === 'setDocumentMode') {
      this.setDocumentMode(argument);
    } else if (item.command === 'setZoom') {
      this.superdocStore.activeZoom = argument;
    }
  }

  /**
   * Set the document mode.
   * @param {DocumentMode} type
   * @returns {void}
   */
  setDocumentMode(type) {
    if (!type) return;

    type = type.toLowerCase();
    this.config.documentMode = type;

    const types = {
      viewing: () => this.#setModeViewing(),
      editing: () => this.#setModeEditing(),
      suggesting: () => this.#setModeSuggesting(),
    };

    if (types[type]) types[type]();
  }

  #setModeEditing() {
    if (this.config.role !== 'editor') return this.#setModeSuggesting();
    if (this.superdocStore.documents.length > 0) {
      const firstEditor = this.superdocStore.documents[0]?.getEditor();
      if (firstEditor) this.setActiveEditor(firstEditor);
    }

    this.superdocStore.documents.forEach((doc) => {
      doc.restoreComments();
      const editor = doc.getEditor();
      if (editor) editor.setDocumentMode('editing');
    });

    if (this.toolbar) {
      this.toolbar.documentMode = 'editing';
      this.toolbar.updateToolbarState();
    }
  }

  #setModeSuggesting() {
    if (!['editor', 'suggester'].includes(this.config.role)) return this.#setModeViewing();
    if (this.superdocStore.documents.length > 0) {
      const firstEditor = this.superdocStore.documents[0]?.getEditor();
      if (firstEditor) this.setActiveEditor(firstEditor);
    }

    this.superdocStore.documents.forEach((doc) => {
      doc.restoreComments();
      const editor = doc.getEditor();
      if (editor) editor.setDocumentMode('suggesting');
    });

    if (this.toolbar) {
      this.toolbar.documentMode = 'suggesting';
      this.toolbar.updateToolbarState();
    }
  }

  #setModeViewing() {
    this.toolbar.activeEditor = null;
    this.superdocStore.documents.forEach((doc) => {
      doc.removeComments();
      const editor = doc.getEditor();
      if (editor) editor.setDocumentMode('viewing');
    });

    if (this.toolbar) {
      this.toolbar.documentMode = 'viewing';
      this.toolbar.updateToolbarState();
    }
  }

  /**
   * Search for text or regex in the active editor
   * @param {string | RegExp} text The text or regex to search for
   * @returns {Object[]} The search results
   */
  search(text) {
    return this.activeEditor?.commands.search(text);
  }

  /**
   * Go to the next search result
   * @param {Object} match The match object
   * @returns {void}
   */
  goToSearchResult(match) {
    return this.activeEditor?.commands.goToSearchResult(match);
  }

  /**
   * Set the document to locked or unlocked
   * @param {boolean} lock
   */
  setLocked(lock = true) {
    this.config.documents.forEach((doc) => {
      const metaMap = doc.ydoc.getMap('meta');
      doc.ydoc.transact(() => {
        metaMap.set('locked', lock);
        metaMap.set('lockedBy', this.user);
      });
    });
  }

  /**
   * Get the HTML content of all editors
   * @returns {Array<string>} The HTML content of all editors
   */
  getHTML(options = {}) {
    const editors = [];
    this.superdocStore.documents.forEach((doc) => {
      const editor = doc.getEditor();
      if (editor) {
        editors.push(editor);
      }
    });

    return editors.map((editor) => editor.getHTML(options));
  }

  /**
   * Lock the current superdoc
   * @param {Boolean} isLocked
   * @param {User} lockedBy The user who locked the superdoc
   */
  lockSuperdoc(isLocked = false, lockedBy) {
    this.isLocked = isLocked;
    this.lockedBy = lockedBy;
    this.#log('🦋 [superdoc] Locking superdoc:', isLocked, lockedBy, '\n\n\n');
    this.emit('locked', { isLocked, lockedBy });
  }

  /**
   * Export the superdoc to a file
   * @param {Object} params
   * @param {string[]} [params.exportType]
   * @param {string} [params.commentsType]
   * @param {string} [params.exportedName]
   * @param {Array} [params.additionalFiles]
   * @param {Array} [params.additionalFileNames]
   * @param {boolean} [params.isFinalDoc]
   * @param {boolean} [params.triggerDownload] Whether to trigger the download of the exported file
   * @returns {Promise<void | Blob>} Returns void if triggerDownload is false, otherwise returns the exported file
   */
  async export({
    exportType = ['docx'],
    commentsType = 'external',
    exportedName,
    additionalFiles = [],
    additionalFileNames = [],
    isFinalDoc = false,
    triggerDownload = true,
    fieldsHighlightColor = null,
  } = {}) {
    // Get the docx files first
    const baseFileName = exportedName ? cleanName(exportedName) : cleanName(this.config.title);
    const docxFiles = await this.exportEditorsToDOCX({ commentsType, isFinalDoc, fieldsHighlightColor });
    const blobsToZip = [...additionalFiles];
    const filenames = [...additionalFileNames];

    // If we are exporting docx files, add them to the zip
    if (exportType.includes('docx')) {
      docxFiles.forEach((blob) => {
        blobsToZip.push(blob);
        filenames.push(`${baseFileName}.docx`);
      });
    }

    // If we only have one blob, just download it. Otherwise, zip them up.
    if (blobsToZip.length === 1) {
      if (triggerDownload) {
        return createDownload(blobsToZip[0], baseFileName, exportType[0]);
      }

      return blobsToZip[0];
    }

    const zip = await createZip(blobsToZip, filenames);

    if (triggerDownload) {
      return createDownload(zip, baseFileName, 'zip');
    }

    return zip;
  }

  /**
   * Export editors to DOCX format.
   * @param {{ commentsType?: string, isFinalDoc?: boolean }} [options]
   * @returns {Promise<Array<Blob>>}
   */
  async exportEditorsToDOCX({ commentsType, isFinalDoc, fieldsHighlightColor } = {}) {
    const comments = [];
    if (commentsType !== 'clean') {
      if (this.commentsStore && typeof this.commentsStore.translateCommentsForExport === 'function') {
        comments.push(...this.commentsStore.translateCommentsForExport());
      }
    }

    const docxPromises = [];
    this.superdocStore.documents.forEach((doc) => {
      const editor = doc.getEditor();
      if (editor) {
        docxPromises.push(editor.exportDocx({ isFinalDoc, comments, commentsType, fieldsHighlightColor }));
      }
    });
    return await Promise.all(docxPromises);
  }

  /**
   * Request an immediate save from all collaboration documents
   * @returns {Promise<void>} Resolves when all documents have saved
   */
  async #triggerCollaborationSaves() {
    this.#log('🦋 [superdoc] Triggering collaboration saves');
    return new Promise((resolve) => {
      this.superdocStore.documents.forEach((doc, index) => {
        this.#log(`Before reset - Doc ${index}: pending = ${this.pendingCollaborationSaves}`);
        this.pendingCollaborationSaves = 0;
        if (doc.ydoc) {
          this.pendingCollaborationSaves++;
          this.#log(`After increment - Doc ${index}: pending = ${this.pendingCollaborationSaves}`);
          const metaMap = doc.ydoc.getMap('meta');
          metaMap.observe((event) => {
            if (event.changes.keys.has('immediate-save-finished')) {
              this.pendingCollaborationSaves--;
              if (this.pendingCollaborationSaves <= 0) {
                resolve();
              }
            }
          });
          metaMap.set('immediate-save', true);
        }
      });
      this.#log(
        `FINAL pending = ${this.pendingCollaborationSaves}, but we have ${this.superdocStore.documents.filter((d) => d.ydoc).length} docs!`,
      );
    });
  }

  /**
   * Save the superdoc if in collaboration mode
   * @returns {Promise<void[]>} Resolves when all documents have saved
   */
  async save() {
    const savePromises = [
      this.#triggerCollaborationSaves(),
      // this.exportEditorsToDOCX(),
    ];

    this.#log('🦋 [superdoc] Saving superdoc');
    const result = await Promise.all(savePromises);
    this.#log('🦋 [superdoc] Save complete:', result);
    return result;
  }

  /**
   * Destroy the superdoc instance
   * @returns {void}
   */
  destroy() {
    if (!this.app) {
      return;
    }

    this.#log('[superdoc] Unmounting app');

    this.config.socket?.cancelWebsocketRetry();
    this.config.socket?.disconnect();
    this.config.socket?.destroy();

    this.ydoc?.destroy();
    this.provider?.disconnect();
    this.provider?.destroy();

    this.config.documents.forEach((doc) => {
      if (doc.provider) {
        doc.provider.disconnect();
        doc.provider.destroy();
      }

      // Destroy the ydoc
      doc.ydoc?.destroy();
    });

    this.superdocStore.reset();

    this.app.unmount();
    this.removeAllListeners();
    delete this.app.config.globalProperties.$config;
    delete this.app.config.globalProperties.$superdoc;
  }

  /**
   * Focus the active editor or the first editor in the superdoc
   * @returns {void}
   */
  focus() {
    if (this.activeEditor) {
      this.activeEditor.focus();
    } else {
      this.superdocStore.documents.find((doc) => {
        const editor = doc.getEditor();
        if (editor) {
          editor.focus();
        }
      });
    }
  }

  /**
   * Set the high contrast mode
   * @param {boolean} isHighContrast
   * @returns {void}
   */
  setHighContrastMode(isHighContrast) {
    if (!this.activeEditor) return;
    this.activeEditor.setHighContrastMode(isHighContrast);
    this.highContrastModeStore.setHighContrastMode(isHighContrast);
  }
}
