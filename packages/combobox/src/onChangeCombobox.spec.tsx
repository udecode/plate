/** @jsx jsx */

import { createPlateEditor, HandlerReturnType } from '@udecode/plate-common';
import { getMentionOnSelectItem } from '@udecode/plate-mention';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import {
  comboboxActions,
  comboboxSelectors,
  ComboboxState,
} from './combobox.store';
import { createComboboxPlugin } from './createComboboxPlugin';
import { onChangeCombobox } from './onChangeCombobox';

jsx;

describe('onChangeCombobox', () => {
  const createEditor = (state: JSX.Element) => {
    const plugins = [createParagraphPlugin(), createComboboxPlugin()];

    return createPlateEditor({
      editor: (<editor>{state}</editor>) as any,
      plugins,
    });
  };

  const onChange = (fragment: JSX.Element): HandlerReturnType => {
    return onChangeCombobox(createEditor(fragment))();
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
    comboboxActions.setComboboxById({
      id,
      trigger,
      searchPattern,
      onSelectItem: getMentionOnSelectItem({ key: id }),
      controlled,
    });

  beforeEach(() => {
    comboboxActions.byId({});
    comboboxActions.reset();
  });

  it('should open the combobox if the text after trigger matches pattern', () => {
    createCombobox();

    onChange(
      <hp>
        @hello
        <cursor />
      </hp>
    );

    expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
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

    expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
      activeId: null,
    });
  });

  it('should not alter the state of a controlled combobox', () => {
    const id = 'controlled';

    createCombobox({ id, controlled: true });

    comboboxActions.open({
      activeId: id,
      text: '',
      targetRange: null,
    });

    onChange(
      <hp>
        <cursor />
      </hp>
    );

    expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
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

    expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
      text: 'hello',
      activeId: expect.anything(),
    });
  });
});
