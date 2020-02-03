import { addons } from '@storybook/addons';
import { create } from '@storybook/theming/create';

const theme = create({
  brandTitle: '🧩 Slate Plugins',
  brandUrl: 'https://github.com/zbeyens/slate-plugins-next'
});

addons.setConfig({
  theme,
  panelPosition: 'right',
});
