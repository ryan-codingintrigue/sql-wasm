module.exports = {
    presets: [
        "@babel/typescript",
        [
            "@babel/env",
            {
                exclude: ["transform-regenerator"],
                targets: {
                    chrome: "42"
                }
            }
        ]
    ],
    plugins: ["@babel/plugin-syntax-dynamic-import"],
    env: {
        test: {
            plugins: [
                "babel-plugin-dynamic-import-node"
            ]
        }
    }
};