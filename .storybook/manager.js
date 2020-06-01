import { addons } from '@storybook/addons';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'light',
  brandTitle: 'Slate Plugins',
  brandUrl: 'https://github.com/udecode/slate-plugins'
});

addons.setConfig({
  theme,
  panelPosition: 'right',
});
