import { EventEmitter } from 'eventemitter3';
import { createApp } from 'vue';
import { undoDepth, redoDepth } from 'prosemirror-history';
import { makeDefaultItems } from './defaultItems';
import { getActiveFormatting } from '@core/helpers/getActiveFormatting.js';
import { vClickOutside } from '@harbour-enterprises/common';
import Toolbar from './Toolbar.vue';
import { startImageUpload, getFileOpener } from '../../extensions/image/imageHelpers/index.js';
import { findParentNode } from '@helpers/index.js';
import { toolbarIcons } from './toolbarIcons.js';
import { toolbarTexts } from './toolbarTexts.js';
import { getQuickFormatList } from '@extensions/linked-styles/index.js';
import { getAvailableColorOptions, makeColorOption, renderColorOptions } from './color-dropdown-helpers.js';
import { isInTable } from '@helpers/isInTable.js';
import { useToolbarItem } from '@components/toolbar/use-toolbar-item';
import { yUndoPluginKey } from 'y-prosemirror';

/**
 * @typedef {Object} ToolbarConfig
 * @property {string} [selector] - CSS selector for the toolbar container
 * @property {string[]} [toolbarGroups=['left', 'center', 'right']] - Groups to organize toolbar items
 * @property {string} [role='editor'] - Role of the toolbar ('editor' or 'viewer')
 * @property {boolean} [pagination=false] - Whether pagination is enabled
 * @property {Object} [icons] - Custom icons for toolbar items
 * @property {Object} [texts] - Custom texts for toolbar items
 * @property {string} [mode='docx'] - Editor mode
 * @property {string[]} [excludeItems=[]] - Items to exclude from the toolbar
 * @property {Object} [groups=null] - Custom groups configuration
 * @property {Object} [editor=null] - The editor instance
 * @property {string} [aiApiKey=null] - API key for AI integration
 * @property {string} [aiEndpoint=null] - Endpoint for AI integration
 * @property {ToolbarItem[]} [customButtons=[]] - Custom buttons to add to the toolbar
 */

