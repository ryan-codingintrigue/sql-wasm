import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import url from "rollup-plugin-url";
import replace from "rollup-plugin-replace";

const extensions = [".ts", ".js"];

const nodeJsEnvironment = replace({
    "process.browser": false,
    ENVIRONMENT_IS_NODE: true,
    ENVIRONMENT_IS_WEB: false,
    ENVIRONMENT_IS_WORKER: false,
    ENVIRONMENT_IS_SHELL: false
});
const browserEnvironment = replace({
    "process.browser": true,
    ENVIRONMENT_IS_NODE: false,
    ENVIRONMENT_IS_WEB: true,
    ENVIRONMENT_IS_WORKER: false,
    ENVIRONMENT_IS_SHELL: false
});

const shared = {
    input: "src/index.ts",
    external: ["path"],
    output: {
        dir: "dist",
        format: "esm"
    },
    plugins: [
        url({
            limit: 0,
            include: ["src/native/compiled/sqlite3.wasm"],
            sourceDir: path.join(__dirname, "src/native/compiled/"),
            fileName: "../[name][extname]"
        }),
        babel({ extensions, include: ["src/**/*"], exclude: "src/native/compiled/sqlite3.js" }),
        resolve({ extensions })
    ]
};

const cjs = {
    ...shared,
    output: {
        dir: "dist/cjs",
        entryFileNames: "sql-wasm.js",
        format: "cjs"
    },
    plugins: [
        nodeJsEnvironment,
        ...shared.plugins
    ]
};

const esm = {
    ...shared,
    output: {
        dir: "dist/esm",
        entryFileNames: "sql-wasm.js",
        format: "esm"
    },
    plugins: [
        nodeJsEnvironment,
        ...shared.plugins
    ]
};

const cloneForBrowser = config => Object.assign({}, config, {
    output: {
        ...config.output,
        entryFileNames: "sql-wasm-browser.js"
    },
    plugins: [
        browserEnvironment,
        ...shared.plugins
    ]
});

const esmBrowser = cloneForBrowser(esm);

const cjsBrowser = cloneForBrowser(cjs);

export default [cjs, esm, cjsBrowser, esmBrowser];