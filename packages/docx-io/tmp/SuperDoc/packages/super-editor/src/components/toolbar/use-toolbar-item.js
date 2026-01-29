import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

export const useToolbarItem = (options) => {
  const types = ['button', 'options', 'separator', 'dropdown', 'overflow'];
  if (!types.includes(options.type)) {
    throw new Error('Invalid toolbar item type - ' + options.type);
  }

  if (options.type === 'button' && !options.defaultLabel && !options.icon) {
    throw new Error('Toolbar button item needs either icon or label - ' + options.name);
  }

  if (!options.name) {
    throw new Error('Invalid toolbar item name - ' + options.name);
  }

  const id = ref(uuidv4());
  const type = options.type;
  const name = ref(options.name);
  const command = options.command;
  const noArgumentCommand = options.noArgumentCommand;
  const icon = ref(options.icon);
  const group = ref(options.group || 'center');
  const allowWithoutEditor = ref(options.allowWithoutEditor);
  const attributes = ref(options.attributes || {});

  const initiallyDisabled = options.disabled || false;
  const disabled = ref(options.disabled);
  const active = ref(false);
  const expand = ref(false);

  // top-level style
  const style = ref(options.style);
  const isNarrow = ref(options.isNarrow);
  const isWide = ref(options.isWide);
  const minWidth = ref(options.minWidth);
  const suppressActiveHighlight = ref(options.suppressActiveHighlight || false);

  const argument = ref(options.argument);
  const childItem = ref(null);
  const parentItem = ref(null);

  // icon properties
  const iconColor = ref(options.iconColor);
  const hasCaret = ref(options.hasCaret);

  // dropdown properties
  const dropdownStyles = ref(options.dropdownStyles);

  // tooltip properties
  const tooltip = ref(options.tooltip);
  const tooltipVisible = ref(options.tooltipVisible);
  const tooltipTimeout = ref(options.tooltipTimeout);

  // behavior
  const defaultLabel = ref(options.defaultLabel);
  const label = ref(options.label);
  const hideLabel = ref(options.hideLabel);
  const inlineTextInputVisible = ref(options.inlineTextInputVisible);
  const hasInlineTextInput = ref(options.hasInlineTextInput);

  const markName = ref(options.markName);
  const labelAttr = ref(options.labelAttr);

  // Dropdown item
  const selectedValue = ref(options.selectedValue);
  const dropdownValueKey = ref(options.dropdownValueKey);

  const inputRef = ref(options.inputRef || null);

  const nestedOptions = ref([]);
  if (options.options) {
    if (!Array.isArray(options.options)) throw new Error('Invalid toolbar item options - ' + options.options);
    nestedOptions.value?.push(...options.options);
  }

  // Activation & Deactivation
  const activate = (attrs) => {
    onActivate(attrs);

    if (suppressActiveHighlight.value) return;
    active.value = true;
  };

  const deactivate = () => {
    onDeactivate();
    active.value = false;
  };

  const setDisabled = (state) => {
    disabled.value = state;
  };

  const resetDisabled = () => {
    disabled.value = initiallyDisabled;
  };

  // User can override this behavior
  const onActivate = options.onActivate || (() => null);
  const onDeactivate = options.onDeactivate || (() => null);

  const unref = () => {
    const flattened = {};
    Object.keys(refs).forEach((key) => {
      if (refs[key].value !== undefined) {
        flattened[key] = refs[key].value;
      }
    });
    return flattened;
  };

  const refs = {
    id,
    name,
    type,
    command,
    noArgumentCommand,
    icon,
    tooltip,
    group,
    attributes,
    disabled,
    active,
    expand,
    nestedOptions,

    style,
    isNarrow,
    isWide,
    minWidth,
    argument,
    parentItem,
    iconColor,
    hasCaret,
    dropdownStyles,
    tooltipVisible,
    tooltipTimeout,
    defaultLabel,
    label,
    hideLabel,
    inlineTextInputVisible,
    hasInlineTextInput,
    markName,
    labelAttr,
    childItem,

    allowWithoutEditor,
    dropdownValueKey,
    selectedValue,
    inputRef,
  };

  return {
    ...refs,
    unref,
    activate,
    deactivate,
    setDisabled,
    resetDisabled,
    onActivate,
    onDeactivate,
  };
};
