module.exports = {
  "extends": "stylelint-config-standard-scss",
  "rules": {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": null,
    "no-descending-specificity": null,
    "selector-type-no-unknown": null,
    "selector-pseudo-element-no-unknown": null,
    "scss/function-no-unknown": [true, {
      "ignoreFunctions": ["nb-register-theme", "nb-theme", "nb-install-component"]
    }],
    "import-notation": null
  },
}