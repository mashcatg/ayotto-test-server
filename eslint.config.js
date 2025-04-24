import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	{
		ignores: ["node_modules", "dist"],
		rules: {
			"no-unused-vars": "error",
			"no-undef": "error",
			"no-//console": "warn",
			"prefer-const": "error",
			"no-unused-expressions": "error",
		},
	},
];
