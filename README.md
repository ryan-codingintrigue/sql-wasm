# sql-wasm

SQLite compiled to WebAssembly through Emscripten.

This project is a port of the existing [SQL.js](https://github.com/kripken/sql.js/) library. The API methods and syntax are almost identical

## Usage

The entry point to the library is the only difference between `sql-wasm` and `SQL.js`. The library is loaded asynchronously by downloading the `.wasm` file from the network (Web) or filesystem (NodeJS).

```js
import createSqlWasm from "sql-wasm";

(async () => {
    const sql = await createSqlWasm({ wasmUrl: "/path/to/sqlite3.wasm" });
    // From here on, the SQL.js API can be used...
    const db = new sql.Database();
})();
```

On the web `wasmUrl` defaults to `/sqlite3.wasm`.

On NodeJS `wasmUrl` defaults to `${__dirname}/sqlite3.wasm`

## SQL.js usage examples:

```js
// Create a database
var db = new sql.Database();
// NOTE: You can also use new sql.Database(data) where
// data is an Uint8Array representing an SQLite database file

// Execute some sql
sqlstr = "CREATE TABLE hello (a int, b char);";
sqlstr += "INSERT INTO hello VALUES (0, 'hello');"
sqlstr += "INSERT INTO hello VALUES (1, 'world');"
db.run(sqlstr); // Run the query without returning anything

var res = db.exec("SELECT * FROM hello");
/*
[
	{columns:['a','b'], values:[[0,'hello'],[1,'world']]}
]
*/

// Prepare an sql statement
var stmt = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

// Bind values to the parameters and fetch the results of the query
var result = stmt.getAsObject({':aval' : 1, ':bval' : 'world'});
console.log(result); // Will print {a:1, b:'world'}

// Bind other values
stmt.bind([0, 'hello']);
while (stmt.step()) console.log(stmt.get()); // Will print [0, 'hello']

// You can also use javascript functions inside your SQL code
// Create the js function you need
function add(a, b) {return a+b;}
// Specifies the SQL function's name, the number of it's arguments, and the js function to use
db.create_function("add_js", add);
// Run a query in which the function is used
db.run("INSERT INTO hello VALUES (add_js(7, 3), add_js('Hello ', 'world'));"); // Inserts 10 and 'Hello world'

// free the memory used by the statement
stmt.free();
// You can not use your statement anymore once it has been freed.
// But not freeing your statements causes memory leaks. You don't want that.

// Export the database to an Uint8Array containing the SQLite database file
var binaryArray = db.export();
```

## Web Worker

Web Worker functionality has been omitted from this implementation.

## Development

You'll need to install the [Emscripten SDK](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) to make any modifications to this package.

Compile the SQLite WebAssembly wrapper on it's own using:

```cmd
npm run make-wasm
```

This project uses TypeScript + Babel. You can compile those by using the `build` command:

```cmd
npm run build
```

## Tests

The unit tests here are a direct port from the unit tests in SQL.js to ensure the two libraries are compatible.

These tests are written using Jest and can be launched using the NPM command:

```cmd
npm test
```