module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["plugin:react/recommended", "standard-with-typescript", "airbnb"],
	parser: "@typescript-eslint/parser",
	overrides: [],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		project: "./tsconfig.json",
	},
	plugins: ["react", "@typescript-eslint"],
	rules: {
		"space-before-function-paren": "off",
		"no-tabs": "off",
		"indent": ["error", "tab"],
		"@typescript-eslint/semi": "off",
		"@typescript-eslint/indent": ["error", "tab"],
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".jsx"] }],
    "react/jsx-indent": [1, 'tab'],
    "react/react-in-jsx-scope": "off",
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
    "JSX": true,
},
};
