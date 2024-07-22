module.exports = {
	root: true,
	env: {
		browser: true,
		es2021: true
	},
	ignorePatterns: ['dist', '.eslintrc.cjs'],
	plugins: ["react", "@typescript-eslint", 'react-refresh'],
	extends: ["plugin:react/recommended", 
		"airbnb",
		"eslint:recommended",
    	"plugin:@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	overrides: [],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		project: "./tsconfig.app.json"
	},
	rules: {
		"space-before-function-paren": "off",
		"no-tabs": "off",
		"indent": ["error", "tab", { "SwitchCase": 1 }],
		"@typescript-eslint/semi": "off",
		"@typescript-eslint/indent": ["error", "tab"],
		"react/jsx-filename-extension": [1, { "extensions": [".tsx", ".jsx"] }],
		"react/jsx-indent": ["error", "tab"],
		"react/react-in-jsx-scope": "off",
		"import/extensions": "off",
		"import/no-unresolved": "off",
		"comma-dangle": "off",
		"linebreak-style": "off",
		"react/jsx-indent-props": ["error", 'tab'],
		"no-unused-expressions": "off",
		"react/require-default-props": "off",
		"react/function-component-definition": "off",
		'react-refresh/only-export-components': [
			'warn',
			{ allowConstantExport: true },
		],
	},
	globals: {
		"React": true,
		"google": true,
		"mount": true,
		"mountWithRouter": true,
		"shallow": true,
		"shallowWithRouter": true,
		"context": true,
		"expect": true,
		"jsdom": true,
		"JSX": true
	}
};