/**
 * @typedef {Object} ToolbarItem
 * @property {Object} id - The unique ID of the toolbar item
 * @property {string} id.value - The value of the ID
 * @property {Object} name - The name of the toolbar item
 * @property {string} name.value - The value of the name
 * @property {string} type - The type of toolbar item (button, options, separator, dropdown, overflow)
 * @property {Object} group - The group the item belongs to
 * @property {string} group.value - The value of the group
 * @property {string} command - The command to execute
 * @property {string} [noArgumentCommand] - The command to execute when no argument is provided
 * @property {Object} icon - The icon for the item
 * @property {*} icon.value - The value of the icon
 * @property {Object} tooltip - The tooltip for the item
 * @property {*} tooltip.value - The value of the tooltip
 * @property {Object} attributes - Additional attributes for the item
 * @property {Object} attributes.value - The value of the attributes
 * @property {Object} disabled - Whether the item is disabled
 * @property {boolean} disabled.value - The value of disabled
 * @property {Object} active - Whether the item is active
 * @property {boolean} active.value - The value of active
 * @property {Object} expand - Whether the item is expanded
 * @property {boolean} expand.value - The value of expand
 * @property {Object} nestedOptions - Nested options for the item
 * @property {Array} nestedOptions.value - The array of nested options
 * @property {Object} style - Custom style for the item
 * @property {*} style.value - The value of the style
 * @property {Object} isNarrow - Whether the item has narrow styling
 * @property {boolean} isNarrow.value - The value of isNarrow
 * @property {Object} isWide - Whether the item has wide styling
 * @property {boolean} isWide.value - The value of isWide
 * @property {Object} minWidth - Minimum width of the item
 * @property {*} minWidth.value - The value of minWidth
 * @property {Object} argument - The argument to pass to the command
 * @property {*} argument.value - The value of the argument
 * @property {Object} parentItem - The parent of this item if nested
 * @property {*} parentItem.value - The value of parentItem
 * @property {Object} childItem - The child of this item if it has one
 * @property {*} childItem.value - The value of childItem
 * @property {Object} iconColor - The color of the icon
 * @property {*} iconColor.value - The value of iconColor
 * @property {Object} hasCaret - Whether the item has a dropdown caret
 * @property {boolean} hasCaret.value - The value of hasCaret
 * @property {Object} dropdownStyles - Custom styles for dropdown
 * @property {*} dropdownStyles.value - The value of dropdownStyles
 * @property {Object} tooltipVisible - Whether the tooltip is visible
 * @property {boolean} tooltipVisible.value - The value of tooltipVisible
 * @property {Object} tooltipTimeout - Timeout for the tooltip
 * @property {*} tooltipTimeout.value - The value of tooltipTimeout
 * @property {Object} defaultLabel - The default label for the item
 * @property {*} defaultLabel.value - The value of the default label
 * @property {Object} label - The label for the item
 * @property {*} label.value - The value of the label
 * @property {Object} hideLabel - Whether to hide the label
 * @property {boolean} hideLabel.value - The value of hideLabel
 * @property {Object} inlineTextInputVisible - Whether inline text input is visible
 * @property {boolean} inlineTextInputVisible.value - The value of inlineTextInputVisible
 * @property {Object} hasInlineTextInput - Whether the item has inline text input
 * @property {boolean} hasInlineTextInput.value - The value of hasInlineTextInput
 * @property {Object} markName - The name of the mark
 * @property {*} markName.value - The value of markName
 * @property {Object} labelAttr - The attribute for the label
 * @property {*} labelAttr.value - The value of labelAttr
 * @property {Object} allowWithoutEditor - Whether the item can be used without an editor
 * @property {boolean} allowWithoutEditor.value - The value of allowWithoutEditor
 * @property {Object} dropdownValueKey - The key for dropdown value
 * @property {*} dropdownValueKey.value - The value of dropdownValueKey
 * @property {Object} selectedValue - The selected value for the item
 * @property {*} selectedValue.value - The value of the selected value
 * @property {Object} inputRef - Reference to an input element
 * @property {*} inputRef.value - The value of inputRef
 * @property {Function} unref - Function to get unreferenced values
 * @property {Function} activate - Function to activate the item
 * @property {Function} deactivate - Function to deactivate the item
 * @property {Function} setDisabled - Function to set the disabled state
 * @property {Function} resetDisabled - Function to reset the disabled state
 * @property {Function} onActivate - Function called when the item is activated
 * @property {Function} onDeactivate - Function called when the item is deactivated
 */

/**
 * @typedef {Object} CommandItem
 * @property {ToolbarItem} item - The toolbar item
 * @property {*} [argument] - The argument to pass to the command
 */

/**
 * A customizable toolbar for the Super Editor
 * @class
 * @extends EventEmitter
 */
export class SuperToolbar extends EventEmitter {
  /**
   * Default configuration for the toolbar
   * @type {ToolbarConfig}
   */
  config = {
    selector: null,
    toolbarGroups: ['left', 'center', 'right'],
    role: 'editor',
    pagination: false,
    icons: { ...toolbarIcons },
    texts: { ...toolbarTexts },
    fonts: null,
    hideButtons: true,
    responsiveToContainer: false,
    mode: 'docx',
    excludeItems: [],
    groups: null,
    editor: null,
    aiApiKey: null,
    aiEndpoint: null,
    customButtons: [],
  };

