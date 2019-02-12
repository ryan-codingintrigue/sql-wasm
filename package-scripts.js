const { series } = require("nps-utils");

// Maps a JSON array to a shell array
const makeFunctionArray = arr => `[${arr.map(functionName => `'${functionName}'`).join(",")}]`;

// List of exported functions & methods required for SQL.js
const exportedFunctions = makeFunctionArray(require("./src/native/exported_functions.json"));
const exportedRuntimeMethods = makeFunctionArray(require("./src/native/exported_runtime_methods.json"));

// Creates the SQLite LLVM .bc file using Emscripten
const llvmSqlite = "emcc --llvm-opts 2 -DSQLITE_OMIT_LOAD_EXTENSION -DSQLITE_DISABLE_LFS -DLONGDOUBLE_TYPE=double -DSQLITE_THREADSAFE=0 -DSQLITE_ENABLE_FTS3 -DSQLITE_ENABLE_FTS3_PARENTHESIS src/native/sqlite3.c src/native/extension-functions.c -o src/native/compiled/sqlite3.bc";

// Creates the Emscripten .js and .wasm files using the SQLite code generated above.
// Two different bundles depending on the environment
const emcc = `emcc --llvm-opts 2 -s WASM=1 -s MODULARIZE=1 -s ALLOW_MEMORY_GROWTH=1 -s EXPORT_ES6=1 -s 'EXPORT_NAME="sqlite3"' -s RESERVED_FUNCTION_POINTERS=64 -s FORCE_FILESYSTEM=1 -s "EXPORTED_FUNCTIONS=${exportedFunctions}" -s "EXTRA_EXPORTED_RUNTIME_METHODS=${exportedRuntimeMethods}" src/native/compiled/sqlite3.bc -o src/native/compiled/sqlite3.js`;

// HACK
// Emscripten has inline variables "var ENVIRONMENT_IS_WEB = true" to determine the code
// paths to take. This results in some redundant code meaning that Webpack users, for example,
// will see warnings about the use of 'fs', 'path', etc, which are never used.
// Here we will delete these 'global' variables, then when we compile the .js we'll use
// Rollup to replace the variable names with 'true' / 'false' values, allowing it to
// perform dead code elimination effectively.
const deleteEnvironmentVariables = sqliteFile => `replace-in-file "/\\/\\/ [*]{3} Environment setup code [*]{3}(?:\\\\n(.*?))+if \\(Module\\['ENVIRONMENT'\\]\\) \\{/g" "if (Module['ENVIRONMENT']) {" src/native/compiled/${sqliteFile} --isRegex`;

module.exports = {
    scripts: {
        llvmSqlite,
        emcc: series(
            emcc,
            deleteEnvironmentVariables("sqlite3.js")
        )
    }
};