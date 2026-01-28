import { undoDepth, redoDepth } from 'prosemirror-history';
import { h, ref } from 'vue';

import { sanitizeNumber } from './helpers';
import { useToolbarItem } from './use-toolbar-item';
import AIWriter from './AIWriter.vue';
import AlignmentButtons from './AlignmentButtons.vue';
import DocumentMode from './DocumentMode.vue';
import LinkedStyle from './LinkedStyle.vue';
import LinkInput from './LinkInput.vue';
import { renderColorOptions } from './color-dropdown-helpers.js';
import TableGrid from './TableGrid.vue';
import TableActions from './TableActions.vue';
import { scrollToElement } from './scroll-helpers.js';

import checkIconSvg from '@harbour-enterprises/common/icons/check.svg?raw';
import SearchInput from './SearchInput.vue';
import { TOOLBAR_FONTS } from './constants.js';

const closeDropdown = (dropdown) => {
  dropdown.expand.value = false;
};

export const makeDefaultItems = ({
  superToolbar,
  toolbarIcons,
  toolbarTexts,
  toolbarFonts,
  hideButtons,
  availableWidth,
  role,
  isDev = false,
} = {}) => {
  // bold
  const bold = useToolbarItem({
    type: 'button',
    name: 'bold',
    command: 'toggleBold',
    icon: toolbarIcons.bold,
    tooltip: toolbarTexts.bold,
    attributes: {
      ariaLabel: 'Bold',
    },
  });

  // font
  const fontButton = useToolbarItem({
    type: 'dropdown',
    name: 'fontFamily',
    tooltip: toolbarTexts.fontFamily,
    command: 'setFontFamily',
    defaultLabel: 'Arial',
    label: 'Arial',
    markName: 'textStyle',
    labelAttr: 'fontFamily',
    hasCaret: true,
    isWide: true,
    style: { width: '116px' },
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'Font family',
    },
    options: [...(toolbarFonts ? toolbarFonts : TOOLBAR_FONTS)],
    onActivate: ({ fontFamily }) => {
      if (!fontFamily) return;
      fontButton.label.value = fontFamily;
    },
    onDeactivate: () => (fontButton.label.value = fontButton.defaultLabel.value),
  });

  // ai button
  const aiButton = useToolbarItem({
    type: 'dropdown',
    dropdownStyles: {
      padding: 0,
      outline: 'none',
    },
    name: 'ai',
    tooltip: toolbarTexts.ai,
    icon: toolbarIcons.ai,
    hideLabel: true,
    hasCaret: false,
    isWide: true,
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'AI',
    },
    options: [
      {
        type: 'render',
        key: 'ai',
        render: () => {
          let selectedText = '';

          if (superToolbar.activeEditor) {
            const { state } = superToolbar.activeEditor;
            const { from, to, empty } = state.selection;
            selectedText = !empty ? state.doc.textBetween(from, to) : '';
          }

          const handleClose = () => {
            closeDropdown(aiButton);
          };

          return h('div', {}, [
            h(AIWriter, {
              handleClose,
              selectedText,
              editor: superToolbar.activeEditor,
              apiKey: superToolbar.config.aiApiKey,
              endpoint: superToolbar.config.aiEndpoint,
              superToolbar: superToolbar,
            }),
          ]);
        },
      },
    ],
  });

  // font size
  const fontSize = useToolbarItem({
    type: 'dropdown',
    name: 'fontSize',
    defaultLabel: '12',
    label: '12',
    minWidth: '50px',
    markName: 'textStyle',
    labelAttr: 'fontSize',
    tooltip: toolbarTexts.fontSize,
    hasCaret: true,
    hasInlineTextInput: true,
    inlineTextInputVisible: true,
    suppressActiveHighlight: true,
    isWide: true,
    command: 'setFontSize',
    attributes: {
      ariaLabel: 'Font size',
    },
    options: [
      { label: '8', key: '8pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '9', key: '9pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '10', key: '10pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '11', key: '11pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '12', key: '12pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '14', key: '14pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '18', key: '18pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '24', key: '24pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '30', key: '30pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '36', key: '36pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '48', key: '48pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '60', key: '60pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '72', key: '72pt', props: { 'data-item': 'btn-fontSize-option' } },
      { label: '96', key: '96pt', props: { 'data-item': 'btn-fontSize-option' } },
    ],
    onActivate: ({ fontSize: size }) => {
      if (!size) return (fontSize.label.value = fontSize.defaultLabel.value);

      let sanitizedValue = sanitizeNumber(size, 12);
      if (sanitizedValue < 8) sanitizedValue = 8;
      if (sanitizedValue > 96) sanitizedValue = 96;

      // no units
      fontSize.label.value = String(sanitizedValue);
    },
    onDeactivate: () => (fontSize.label.value = fontSize.defaultLabel.value),
  });

  // separator
  const separator = useToolbarItem({
    type: 'separator',
    name: 'separator',
    isNarrow: true,
  });

  // italic
  const italic = useToolbarItem({
    type: 'button',
    name: 'italic',
    command: 'toggleItalic',
    icon: toolbarIcons.italic,
    active: false,
    tooltip: toolbarTexts.italic,
    attributes: {
      ariaLabel: 'Italic',
    },
  });

  // underline
  const underline = useToolbarItem({
    type: 'button',
    name: 'underline',
    command: 'toggleUnderline',
    icon: toolbarIcons.underline,
    active: false,
    tooltip: toolbarTexts.underline,
    attributes: {
      ariaLabel: 'Underline',
    },
  });

  const strikethrough = useToolbarItem({
    type: 'button',
    name: 'strike',
    command: 'toggleStrike',
    icon: toolbarIcons.strikethrough,
    active: false,
    tooltip: toolbarTexts.strikethrough,
    attributes: {
      ariaLabel: 'Strikethrough',
    },
  });

  // highlight
  const highlight = useToolbarItem({
    type: 'dropdown',
    name: 'highlight',
    icon: toolbarIcons.highlight,
    hideLabel: true,
    markName: 'highlight',
    labelAttr: 'color',
    active: false,
    tooltip: toolbarTexts.highlight,
    command: 'setHighlight',
    noArgumentCommand: 'unsetHighlight',
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'Highlight',
    },
    options: [
      {
        key: 'color',
        type: 'render',
        render: () => renderColorOptions(superToolbar, highlight, [], true),
      },
    ],
    onActivate: ({ color }) => {
      highlight.iconColor.value = color || '';
    },
    onDeactivate: () => (highlight.iconColor.value = ''),
  });

  // color
  const colorButton = useToolbarItem({
    type: 'dropdown',
    name: 'color',
    icon: toolbarIcons.color,
    hideLabel: true,
    markName: 'textStyle',
    labelAttr: 'color',
    active: false,
    tooltip: toolbarTexts.color,
    command: 'setColor',
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'Color',
    },
    options: [
      {
        key: 'color',
        type: 'render',
        render: () => renderColorOptions(superToolbar, colorButton),
      },
    ],
    onActivate: ({ color }) => {
      colorButton.iconColor.value = color;
    },
    onDeactivate: () => (colorButton.iconColor.value = '#000'),
  });

  // search
  const searchRef = ref(null);
  const search = useToolbarItem({
    type: 'dropdown',
    name: 'search',
    active: false,
    icon: toolbarIcons.search,
    tooltip: toolbarTexts.search,
    group: 'right',
    inputRef: searchRef,
    attributes: {
      ariaLabel: 'Search',
    },
    options: [
      {
        type: 'render',
        key: 'searchDropdown',
        render: () => renderSearchDropdown(),
      },
    ],
  });

  const renderSearchDropdown = () => {
    const handleSubmit = ({ value }) => {
      superToolbar.activeEditor.commands.search(value);
    };

    return h('div', {}, [
      h(SearchInput, {
        onSubmit: handleSubmit,
        searchRef,
      }),
    ]);
  };

  // link
  const link = useToolbarItem({
    type: 'dropdown',
    name: 'link',
    markName: 'link',
    icon: toolbarIcons.link,
    active: false,
    tooltip: toolbarTexts.link,
    attributes: {
      ariaLabel: 'Link dropdown',
    },
    options: [
      {
        type: 'render',
        key: 'linkDropdown',
        render: () => renderLinkDropdown(link),
      },
    ],
    onActivate: ({ href }) => {
      if (href) link.attributes.value = { href };
      else link.attributes.value = {};
    },
    onDeactivate: () => {
      link.attributes.value = {};
      link.expand.value = false;
    },
  });

  function renderLinkDropdown(link) {
    return h('div', {}, [
      h(LinkInput, {
        editor: superToolbar.activeEditor,
        closePopover: () => closeDropdown(link),
        goToAnchor: () => {
          closeDropdown(link);
          if (!superToolbar.activeEditor || !link.attributes.value?.href) return;
          const anchorName = link.attributes.value?.href?.slice(1);
          const container = superToolbar.activeEditor.element;
          const anchor = container.querySelector(`a[name='${anchorName}']`);
          if (anchor) scrollToElement(anchor);
        },
      }),
    ]);
  }

  const linkInput = useToolbarItem({
    type: 'options',
    name: 'linkInput',
    command: 'toggleLink',
    active: false,
  });
  link.childItem = linkInput;
  linkInput.parentItem = link;

  // image
  const image = useToolbarItem({
    type: 'button',
    name: 'image',
    command: 'startImageUpload',
    icon: toolbarIcons.image,
    active: false,
    tooltip: toolbarTexts.image,
    disabled: false,
    attributes: {
      ariaLabel: 'Image',
    },
  });

  // table
  const tableItem = useToolbarItem({
    type: 'dropdown',
    name: 'table',
    icon: toolbarIcons.table,
    hideLabel: true,
    labelAttr: 'table',
    active: false,
    tooltip: toolbarTexts.table,
    command: 'insertTable',
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'Table',
    },
    options: [
      {
        key: 'table',
        type: 'render',
        render: () => renderTableGrid(tableItem),
      },
    ],
  });

  function renderTableGrid(tableItem) {
    const handleSelect = (e) => {
      superToolbar.emitCommand({ item: tableItem, argument: e });
      closeDropdown(tableItem);
    };

    return h('div', {}, [
      h(TableGrid, {
        onSelect: handleSelect,
      }),
    ]);
  }

  // table actions
  const tableActionsItem = useToolbarItem({
    type: 'dropdown',
    name: 'tableActions',
    command: 'executeTableCommand',
    icon: toolbarIcons.tableActions,
    hideLabel: true,
    disabled: true,
    attributes: {
      ariaLabel: 'Table actions',
    },
    options: [
      {
        type: 'render',
        render: () => renderTableActions(tableActionsItem),
      },
    ],
  });

  const tableActionsOptions = [
    {
      label: toolbarTexts.addRowBefore,
      command: 'addRowBefore',
      icon: toolbarIcons.addRowBefore,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Add row before',
      },
    },
    {
      label: toolbarTexts.addRowAfter,
      command: 'addRowAfter',
      icon: toolbarIcons.addRowAfter,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Add row after',
      },
    },
    {
      label: toolbarTexts.addColumnBefore,
      command: 'addColumnBefore',
      icon: toolbarIcons.addColumnBefore,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Add column before',
      },
    },
    {
      label: toolbarTexts.addColumnAfter,
      command: 'addColumnAfter',
      icon: toolbarIcons.addColumnAfter,
      bottomBorder: true,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Add column after',
      },
    },
    {
      label: toolbarTexts.deleteRow,
      command: 'deleteRow',
      icon: toolbarIcons.deleteRow,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Delete row',
      },
    },
    {
      label: toolbarTexts.deleteColumn,
      command: 'deleteColumn',
      icon: toolbarIcons.deleteColumn,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Delete column',
      },
    },
    {
      label: toolbarTexts.deleteTable,
      command: 'deleteTable',
      icon: toolbarIcons.deleteTable,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Delete table',
      },
    },
    {
      label: toolbarTexts.transparentBorders,
      command: 'deleteCellAndTableBorders',
      icon: toolbarIcons.deleteBorders,
      bottomBorder: true,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Delete cell and table borders',
      },
    },
    {
      label: toolbarTexts.mergeCells,
      command: 'mergeCells',
      icon: toolbarIcons.mergeCells,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Merge cells',
      },
    },
    {
      label: toolbarTexts.splitCell,
      command: 'splitCell',
      icon: toolbarIcons.splitCell,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Split cells',
      },
    },
    {
      label: toolbarTexts.fixTables,
      command: 'fixTables',
      icon: toolbarIcons.fixTables,
      props: {
        'data-item': 'btn-tableActions-option',
        ariaLabel: 'Fix tables',
      },
    },
  ];

  function renderTableActions(tableActionsItem) {
    return h(TableActions, {
      options: tableActionsOptions,
      onSelect: (event) => {
        closeDropdown(tableActionsItem);
        const { command } = event;
        superToolbar.emitCommand({ item: tableActionsItem, argument: { command } });
      },
    });
  }

  // alignment
  const alignment = useToolbarItem({
    type: 'dropdown',
    name: 'textAlign',
    tooltip: toolbarTexts.textAlign,
    icon: toolbarIcons.alignLeft,
    command: 'setTextAlign',
    hasCaret: true,
    markName: 'textAlign',
    labelAttr: 'textAlign',
    suppressActiveHighlight: true,
    attributes: {
      ariaLabel: 'Text align',
    },
    options: [
      {
        type: 'render',
        render: () => {
          const handleSelect = (e) => {
            closeDropdown(alignment);
            const buttonWithCommand = { ...alignment, command: 'setTextAlign' };
            buttonWithCommand.command = 'setTextAlign';
            superToolbar.emitCommand({ item: buttonWithCommand, argument: e });
            setAlignmentIcon(alignment, e);
          };

          return h('div', {}, [
            h(AlignmentButtons, {
              onSelect: handleSelect,
            }),
          ]);
        },
        key: 'alignment',
      },
    ],
    onActivate: ({ textAlign }) => {
      setAlignmentIcon(alignment, textAlign);
    },
    onDeactivate: () => {
      setAlignmentIcon(alignment, 'left');
    },
  });

  const setAlignmentIcon = (alignment, e) => {
    let alignValue = e === 'both' ? 'justify' : e;
    let icons = {
      left: toolbarIcons.alignLeft,
      right: toolbarIcons.alignRight,
      center: toolbarIcons.alignCenter,
      justify: toolbarIcons.alignJustify,
    };

    let icon = icons[alignValue] ?? icons.left;
    alignment.icon.value = icon;
  };

  // bullet list
  const bulletedList = useToolbarItem({
    type: 'button',
    name: 'list',
    command: 'toggleBulletList',
    icon: toolbarIcons.bulletList,
    active: false,
    tooltip: toolbarTexts.bulletList,
    attributes: {
      ariaLabel: 'Bullet list',
    },
  });

  // number list
  const numberedList = useToolbarItem({
    type: 'button',
    name: 'numberedlist',
    command: 'toggleOrderedList',
    icon: toolbarIcons.numberedList,
    active: false,
    tooltip: toolbarTexts.numberedList,
    attributes: {
      ariaLabel: 'Numbered list',
    },
  });

  // indent left
  const indentLeft = useToolbarItem({
    type: 'button',
    name: 'indentleft',
    command: 'decreaseTextIndent',
    icon: toolbarIcons.indentLeft,
    active: false,
    tooltip: toolbarTexts.indentLeft,
    disabled: false,
    attributes: {
      ariaLabel: 'Left indent',
    },
  });

  // indent right
  const indentRight = useToolbarItem({
    type: 'button',
    name: 'indentright',
    command: 'increaseTextIndent',
    icon: toolbarIcons.indentRight,
    active: false,
    tooltip: toolbarTexts.indentRight,
    disabled: false,
    attributes: {
      ariaLabel: 'Right indent',
    },
  });

  // overflow
  const overflow = useToolbarItem({
    type: 'overflow',
    name: 'overflow',
    command: null,
    icon: toolbarIcons.overflow,
    active: false,
    disabled: false,
    attributes: {
      ariaLabel: 'Overflow items',
    },
  });

  // const overflowOptions = useToolbarItem({
  //   type: 'options',
  //   name: 'overflowOptions',
  //   preCommand(self, argument) {
  //     self.parentItem.active = false;
  //   },
  // });

  // zoom
  const zoom = useToolbarItem({
    type: 'dropdown',
    name: 'zoom',
    allowWithoutEditor: true,
    tooltip: toolbarTexts.zoom,
    defaultLabel: '100%',
    label: '100%',
    hasCaret: true,
    command: 'setZoom',
    isWide: true,
    inlineTextInputVisible: false,
    hasInlineTextInput: true,
    attributes: {
      ariaLabel: 'Zoom',
    },
    options: [
      { label: '50%', key: 0.5, props: { 'data-item': 'btn-zoom-option' } },
      { label: '75%', key: 0.75, props: { 'data-item': 'btn-zoom-option' } },
      { label: '90%', key: 0.9, props: { 'data-item': 'btn-zoom-option' } },
      { label: '100%', key: 1, props: { 'data-item': 'btn-zoom-option' } },
      { label: '125%', key: 1.25, props: { 'data-item': 'btn-zoom-option' } },
      { label: '150%', key: 1.5, props: { 'data-item': 'btn-zoom-option' } },
      { label: '200%', key: 2, props: { 'data-item': 'btn-zoom-option' } },
    ],
    onActivate: ({ zoom: value }) => {
      if (!value) return;

      zoom.label.value = value;
    },
  });

  // undo
  const undo = useToolbarItem({
    type: 'button',
    name: 'undo',
    disabled: true,
    tooltip: toolbarTexts.undo,
    command: 'undo',
    icon: toolbarIcons.undo,
    group: 'left',
    attributes: {
      ariaLabel: 'Undo',
    },
    onDeactivate: () => {
      undo.disabled.value = !superToolbar.undoDepth;
    },
  });

  // redo
  const redo = useToolbarItem({
    type: 'button',
    disabled: true,
    name: 'redo',
    tooltip: toolbarTexts.redo,
    command: 'redo',
    icon: toolbarIcons.redo,
    group: 'left',
    attributes: {
      ariaLabel: 'Redo',
    },
    onDeactivate: () => {
      redo.disabled.value = !superToolbar.redoDepth;
    },
  });

  // Track changes test buttons
  const toggleTrackChanges = useToolbarItem({
    type: 'button',
    disabled: false,
    name: 'toggleTrackChanges',
    tooltip: toolbarTexts.trackChanges,
    command: 'toggleTrackChanges',
    icon: toolbarIcons.trackChanges,
    group: 'left',
    attributes: {
      ariaLabel: 'Track changes',
    },
  });

  const acceptTrackedChangeBySelection = useToolbarItem({
    type: 'button',
    disabled: false,
    name: 'acceptTrackedChangeBySelection',
    tooltip: toolbarTexts.trackChangesAccept,
    command: 'acceptTrackedChangeBySelection',
    icon: toolbarIcons.trackChangesAccept,
    group: 'left',
    attributes: {
      ariaLabel: 'Accept tracked changes',
    },
  });

  const rejectTrackedChangeOnSelection = useToolbarItem({
    type: 'button',
    disabled: false,
    name: 'rejectTrackedChangeOnSelection',
    tooltip: toolbarTexts.trackChangesReject,
    command: 'rejectTrackedChangeOnSelection',
    icon: toolbarIcons.trackChangesReject,
    group: 'left',
    attributes: {
      ariaLabel: 'Reject tracked changes',
    },
  });

  const toggleTrackChangesOriginal = useToolbarItem({
    type: 'button',
    disabled: false,
    name: 'toggleTrackChangesShowOriginal',
    tooltip: toolbarTexts.trackChangesOriginal,
    command: 'toggleTrackChangesShowOriginal',
    icon: toolbarIcons.trackChangesOriginal,
    group: 'left',
    attributes: {
      ariaLabel: 'Toggle tracked changes show original',
    },
  });

  const toggleTrackChangesFinal = useToolbarItem({
    type: 'button',
    disabled: false,
    name: 'toggleTrackChangesShowFinal',
    tooltip: toolbarTexts.trackChangesFinal,
    command: 'toggleTrackChangesShowFinal',
    icon: toolbarIcons.trackChangesFinal,
    group: 'left',
    attributes: {
      ariaLabel: 'Toggle tracked changes show final',
    },
  });

  const clearFormatting = useToolbarItem({
    type: 'button',
    name: 'clearFormatting',
    command: 'clearFormat',
    tooltip: toolbarTexts.clearFormatting,
    icon: toolbarIcons.clearFormatting,
    attributes: {
      ariaLabel: 'Clear formatting',
    },
  });

  const copyFormat = useToolbarItem({
    type: 'button',
    name: 'copyFormat',
    tooltip: toolbarTexts.copyFormat,
    icon: toolbarIcons.copyFormat,
    command: 'copyFormat',
    active: false,
    attributes: {
      ariaLabel: 'Copy formatting',
    },
  });

  const getDocumentOptionsAfterRole = (role, documentOptions) => {
    if (role === 'editor') return documentOptions;
    else if (role === 'suggester') return documentOptions.filter((option) => option.value === 'suggesting');
    else return documentOptions.filter((option) => option.value === 'viewing');
  };

  const getDefaultLabel = (role) => {
    if (role === 'editor') return 'Editing';
    else if (role === 'suggester') return 'Suggesting';
    else return 'Viewing';
  };

  const documentMode = useToolbarItem({
    type: 'dropdown',
    name: 'documentMode',
    command: 'setDocumentMode',
    allowWithoutEditor: true,
    icon: toolbarIcons.documentMode,
    defaultLabel: getDefaultLabel(role),
    label: getDefaultLabel(role),
    hasCaret: role === 'editor',
    isWide: true,
    style: { display: 'flex', justifyContent: 'flex-end' },
    inlineTextInputVisible: false,
    hasInlineTextInput: false,
    group: 'right',
    disabled: role !== 'editor',
    attributes: {
      dropdownPosition: 'right',
      className: 'toolbar-item--doc-mode',
      ariaLabel: 'Document mode',
    },
    options: [
      {
        type: 'render',
        render: () => renderDocumentMode(documentMode),
      },
    ],
  });

  const documentOptions = [
    {
      label: toolbarTexts.documentEditingMode,
      value: 'editing',
      icon: toolbarIcons.documentEditingMode,
      description: toolbarTexts.documentEditingModeDescription,
    },
    {
      label: toolbarTexts.documentSuggestingMode,
      value: 'suggesting',
      icon: toolbarIcons.documentSuggestingMode,
      description: toolbarTexts.documentSuggestingModeDescription,
    },
    {
      label: toolbarTexts.documentViewingMode,
      value: 'viewing',
      icon: toolbarIcons.documentViewingMode,
      description: toolbarTexts.documentViewingModeDescription,
    },
  ];

  function renderDocumentMode(renderDocumentButton) {
    const optionsAfterRole = getDocumentOptionsAfterRole(role, documentOptions);
    return h(DocumentMode, {
      options: optionsAfterRole,
      onSelect: (item) => {
        closeDropdown(renderDocumentButton);
        const { label, icon } = item;
        documentMode.label.value = label;
        documentMode.icon.value = icon;
        superToolbar.emitCommand({ item: documentMode, argument: label });
      },
    });
  }

  const pageBreakTool = useToolbarItem({
    type: 'button',
    name: 'pageBreakTool',
    command: 'insertPageBreak',
    icon: toolbarIcons.pageBreak,
    active: false,
    tooltip: toolbarTexts.pageBreak,
    attributes: {
      ariaLabel: 'Page break',
    },
  });

  // define sizes to calculate toolbar overflow items
  const controlSizes = new Map([
    ['separator', 20],
    ['zoom', 71],
    ['fontFamily', 118],
    ['fontSize', 57],
    ['textAlign', 40],
    ['linkedStyles', 142],
    ['documentMode', 47],
    ['ai', 32],
    ['default', 32],
  ]);

  const ruler = useToolbarItem({
    type: 'button',
    name: 'ruler',
    command: 'toggleRuler',
    icon: toolbarIcons.ruler,
    active: false,
    tooltip: toolbarTexts.ruler,
    attributes: {
      ariaLabel: 'Ruler',
    },
  });

  const selectedLinkedStyle = ref(null);
  const linkedStyles = useToolbarItem({
    type: 'dropdown',
    name: 'linkedStyles',
    command: 'setLinkedStyle',
    icon: toolbarIcons.paintbrush,
    defaultLabel: toolbarTexts.formatText,
    label: toolbarTexts.formatText,
    hasCaret: true,
    isWide: true,
    style: { width: '140px' },
    suppressActiveHighlight: true,
    disabled: false,
    attributes: {
      className: 'toolbar-item--linked-styles',
      ariaLabel: 'Linked styles',
    },
    options: [
      {
        type: 'render',
        key: 'linkedStyle',
        render: () => {
          const handleSelect = (style) => {
            closeDropdown(linkedStyles);
            const itemWithCommand = { ...linkedStyles, command: 'setLinkedStyle' };
            superToolbar.emitCommand({ item: itemWithCommand, argument: style });
            selectedLinkedStyle.value = style.id;
          };

          return h('div', {}, [
            h(LinkedStyle, {
              editor: superToolbar.activeEditor,
              onSelect: handleSelect,
              selectedOption: selectedLinkedStyle.value,
            }),
          ]);
        },
      },
    ],
    onActivate: () => {
      linkedStyles.disabled.value = false;
    },
    onDeactivate: () => {
      linkedStyles.disabled.value = true;
    },
  });

  const renderIcon = (value, selectedValue) => {
    if (selectedValue.value.toString() !== value) return;
    return h('div', { innerHTML: checkIconSvg, class: 'dropdown-select-icon' });
  };

  // line height
  const lineHeight = useToolbarItem({
    type: 'dropdown',
    name: 'lineHeight',
    tooltip: toolbarTexts.lineHeight,
    icon: toolbarIcons.lineHeight,
    hasCaret: false,
    hasInlineTextInput: false,
    inlineTextInputVisible: false,
    suppressActiveHighlight: true,
    isWide: false,
    command: 'setLineHeight',
    dropdownValueKey: 'key',
    selectedValue: '1',
    attributes: {
      ariaLabel: 'Line height',
    },
    options: [
      {
        label: '1,0',
        key: '1',
        icon: () => renderIcon('1', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
      {
        label: '1,15',
        key: '1.15',
        icon: () => renderIcon('1.15', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
      {
        label: '1,5',
        key: '1.5',
        icon: () => renderIcon('1.5', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
      {
        label: '2,0',
        key: '2',
        icon: () => renderIcon('2', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
      {
        label: '2,5',
        key: '2.5',
        icon: () => renderIcon('2.5', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
      {
        label: '3,0',
        key: '3',
        icon: () => renderIcon('3', lineHeight.selectedValue),
        props: { 'data-item': 'btn-lineHeight-option' },
      },
    ],
  });

  // Responsive toolbar calculations
  const breakpoints = {
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1410,
  };
  const stickyItemsWidth = 120;
  const toolbarPadding = 32;

  const itemsToHideXL = ['linkedStyles', 'clearFormatting', 'copyFormat', 'ruler'];
  const itemsToHideSM = ['zoom', 'fontFamily', 'fontSize', 'redo'];

  let toolbarItems = [
    undo,
    redo,

    // Dev - tracked changes
    // toggleTrackChanges,
    acceptTrackedChangeBySelection,
    rejectTrackedChangeOnSelection,
    // toggleTrackChangesOriginal,
    // toggleTrackChangesFinal,

    zoom,
    fontButton,
    separator,
    fontSize,
    separator,
    bold,
    italic,
    underline,
    strikethrough,
    colorButton,
    highlight,
    separator,
    link,
    image,
    tableItem,
    tableActionsItem,
    separator,
    alignment,
    bulletedList,
    numberedList,
    indentLeft,
    indentRight,
    lineHeight,
    separator,
    linkedStyles,
    separator,
    ruler,
    pageBreakTool,
    copyFormat,
    clearFormatting,
    aiButton,
    overflow,
    documentMode,
  ];

  if (!superToolbar.config?.superdoc?.config?.modules?.ai) {
    toolbarItems = toolbarItems.filter((item) => item.name.value !== 'ai');
  }

  // Hide separators on small screens
  if (availableWidth <= breakpoints.md && hideButtons) {
    toolbarItems = toolbarItems.filter((item) => item.type !== 'separator');
  }

  // If no pagination, remove the page break tool
  if (!superToolbar.config.pagination) {
    toolbarItems = toolbarItems.filter((item) => item.name.value !== 'pageBreakTool');
  }

  // Remove docx only items
  if (superToolbar.config.mode !== 'docx') {
    const getLinkedStylesIndex = toolbarItems.findIndex((item) => item.name.value === 'linkedStyles');
    toolbarItems.splice(getLinkedStylesIndex - 1, 2);

    const filterItems = ['ruler', 'zoom', 'undo', 'redo'];
    toolbarItems = toolbarItems.filter((item) => !filterItems.includes(item.name.value));
  }

  // Track changes test buttons
  const devItems = [toggleTrackChanges, toggleTrackChangesOriginal, toggleTrackChangesFinal];
  if (!isDev) {
    if (role === 'viewer') {
      devItems.push(...[acceptTrackedChangeBySelection, rejectTrackedChangeOnSelection]);
    }
    toolbarItems = toolbarItems.filter((item) => !devItems.includes(item));
  }

  // always visible items
  const toolbarItemsSticky = [search, undo, overflow, documentMode].map((item) => item.name);
  const isStickyItem = (item) => toolbarItemsSticky.includes(item.name);

  const overflowItems = [];
  const visibleItems = [];

  // initial width with padding
  let totalWidth = toolbarPadding + stickyItemsWidth;

  toolbarItems.forEach((item) => {
    const itemWidth = controlSizes.get(item.name.value) || controlSizes.get('default');

    if (availableWidth < breakpoints.xl && itemsToHideXL.includes(item.name.value) && hideButtons) {
      overflowItems.push(item);
      if (item.name.value === 'linkedStyles') {
        const linkedStylesIdx = toolbarItems.findIndex((item) => item.name.value === 'linkedStyles');
        toolbarItems.splice(linkedStylesIdx + 1, 1);
      }
      return;
    }

    if (availableWidth < breakpoints.sm && itemsToHideSM.includes(item.name.value) && hideButtons) {
      overflowItems.push(item);
      return;
    }

    if (isStickyItem(item)) {
      visibleItems.push(item);
      totalWidth += itemWidth;
      return;
    }

    if (totalWidth < availableWidth || !hideButtons) {
      visibleItems.push(item);
      totalWidth += itemWidth;
    } else {
      overflowItems.push(item);
    }
  });

  return {
    defaultItems: visibleItems,
    overflowItems: overflowItems.filter((item) => item.type !== 'separator'),
  };
};

export const setHistoryButtonStateOnUpdate =
  (toolbarItemsRef) =>
  ({ editor }) => {
    // console.debug('[SuperEditor dev] Document updated', editor);
    // activeEditor = editor;

    const undo = toolbarItemsRef.value.find((item) => item.name === 'undo');
    const redo = toolbarItemsRef.value.find((item) => item.name === 'redo');

    undo.disabled = undoDepth(editor.state) <= 0;
    redo.disabled = redoDepth(editor.state) <= 0;
  };
