export const slashCommandAppCode = `import React, { useEffect } from 'react';
import {
  Combobox,
  comboboxActions,
  ComboboxItemProps,
  isDefined,
  useComboboxSelectors,
} from '@udecode/plate';

// WIP

export const COMBOBOX_TRIGGER_SLASH_COMMAND = '/';
export const COMBOBOX_KEY_SLASH_COMMAND = 'slash_command';

const COMMAND_BLOCK_ADD_PARAGRAPH = {
  id: 'block.add.paragraph',
  label: 'Block: Add Paragraph',
  inlineLabel: 'Paragraph',
  description: 'Plain text',
  keybinding: '⌘⏎',
};

const SlashCommandComboboxEffect = () => {
  const search = useComboboxSelectors.text();

  useEffect(() => {
    const commands = [COMMAND_BLOCK_ADD_PARAGRAPH, COMMAND_BLOCK_ADD_PARAGRAPH];

    const items = commands
      .map((item) => ({
        key: item.id,
        text: item.inlineLabel,
        data: {
          description: item.description,
          keybinding: item.keybinding,
        },
      }))
      .filter(
        (c) =>
          !isDefined(search) ||
          c.text?.toLowerCase().includes(search.toLowerCase())
      );

    comboboxActions.items(items);
  }, [search]);

  return null;
};

const SlashCommandComboboxItem = ({ item }: ComboboxItemProps<{}>) => {
  const data = item.data as any;

  return (
    <div className="inline-flex w-full p-2">
      <div className="flex w-full justify-between">
        <div className="flex-column">
          <div className="text-sm">{item.text}</div>
          {isDefined(data.description) && (
            <div className="mt-0.5 text-xs text-neutralSecondary">
              {data.description}
            </div>
          )}
        </div>
        {isDefined(data.keybinding) && (
          <div>
            {/* <Keybind className="p-1 text-xs">{data.keybinding}</Keybind> */}
          </div>
        )}
      </div>
    </div>
  );
};

const SlashCommandCombobox = () => (
  <Combobox
    id={COMBOBOX_KEY_SLASH_COMMAND}
    component={SlashCommandComboboxEffect}
    trigger={COMBOBOX_TRIGGER_SLASH_COMMAND}
    onRenderItem={SlashCommandComboboxItem}
    // onSelectItem={useSlashCommandOnSelectItem()}
    onSelectItem={() => {}}
  />
);
`;

export const slashCommandAppFile = {
  '/SlashCommandApp.tsx': slashCommandAppCode,
};
