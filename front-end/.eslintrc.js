// .eslintrc.js
module.exports = {
	root: true,
	env: {
		browser: true,
		es2022: true,
		node: true
	},
	extends: [
		"eslint:recommended",
		"plugin:preact/recommended",
		"plugin:react-hooks/recommended",
		"plugin:@typescript-eslint/recommended",
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: {
			jsx: true
		}
	},
	plugins: ["preact", "react-hooks", "@typescript-eslint"],
	parser: "@typescript-eslint/parser",
	settings: {
		react: {
			pragma: "h",
			version: "detect"
		},
		preact: {
			version: "detect"
		}
	},
	rules: {
		"indent": ["error", "tab"],		
		"brace-style": ["error", "1tbs", { "allowSingleLine": true }],
		"quotes": ["error", "double", { "allowTemplateLiterals": true }],
		
		"semi": ["error", "always"],
		"comma-dangle": ["error", "always-multiline"],
		
		"object-curly-spacing": ["error", "always"],
		
		"space-in-parens": ["error", "never"],
		
		"prefer-arrow-callback": "error",
		"prefer-template": "error",
		
		"object-shorthand": ["error", "always"],
		"prefer-destructuring": ["error", {
			"array": true,
			"object": true
		}],
		"curly": ["error", "multi-line"],
		
		"preact/no-unknown-element": "error",
		
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		
		"prefer-rest-params": "error",
		"prefer-spread": "error"
	}
};