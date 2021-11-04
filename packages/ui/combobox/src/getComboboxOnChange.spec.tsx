/** @jsx jsx */

import { createEditorPlugins } from '@udecode/plate';
import { HandlerReturnType, PlateEditor } from '@udecode/plate-core';
import { getMentionOnSelectItem } from '@udecode/plate-mention';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { ComboboxState, comboboxStore } from './combobox.store';
import { createComboboxPlugin } from './createComboboxPlugin';
import { getComboboxOnChange } from './getComboboxOnChange';

jsx;

describe('getComboboxOnChange', () => {
  const createEditor = (state: JSX.Element) => {
    const plugins = [createParagraphPlugin(), createComboboxPlugin()];

    return createEditorPlugins({
      editor: (<editor>{state}</editor>) as any,
      plugins,
    });
  };

  const onChange = (fragment: JSX.Element): HandlerReturnType => {
    return getComboboxOnChange()(createEditor(fragment))([]);
  };

  const createCombobox = ({
    trigger = '@',
    id = trigger,
    searchPattern = '\\S+',
    controlled = false,
  }: {
    trigger?: string;
    id?: string;
    searchPattern?: string;
    controlled?: boolean;
  } = {}) =>
    comboboxStore.set.setComboboxById({
      id,
      trigger,
      searchPattern,
      onSelectItem: getMentionOnSelectItem({ pluginKey: id }),
      controlled,
    });

  beforeEach(() => {
    comboboxStore.set.byId({});
    comboboxStore.set.reset();
  });

  it('should open the combobox if the text after trigger matches pattern', () => {
    createCombobox();

    onChange(
      <hp>
        @hello
        <cursor />
      </hp>
    );

    expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
      text: 'hello',
      activeId: expect.anything(),
    });
  });

  it('should not open the combobox if the combobox is controlled', () => {
    createCombobox({ controlled: true });

    onChange(
      <hp>
        @hello
        <cursor />
      </hp>
    );

    expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
      activeId: null,
    });
  });

  it('should not alter the state of a controlled combobox', () => {
    const id = 'controlled';

    createCombobox({ id, controlled: true });

    comboboxStore.set.open({
      activeId: id,
      text: '',
      targetRange: null,
    });

    onChange(
      <hp>
        <cursor />
      </hp>
    );

    expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
      activeId: id,
    });
  });

  it('should handle a mix of controlled and uncontrolled comboboxes', () => {
    createCombobox({ trigger: '@', controlled: true });
    createCombobox({ trigger: '#', controlled: false });

    onChange(
      <hp>
        #hello
        <cursor />
      </hp>
    );

    expect(comboboxStore.get.state()).toMatchObject<Partial<ComboboxState>>({
      text: 'hello',
      activeId: expect.anything(),
    });
  });
});
