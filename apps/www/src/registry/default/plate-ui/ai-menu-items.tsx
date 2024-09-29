import {
  DefaultActions,
  DefaultSuggestionActions,
  SelectionActions,
  SelectionSuggestionActions,
} from './ai-actions';
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuSeparator,
  renderMenuItems,
} from './menu';

export const DefaultItems = () => {
  return (
    <>
      <MenuGroup label="Write with AI">
        <MenuItem {...DefaultActions.continueWrite} />
      </MenuGroup>
      <MenuSeparator />
      <MenuGroup label="Generate from page">
        <MenuItem {...DefaultActions.Summarize} />
        <Menu
          label={DefaultActions.translate.label}
          icon={DefaultActions.translate.icon}
        >
          {renderMenuItems(DefaultActions.translate)}
        </Menu>
        <MenuItem {...DefaultActions.explain} />
      </MenuGroup>
    </>
  );
};

export const DefaultSuggestionItems = () => {
  return (
    <>
      <MenuItem {...DefaultSuggestionActions.done} />
      <MenuItem {...DefaultSuggestionActions.continueWrite} />
      <MenuItem {...DefaultSuggestionActions.makeLonger} />

      <MenuSeparator />

      <MenuItem {...DefaultSuggestionActions.tryAgain} />
      <MenuItem {...DefaultSuggestionActions.close} />
    </>
  );
};

export const SelectionItems = () => {
  return (
    <>
      <MenuItem {...SelectionActions.improveWriting} />
      <MenuItem {...SelectionActions.fixSpell} />
      <MenuItem {...SelectionActions.makeShorter} />
      <MenuItem {...SelectionActions.makeLonger} />
      <MenuItem {...SelectionActions.simplifyLanguage} />

      <MenuSeparator />

      <MenuGroup label="Generate from selection">
        <Menu
          label={SelectionActions.translate.label}
          icon={SelectionActions.translate.icon}
        >
          {renderMenuItems(SelectionActions.translate)}
        </Menu>
      </MenuGroup>
    </>
  );
};

export const SelectionSuggestionItems = () => {
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
