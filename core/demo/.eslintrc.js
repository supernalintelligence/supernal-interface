module.exports = {
  extends: [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // Relax rules for demo/production builds
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "no-unused-vars": "warn",
    "no-console": "warn",
    "react/no-unescaped-entities": "warn",
    "react/jsx-no-comment-textnodes": "warn",
    "no-case-declarations": "warn",
    "no-inner-declarations": "warn",
    "prefer-const": "warn",
    "@next/next/no-img-element": "warn"
  },
  env: {
    browser: true,
    node: true,
    es6: true
  }
};

