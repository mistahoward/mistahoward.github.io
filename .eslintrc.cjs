module.exports = {
	env: {
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"prettier"
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: { jsx: true },
	},
	rules: {
		"no-tabs": "off",
		indent: ["error", "tab", { SwitchCase: 1 }],
		"@typescript-eslint/semi": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"comma-dangle": "off",
		"linebreak-style": "off",
		"quotes": ["error", "double"],
		"max-len": ["error", { code: 80 }],
	},
	overrides: [
		{
			files: ["frontend/src/**/*.{ts,tsx}"],
			extends: ["plugin:react/recommended"],
			plugins: ["react"],
			settings: { react: { version: "detect" } },
			rules: {
				"react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
				"react/jsx-indent": ["error", "tab"],
				"react/jsx-indent-props": ["error", "tab"],
				"react/require-default-props": "off",
				"react/function-component-definition": [2, { namedComponents: "arrow-function" }],
				"react/react-in-jsx-scope": "off",
				"react/prop-types": "off",
			}
		},
		{
			files: ["backend/src/**/*.ts"],
			env: { 
				node: true
			},
			extends: ["airbnb-base"],
			plugins: [],
			rules: {
				"import/extensions": "off",
				"import/no-extraneous-dependencies": "off",
				"import/no-unresolved": "off",
				"import/prefer-default-export": "off",
				"no-console": "off",
				"no-undef": "off", // Cloudflare Workers types are global
			}
		}
	]
}; 