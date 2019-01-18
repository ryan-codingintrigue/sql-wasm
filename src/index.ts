import createSqlite3Api from "./sql.js/sqlite3";
// @ts-ignore
import sqlite3Module from "./native/compiled/sqlite3";
// @ts-ignore
import createSqlJs from "./sql.js";
import { SQLWasm } from "./sql.js/typings";
import wasmPath from "./native/compiled/sqlite3.wasm";

export * from "./sql.js/typings";

const getDefaultWasmUrl = () => {
    if(typeof window !== "undefined" && process.env.NODE_ENV !== "test") {
        return "/sqlite3.wasm";
    }
    if(!process) {
        return "/sqlite3.wasm";
    }
    try {
        // eslint-disable-next-line
        const path = require("path");
        return path.join(__dirname, wasmPath);
    } catch(e) {
        //
    }
    return `${__dirname}/sqlite3.wasm`;
};

export default ({ wasmUrl }: { wasmUrl: string } = { wasmUrl: getDefaultWasmUrl() }) => new Promise<SQLWasm>((resolve, reject) => {
    const wasm = sqlite3Module({
        // Just to be safe, don't automatically invoke any wasm functions
        noInitialRun: true,
        locateFile(url: string) {
            if(url.endsWith(".wasm")) {
                return wasmUrl;
            }
            return url;
        },
        onAbort(e: any) {
            reject(e);
        },
        onRuntimeInitialized() {
            const sqlite3Api = createSqlite3Api(wasm);
            const api = createSqlJs(wasm, sqlite3Api);
            // @ts-ignore
            resolve(api);
        }
    });
});