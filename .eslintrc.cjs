module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['plugin:react/recommended', 'standard-with-typescript'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['tsconfig.json']
    },
    plugins: ['react'],
    rules: {
        '@typescript-eslint/no-this-alias': [
            'error',
            {
                allowDestructuring: false,
                allowedNames: ['self']
            }
        ],
        'no-tabs': ['error', { allowIndentationTabs: true }],
        indent: ['error', 4],
        '@typescript-eslint/indent': ['error', 4]
    }
}
