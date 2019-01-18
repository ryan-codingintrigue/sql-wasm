module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+\\.(ts|js)$": "babel-jest",
        "^.+\\.wasm$": "<rootDir>/test/mocks/urlMock.js",
    },
    testRegex: "spec\\.(js|ts)$",
    moduleFileExtensions: [
        "ts",
        "js",
        "node"
    ],
    globals: {
        "process.browser": false,
        ENVIRONMENT_IS_NODE: true,
        ENVIRONMENT_IS_WEB: false,
        ENVIRONMENT_IS_WORKER: false,
        ENVIRONMENT_IS_SHELL: false
    }
};