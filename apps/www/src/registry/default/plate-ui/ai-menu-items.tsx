import {
  CursorCommandsActions,
  CursorSuggestionActions,
  SelectionCommandsActions,
  SelectionSuggestionActions,
} from './ai-actions';
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuSeparator,
  renderMenuItems,
} from './menu';

export const CursorCommands = () => {
  return (
    <>
      <MenuGroup label="Write with AI">
        <MenuItem {...CursorCommandsActions.continueWrite} />
      </MenuGroup>
      <MenuSeparator />
      <MenuGroup label="Generate from page">
        <MenuItem {...CursorCommandsActions.Summarize} />
        <Menu
          label={CursorCommandsActions.translate.label}
          icon={CursorCommandsActions.translate.icon}
        >
          {renderMenuItems(CursorCommandsActions.translate)}
        </Menu>
        <MenuItem {...CursorCommandsActions.explain} />
      </MenuGroup>
    </>
  );
};

export const CursorSuggestions = () => {
  return (
    <>
      <MenuItem {...CursorSuggestionActions.done} />
      <MenuItem {...CursorSuggestionActions.continueWrite} />
      <MenuItem {...CursorSuggestionActions.makeLonger} />

      <MenuSeparator />

      <MenuItem {...CursorSuggestionActions.tryAgain} />
      <MenuItem {...CursorSuggestionActions.close} />
    </>
  );
};

export const SelectionCommands = () => {
  return (
    <>
      <MenuItem {...SelectionCommandsActions.improveWriting} />
      <MenuItem {...SelectionCommandsActions.fixSpell} />
      <MenuItem {...SelectionCommandsActions.makeShorter} />
      <MenuItem {...SelectionCommandsActions.makeLonger} />
      <MenuItem {...SelectionCommandsActions.simplifyLanguage} />

      <MenuSeparator />

      <MenuGroup label="Generate from selection">
        <Menu
          label={SelectionCommandsActions.translate.label}
          icon={SelectionCommandsActions.translate.icon}
        >
          {renderMenuItems(SelectionCommandsActions.translate)}
        </Menu>
      </MenuGroup>
    </>
  );
};

export const SelectionSuggestions = () => {
  return (
    <>
      <MenuItem preventClose {...SelectionSuggestionActions.replace} />
      <MenuItem preventClose {...SelectionSuggestionActions.insertBelow} />
      <MenuItem preventClose {...SelectionSuggestionActions.continueWrite} />
      <MenuItem preventClose {...SelectionSuggestionActions.makeLonger} />

      <MenuSeparator />

      <MenuItem preventClose {...SelectionSuggestionActions.tryAgain} />
      <MenuItem preventClose {...SelectionSuggestionActions.done} />
    </>
  );
};

export const aiCommands = {
  CursorCommands,
  CursorSuggestions,
  SelectionCommands,
  SelectionSuggestions,
};
