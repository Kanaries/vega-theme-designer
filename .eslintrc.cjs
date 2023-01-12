module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/all',
		'plugin:@typescript-eslint/recommended',
		'xo',
		'airbnb',
	],
	overrides: [
		{
			extends: ['xo-typescript'],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': [
				'.ts',
				'.tsx',
			],
		},
		'import/resolver': {
			node: {
				extensions: [
					'.js',
					'.jsx',
					'.ts',
					'.tsx',
				],
				moduleDirectory: [
					'node_modules',
					'src/',
				],
			},
			typescript: {
				directory: 'tsconfig.json',
			},
		},
		'import/extensions': [
			'.js',
			'.jsx',
			'.ts',
			'.tsx',
		],
	},
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
		project: './tsconfig.json',
	},
	plugins: [
		'react',
		'import',
		'@typescript-eslint',
	],
	rules: {
		// '@typescript-eslint/ban-types': 'off',
		quotes: [
			'error',
			'single',
		],
		'no-tabs': [
			'error',
			{allowIndentationTabs: true},
		],
		indent: [
			'error',
			'tab',
		],
		// 'comma-dangle': ['error', 'never'],
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
		semi: [
			'error',
			'always',
		],
		'react/jsx-filename-extension': [
			1,
			{
				extensions: [
					'.js',
					'.jsx',
					'tsx',
				],
			},
		],
		'react/jsx-indent': [
			'error',
			'tab',
		],
		'react/jsx-indent-props': [
			'error',
			'tab',
		],
		'operator-linebreak': [
			'error',
			'before',
		],
		'object-curly-spacing': [
			'error',
			'never',
		],
		'jsx-a11y/no-static-element-interactions': 'off',
		'@typescript-eslint/ban-types': 'off',
		'@typescript-eslint/no-this-alias': [
			'error',
			{
				allowDestructuring: false,
				allowedNames: ['self'],
			},
		],
	},
};
