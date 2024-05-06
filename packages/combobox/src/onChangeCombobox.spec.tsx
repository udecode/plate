/** @jsx jsx */

import {
  type HandlerReturnType,
  createPlateEditor,
} from '@udecode/plate-common';
import { getMentionOnSelectItem } from '@udecode/plate-mention';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import {
  type ComboboxState,
  comboboxActions,
  comboboxSelectors,
} from './combobox.store';
import { createComboboxPlugin } from './createComboboxPlugin';
import { onChangeCombobox } from './onChangeCombobox';

jsx;

describe('onChangeCombobox', () => {
  const createEditor = (state: React.ReactElement) => {
    const plugins = [createParagraphPlugin(), createComboboxPlugin()];

    return createPlateEditor({
      editor: (<editor>{state}</editor>) as any,
      plugins,
    });
  };

  const onChange = (fragment: React.ReactElement): HandlerReturnType => {
    return onChangeCombobox(createEditor(fragment))();
  };

  const createCombobox = ({
    controlled = false,
    trigger = '@',
    id = trigger,
    searchPattern = '\\S+',
  }: {
    controlled?: boolean;
    id?: string;
    searchPattern?: string;
    trigger?: string;
  } = {}) =>
    comboboxActions.setComboboxById({
      controlled,
      id,
      onSelectItem: getMentionOnSelectItem({ key: id }),
      searchPattern,
      trigger,
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
      activeId: expect.anything(),
      text: 'hello',
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

    createCombobox({ controlled: true, id });

    comboboxActions.open({
      activeId: id,
      targetRange: null,
      text: '',
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
    createCombobox({ controlled: true, trigger: '@' });
    createCombobox({ controlled: false, trigger: '#' });

    onChange(
      <hp>
        #hello
        <cursor />
      </hp>
    );

    expect(comboboxSelectors.state()).toMatchObject<Partial<ComboboxState>>({
      activeId: expect.anything(),
      text: 'hello',
    });
  });
});
