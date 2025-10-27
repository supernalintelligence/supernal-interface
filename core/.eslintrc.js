module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  extends: [
    "eslint:recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "no-unused-vars": "off", // Use TypeScript version instead
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["warn", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_" 
    }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-extra-semi": "error",
    "no-useless-escape": "error",
    "no-undef": "off" // TypeScript handles this
  },
  overrides: [
    {
      files: ["**/*.test.ts", "**/*.spec.ts"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      files: ["**/cli/**/*.ts"],
      rules: {
        "no-console": "off"
      }
    }
  ]
};
