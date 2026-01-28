import { ref, reactive, watch } from 'vue';

export function useFieldValueWatcher(field, originalValue) {
  const fieldId = field.itemid;
  const rawField = field;

  const valueIsObject = originalValue !== null && typeof originalValue === 'object';
  const value = valueIsObject ? reactive({ ...originalValue }) : ref(originalValue);
  const change = ref(null);

  const handleChange = (newValue, oldValue) => {
    // If the value hasn't changed, don't do anything
    // If new change, add the change to the list
    const newChange = {
      fieldId: fieldId.value,
      changeTime: Date.now(),
      oldValue: oldValue,
      newValue: newValue,
      originalField: rawField,
    };
    change.value = newChange;
  };

  watch(value, handleChange);
  return {
    value,
  };
}

export function useField(field) {
  const id = ref(field.itemid);

  const icon = ref(field.itemicon);
  const iconPack = ref(field.itemiconpack);

  const label = ref(field.itemdisplaylabel);
  const originalValue = field.itemlinkvalue;
  const placeholder = field.itemplaceholdertext;

  const changeHistory = ref([]);
  const { value } = useFieldValueWatcher(field, originalValue, changeHistory);

  const fieldType = ref(field.itemtype);
  const fieldSubType = ref(field.itemfieldtype);
  const originalJSON = field;
  const fieldStyle = reactive({
    fontFamily: field.fontfamily || 'Arial',
    fontSize: field.font_size || '12pt',
    originalFontSize: field.original_font_size || '12pt',
  });

  const logicRules = ref(field.logicrules);
  const hidden = ref(false);

  const additionalOptions = reactive({});
  const fieldHandlers = {
    SELECT: useSelectField,
    IMAGEINPUT: useImageField,
    CHECKBOXINPUT: useCheckboxField,
  };
  if (fieldType.value in fieldHandlers) {
    Object.assign(additionalOptions, fieldHandlers[fieldType.value](field));
  }

  const format = ref(field.itemformat);

  /**
   * Callback for fields which value is not a String value
   * and have to be calculated using additional data
   * Example: multiple image upload input
   *
   * @param {Object} data which is passed from SD
   * @returns {String} string value that can be used in annotation
   */
  const valueGetter = field.valueGetter;

  return {
    id,
    icon,
    iconPack,
    label,
    placeholder,
    fieldType,
    fieldSubType,
    value,
    format,
    logicRules,
    hidden,
    originalJSON,
    fieldStyle,
    valueGetter,
    ...additionalOptions,
  };
}

export function useImageField(field) {
  const fontfamily = ref(field.fontfamily);
  const iteminputtype = ref(field.iteminputtype);

  const self = {
    fontfamily,
    iteminputtype,
  };
  return self;
}

export function useSelectField(field) {
  const options = ref(field.itemoptions);
  return {
    options,
  };
}

export function useCheckboxField(field) {
  const options = ref(field.itemoptions);

  if (options.value) {
    options.value = options.value.map((option) => {
      return {
        label: option.itemdisplaylabel,
        value: option.itemlinkvalue,
        checked: option.ischecked,
        id: option.itemid,
        annotationId: option.annotationId,
      };
    });
  }
  return {
    options,
  };
}