  /**
   * Creates a new SuperToolbar instance
   * @param {ToolbarConfig} config - The configuration for the toolbar
   * @returns {void}
   */
  constructor(config) {
    super();

    this.config = { ...this.config, ...config };
    this.toolbarItems = [];
    this.overflowItems = [];
    this.documentMode = config.documentMode || 'editing';
    this.isDev = config.isDev || false;
    this.superdoc = config.superdoc;
    this.role = config.role || 'editor';
    this.toolbarContainer = null;

    if (this.config.editor) {
      this.config.mode = this.config.editor.options.mode;
    }

    this.config.icons = {
      ...toolbarIcons,
      ...config.icons,
    };

    this.config.texts = {
      ...toolbarTexts,
      ...config.texts,
    };

    this.config.hideButtons = config.hideButtons ?? true;
    this.config.responsiveToContainer = config.responsiveToContainer ?? false;

    // Move legacy 'element' to 'selector'
    if (!this.config.selector && this.config.element) {
      this.config.selector = this.config.element;
    }

    this.toolbarContainer = this.findElementBySelector(this.config.selector);
    this.#initToolbarGroups();
    this.#makeToolbarItems({
      superToolbar: this,
      icons: this.config.icons,
      texts: this.config.texts,
      fonts: this.config.fonts,
      hideButtons: this.config.hideButtons,
      isDev: config.isDev,
    });

    if (this.config.selector && !this.toolbarContainer) {
      return;
    }

    this.app = createApp(Toolbar);
    this.app.directive('click-outside', vClickOutside);
    this.app.config.globalProperties.$toolbar = this;
    if (this.toolbarContainer) {
      this.toolbar = this.app.mount(this.toolbarContainer);
    }
    this.activeEditor = config.editor || null;
    this.updateToolbarState();
  }

  findElementBySelector(selector) {
    let el = null;

    if (selector) {
      if (selector.startsWith('#') || selector.startsWith('.')) {
        el = document.querySelector(selector);
      } else {
        el = document.getElementById(selector);
      }

      if (!el) {
        return null;
      }
    }

    return el;
  }

  /**
   * Initiate toolbar groups
   * @private
   * @returns {void}
   */
  #initToolbarGroups() {
    // If groups is configured, override toolbarGroups
    if (this.config.groups && !Array.isArray(this.config.groups) && Object.keys(this.config.groups).length) {
      this.config.toolbarGroups = Object.keys(this.config.groups);
    }
  }

  /**
   * Custom commands that override default behavior
   * @private
   * @type {Object.<string, function(CommandItem): void>}
   */
  #interceptedCommands = {
    /**
     * Handles zoom level changes
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string|number} params.argument - The zoom level (percentage)
     * @returns {void}
     */
    setZoom: ({ item, argument }) => {
      // Currently only set up to work with full SuperDoc
      if (!argument) return;
      item.onActivate({ zoom: argument });

      this.emit('superdoc-command', { item, argument });
      const layers = document.querySelector(this.superdoc.config.selector)?.querySelector('.layers');
      if (!layers) return;

      const isMobileDevice = typeof screen.orientation !== 'undefined';
      // 768px breakpoint doesn't consider iPad in portrait orientation
      const isSmallScreen = window.matchMedia('(max-width: 834px)').matches;

      // Zoom property doesn't work correctly when testing on mobile devices
      if (isMobileDevice && isSmallScreen) {
        layers.style.transformOrigin = '0 0';
        layers.style.transform = `scale(${parseInt(argument) / 100})`;
      } else {
        layers.style.zoom = parseInt(argument) / 100;
      }

      this.superdoc.superdocStore.activeZoom = parseInt(argument);
    },

    /**
     * Sets the document mode
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string} params.argument - The document mode to set
     * @returns {void}
     */
    setDocumentMode: ({ item, argument }) => {
      if (!argument) return;

      this.emit('superdoc-command', { item, argument });
    },

    /**
     * Sets the font size for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string|number} params.argument - The font size to set
     * @returns {void}
     */
    setFontSize: ({ item, argument }) => {
      this.#runCommandWithArgumentOnly({ item, argument }, () => {
        this.activeEditor?.commands.setFieldAnnotationsFontSize(argument, true);
      });
    },

    /**
     * Sets the font family for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string} params.argument - The font family to set
     * @returns {void}
     */
    setFontFamily: ({ item, argument }) => {
      this.#runCommandWithArgumentOnly({ item, argument }, () => {
        this.activeEditor?.commands.setFieldAnnotationsFontFamily(argument, true);
      });
    },

    /**
     * Sets the text color
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string} params.argument - The color to set
     * @returns {void}
     */
    setColor: ({ item, argument }) => {
      this.#runCommandWithArgumentOnly({ item, argument }, () => {
        this.activeEditor?.commands.setFieldAnnotationsTextColor(argument, true);
      });
    },

    /**
     * Sets the highlight color for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {string} params.argument - The highlight color to set
     * @returns {void}
     */
    setHighlight: ({ item, argument }) => {
      this.#runCommandWithArgumentOnly({ item, argument, noArgumentCallback: true }, () => {
        let arg = argument !== 'none' ? argument : null;
        this.activeEditor?.commands.setFieldAnnotationsTextHighlight(arg, true);
        this.activeEditor?.commands.setCellBackground(arg);
      });
    },

    /**
     * Toggles the ruler visibility
     * @returns {void}
     */
    toggleRuler: () => {
      this.superdoc.toggleRuler();
    },

    /**
     * Initiates the image upload process
     * @async
     * @returns {Promise<void>}
     */
    startImageUpload: async () => {
      let open = getFileOpener();
      let result = await open();

      if (!result?.file) {
        return;
      }

      startImageUpload({
        editor: this.activeEditor,
        view: this.activeEditor.view,
        file: result.file,
      });
    },

    /**
     * Increases text indentation or list level
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {void}
     */
    increaseTextIndent: ({ item, argument }) => {
      let command = item.command;
      let { state } = this.activeEditor;
      let listItem = findParentNode((node) => node.type.name === 'listItem')(state.selection);

      if (listItem) {
        return this.activeEditor.commands.increaseListIndent();
      }

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
      }
    },

    /**
     * Decreases text indentation or list level
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {boolean}
     */
    decreaseTextIndent: ({ item, argument }) => {
      let command = item.command;
      let { state } = this.activeEditor;
      let listItem = findParentNode((node) => node.type.name === 'listItem')(state.selection);

      if (listItem) {
        return this.activeEditor.commands.decreaseListIndent();
      }

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
      }
    },

    /**
     * Toggles bold formatting for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {void}
     */
    toggleBold: ({ item, argument }) => {
      let command = item.command;

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
        this.activeEditor.commands.toggleFieldAnnotationsFormat('bold', true);
      }

      this.updateToolbarState();
    },

    /**
     * Toggles italic formatting for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {void}
     */
    toggleItalic: ({ item, argument }) => {
      let command = item.command;

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
        this.activeEditor.commands.toggleFieldAnnotationsFormat('italic', true);
      }

      this.updateToolbarState();
    },

    /**
     * Toggles underline formatting for text
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {void}
     */
    toggleUnderline: ({ item, argument }) => {
      let command = item.command;

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
        this.activeEditor.commands.toggleFieldAnnotationsFormat('underline', true);
      }

      this.updateToolbarState();
    },

    /**
     * Toggles link formatting and updates cursor position
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {*} params.argument - Command arguments
     * @returns {void}
     */
    toggleLink: ({ item, argument }) => {
      let command = item.command;

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);

        // move cursor to end
        const { view } = this.activeEditor;
        let { selection } = view.state;
        if (this.activeEditor.options.isHeaderOrFooter) {
          selection = this.activeEditor.options.lastSelection;
        }
        const endPos = selection.$to.pos;

        const newSelection = new TextSelection(view.state.doc.resolve(endPos));
        const tr = view.state.tr.setSelection(newSelection);
        const state = view.state.apply(tr);
        view.updateState(state);

        if (!this.activeEditor.options.isHeaderOrFooter) {
          setTimeout(() => {
            view.focus();
          }, 100);
        }
      }
      this.updateToolbarState();
    },

    /**
     * Inserts a table into the document
     * @param {Object} params - Command parameters
     * @param {CommandItem} params.item - The command item
     * @param {Object} params.argument - Table configuration
     * @returns {void}
     */
    insertTable: ({ item, argument }) => {
      this.#runCommandWithArgumentOnly({ item, argument });
    },

    /**
     * Executes a table-related command
     * @param {Object} params - Command parameters
     * @param {Object} params.argument - The table command and its parameters
     * @param {string} params.argument.command - The specific table command to execute
     * @returns {void}
     */
    executeTableCommand: ({ argument }) => {
      if (!argument) return;

      let command = argument.command;

      if (command in this.activeEditor.commands) {
        this.activeEditor.commands[command](argument);
      }

      this.updateToolbarState();
    },
  };

  /**
   * Log debug information to the console
   * @param {...*} args - Arguments to log
   * @returns {void}
   */
  log(...args) {
    console.debug('[🎨 super-toolbar]', ...args);
  }

  /**
   * Set the zoom level
   * @param {number} percent_int - The zoom percentage as an integer
   * @returns {void}
   */
  setZoom(percent_int) {
    const allItems = [...this.toolbarItems, ...this.overflowItems];
    const item = allItems.find((item) => item.name.value === 'zoom');
    this.#interceptedCommands.setZoom({ item, argument: percent_int });
  }

  /**
   * The toolbar expects an active Super Editor instance.
   * @param {Object} editor - The editor instance to attach to the toolbar
   * @returns {void}
   */
  setActiveEditor(editor) {
    this.activeEditor = editor;
    this.activeEditor.on('transaction', this.onEditorTransaction.bind(this));
  }

  /**
   * Get toolbar items by group name
   * @param {string} groupName - The name of the group
   * @returns {ToolbarItem[]} An array of toolbar items in the specified group
   */
  getToolbarItemByGroup(groupName) {
    return this.toolbarItems.filter((item) => (item.group?.value || 'center') === groupName);
  }

  /**
   * Get a toolbar item by name
   * @param {string} name - The name of the toolbar item
   * @returns {ToolbarItem|undefined} The toolbar item with the specified name or undefined if not found
   */
  getToolbarItemByName(name) {
    return this.toolbarItems.find((item) => item.name.value === name);
  }

  /**
   * Create toolbar items based on configuration
   * @private
   * @param {SuperToolbar} options.superToolbar - The toolbar instance
   * @param {Object} options.icons - Icons to use for toolbar items
   * @param {Object} options.texts - Texts to use for toolbar items
   * @param {Array} options.fonts - Fonts for the toolbar item
   * @param {boolean} options.isDev - Whether in development mode
   * @returns {void}
   */
  #makeToolbarItems({ superToolbar, icons, texts, fonts, hideButtons, isDev = false } = {}) {
    const documentWidth = document.documentElement.clientWidth; // take into account the scrollbar
    const containerWidth = this.toolbarContainer?.offsetWidth ?? 0;
    const availableWidth = this.config.responsiveToContainer ? containerWidth : documentWidth;

    const { defaultItems, overflowItems } = makeDefaultItems({
      superToolbar,
      toolbarIcons: icons,
      toolbarTexts: texts,
      toolbarFonts: fonts,
      hideButtons,
      availableWidth,
      role: this.role,
      isDev,
    });

    const customItems = this.config.customButtons || [];
    if (customItems.length) {
      defaultItems.push(...customItems.map((item) => useToolbarItem({ ...item })));
    }

    let allConfigItems = [
      ...defaultItems.map((item) => item.name.value),
      ...overflowItems.map((item) => item.name.value),
    ];
    if (this.config.groups) allConfigItems = Object.values(this.config.groups).flatMap((item) => item);

    const filteredItems = defaultItems
      .filter((item) => allConfigItems.includes(item.name.value))
      .filter((item) => !this.config.excludeItems.includes(item.name.value));

    this.toolbarItems = filteredItems;
    this.overflowItems = overflowItems.filter((item) => allConfigItems.includes(item.name.value));
  }

  /**
   * Initialize default fonts from the editor
   * @private
   * @returns {void}
   */
  #initDefaultFonts() {
    if (!this.activeEditor || !this.activeEditor.converter) return;
    const { typeface = 'Arial', fontSizePt = 12 } = this.activeEditor.converter.getDocumentDefaultStyles() ?? {};
    const fontSizeItem = this.toolbarItems.find((item) => item.name.value === 'fontSize');
    if (fontSizeItem) fontSizeItem.defaultLabel.value = fontSizePt;

    const fontFamilyItem = this.toolbarItems.find((item) => item.name.value === 'fontFamily');
    if (fontFamilyItem) fontFamilyItem.defaultLabel.value = typeface;
  }

  /**
   * Update highlight color options based on document colors
   * @private
   * @returns {void}
   */
  #updateHighlightColors() {
    if (!this.activeEditor || !this.activeEditor.converter) return;
    if (!this.activeEditor.converter.docHiglightColors.size) return;

    const highlightItem = this.toolbarItems.find((item) => item.name.value === 'highlight');
    if (!highlightItem) return;

    const pickerColorOptions = getAvailableColorOptions();
    const perChunk = 7; // items per chunk

    const result = Array.from(this.activeEditor.converter.docHiglightColors).reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / perChunk);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }

      if (!pickerColorOptions.includes(item)) resultArray[chunkIndex].push(makeColorOption(item));
      return resultArray;
    }, []);

    const option = {
      key: 'color',
      type: 'render',
      render: () => renderColorOptions(this, highlightItem, result, true),
    };

    highlightItem.nestedOptions.value = [option];
  }

  /**
   * Update the toolbar state based on the current editor state
   * Updates active/inactive state of all toolbar items
   * @returns {void}
   */
  updateToolbarState() {
    this.#updateToolbarHistory();
    this.#initDefaultFonts();
    this.#updateHighlightColors();

    // Deactivate toolbar items if no active editor
    // This will skip buttons that are marked as allowWithoutEditor
    if (!this.activeEditor || this.documentMode === 'viewing') {
      this.#deactivateAll();
      return;
    }

    const marks = getActiveFormatting(this.activeEditor);
    const inTable = isInTable(this.activeEditor.state);

    this.toolbarItems.forEach((item) => {
      item.resetDisabled();

      // Linked Styles dropdown behaves a bit different from other buttons.
      // We need to disable it manually if there are no linked styles to show
      if (item.name.value === 'linkedStyles') {
        if (this.activeEditor && !getQuickFormatList(this.activeEditor).length) {
          return item.deactivate();
        } else {
          return item.activate();
        }
      }

      const activeMark = marks.find((mark) => mark.name === item.name.value);
      if (activeMark) {
        item.activate(activeMark.attrs);
      } else {
        item.deactivate();
      }

      // Activate toolbar items based on linked styles (if there's no active mark to avoid overriding  it)
      const styleIdMark = marks.find((mark) => mark.name === 'styleId');
      if (!activeMark && styleIdMark?.attrs.styleId) {
        const markToStyleMap = {
          fontSize: 'font-size',
          fontFamily: 'font-family',
          bold: 'bold',
          textAlign: 'textAlign',
        };
        const linkedStyles = this.activeEditor.converter?.linkedStyles.find(
          (style) => style.id === styleIdMark.attrs.styleId,
        );
        if (
          linkedStyles &&
          linkedStyles.definition &&
          linkedStyles.definition.styles &&
          markToStyleMap[item.name.value] in linkedStyles.definition.styles
        ) {
          const linkedStylesItem = linkedStyles.definition.styles[markToStyleMap[item.name.value]];
          const value = {
            [item.name.value]: linkedStylesItem,
          };
          item.activate(value);
        }
      }

      const spacingAttr = marks.find((mark) => mark.name === 'spacing');
      if (item.name.value === 'lineHeight' && (activeMark?.attrs?.lineHeight || spacingAttr)) {
        item.selectedValue.value = activeMark?.attrs?.lineHeight || spacingAttr.attrs?.spacing?.line || '';
      }

      if (item.name.value === 'tableActions') {
        item.disabled.value = !inTable;
      }

      // Activate list buttons when selections is inside list
      const listNumberingType = marks.find((mark) => mark.name === 'listNumberingType')?.attrs?.listNumberingType;
      if (item.name.value === 'list' && listNumberingType === 'bullet') {
        item.activate();
      } else if (item.name.value === 'numberedlist' && listNumberingType && listNumberingType !== 'bullet') {
        item.activate();
      }
    });
  }

  /**
   * Handler for toolbar resize events
   * @returns {void}
   */
  onToolbarResize = () => {
    this.#makeToolbarItems({
      superToolbar: this,
      icons: this.config.icons,
      texts: this.config.texts,
      fonts: this.config.fonts,
      hideButtons: this.config.hideButtons,
      isDev: this.isDev,
    });

    if (this.role === 'viewer') {
      this.#deactivateAll();
    }
  };

  /**
   * Deactivate all toolbar items
   * @private
   * @returns {void}
   */
  #deactivateAll() {
    this.activeEditor = null;
    this.toolbarItems.forEach((item) => {
      const { allowWithoutEditor } = item;
      if (allowWithoutEditor.value) return;
      item.setDisabled(true);
    });
  }

  /**
   * Update undo/redo history state in the toolbar
   * @private
   * @returns {void}
   */
  #updateToolbarHistory() {
    if (!this.activeEditor) return;

    if (this.activeEditor.options.ydoc) {
      const undoManager = yUndoPluginKey.getState(this.activeEditor.state)?.undoManager;
      this.undoDepth = undoManager?.undoStack.length || 0;
      this.redoDepth = undoManager?.redoStack.length || 0;
    } else {
      this.undoDepth = undoDepth(this.activeEditor.state);
      this.redoDepth = redoDepth(this.activeEditor.state);
    }
  }

  /**
   * React to editor transactions. Might want to debounce this.
   * @param {Object} params - Transaction parameters
   * @param {Object} params.transaction - The transaction object
   * @returns {void}
   */
  onEditorTransaction({ transaction }) {
    if (!transaction.docChanged && !transaction.selectionSet) return;
    this.updateToolbarState();
  }

  /**
   * Main handler for toolbar commands
   * @param {CommandItem} params - Command parameters
   * @param {ToolbarItem} params.item - An instance of the useToolbarItem composable
   * @param {*} [params.argument] - The argument passed to the command
   * @returns {*} The result of the executed command, undefined if no result is returned
   */
  emitCommand({ item, argument, option }) {
    if (this.activeEditor && !this.activeEditor.options.isHeaderOrFooter) {
      this.activeEditor.focus();
    }

    const { command } = item;

    if (!command) {
      return;
    }

    this.log('(emmitCommand) Command:', command, '\n\titem:', item, '\n\targument:', argument, '\n\toption:', option);

    // Check if we have a custom or overloaded command defined
    if (command in this.#interceptedCommands) {
      return this.#interceptedCommands[command]({ item, argument });
    }

    if (this.activeEditor && this.activeEditor.commands && command in this.activeEditor.commands) {
      this.activeEditor.commands[command](argument);
    }

    // If the command is a function, call it with the argument
    else if (typeof command === 'function') {
      command({ item, argument, option });
    }

    // If we don't know what to do with this command, throw an error
    else {
      throw new Error(`[super-toolbar 🎨] Command not found: ${command}`);
    }

    this.updateToolbarState();
  }

  /**
   * Run a command that requires an argument
   * @private
   * @param {CommandItem} params - Command parameters
   * @param {ToolbarItem} params.item - The toolbar item
   * @param {*} params.argument - The argument for the command
   * @param {boolean} params.noArgumentCallback - Whether to call callback even if argument === 'none'
   * @param {Function} [callback] - Optional callback to run after the command
   * @returns {void}
   */
  #runCommandWithArgumentOnly({ item, argument, noArgumentCallback = false }, callback) {
    if (!argument || !this.activeEditor) return;

    let command = item.command;
    const noArgumentCommand = item.noArgumentCommand;

    if (
      argument === 'none' &&
      this.activeEditor &&
      this.activeEditor.commands &&
      noArgumentCommand in this.activeEditor.commands
    ) {
      this.activeEditor.commands[noArgumentCommand]();
      if (typeof callback === 'function' && noArgumentCallback) callback(argument);
      this.updateToolbarState();
      return;
    }

    if (this.activeEditor && this.activeEditor.commands && command in this.activeEditor.commands) {
      this.activeEditor.commands[command](argument);
      if (typeof callback === 'function') callback(argument);
      this.updateToolbarState();
    }
  }
}
