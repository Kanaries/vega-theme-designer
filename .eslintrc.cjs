module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/all',
		'airbnb',
	],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				moduleDirectory: ['node_modules', 'src/'],
			},
			typescript: {
				directory: 'tsconfig.json',
			},
		},
		'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: ['react', 'import', '@typescript-eslint'],
	rules: {
		quotes: ['error', 'single'],
		'no-tabs': ['error', {allowIndentationTabs: true}],
		'func-names': ['error', 'never'],
		indent: ['error', 'tab'],
		'import/extensions': [
			'error',
			'ignorePackages',
			{
				js: 'never',
				jsx: 'never',
				ts: 'never',
				tsx: 'never',
			},
		],
		semi: ['error', 'always'],
		'react/jsx-filename-extension': [
			1,
			{
				extensions: ['.js', '.jsx', 'tsx'],
			},
		],
		'arrow-parens': ['error', 'as-needed'],
		'react/jsx-indent': ['error', 'tab'],
		'react/jsx-indent-props': ['error', 'tab'],
		'operator-linebreak': ['error', 'after'],
		'object-curly-spacing': ['error', 'never'],
		'jsx-a11y/no-static-element-interactions': [
			'error',
			{
				handlers: ['onClick'],
				allowExpressionValues: true,
			},
		],
		'@typescript-eslint/no-this-alias': [
			'error',
			{
				allowDestructuring: false,
				allowedNames: ['self'],
			},
		],
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'variable',
				format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
			},
		],
		'no-param-reassign': ['error', {props: false}],
		'@typescript-eslint/ban-types': [
			'error',
			{
				types: {
					Function: false,
				},
				extendDefaults: true,
			},
		],
	},
};
