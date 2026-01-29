import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'react/jsx-key': [1, { checkFragmentShorthand: true }],
		},
	},
]);
