module.exports = {
    extends: "stylelint-config-standard",
    plugins: ["stylelint-value-no-unknown-custom-properties"],
    rules: {
        "color-hex-length": "long",
        "max-nesting-depth": 2,
        "csstools/value-no-unknown-custom-properties": [
            true,
            {
                importFrom: ["fiduswriter/base/static/css/colors.css"]
            }
        ],
        "selector-class-pattern": [
            "^(([a-z][a-z0-9]*)(-[a-z0-9]+)*)|(ProseMirror(-[a-z0-9]+)*)$",
            {
                message:
                    "Selector should use lowercase and separate words with hyphens (selector-class-pattern)"
            }
        ]
    }
}
