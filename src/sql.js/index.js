/* eslint-disable */

// Converted from SQL.js Coffeescript

export default (wasmModule, Sqlite3) => {
    const NULL = 0; // NULL pointer, not a JS null
    const ALLOC_NORMAL = 0; // Tries to use _malloc()
    const ALLOC_STACK = 1; // Lives for the duration of the current function call
    const ALLOC_STATIC = 2; // Cannot be freed
    const ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
    const ALLOC_NONE = 4; // Do not allocate
    const {
        sqlite3_step,
        sqlite3_column_double,
        sqlite3_column_text,
        sqlite3_column_bytes,
        sqlite3_column_blob,
        sqlite3_column_type,
        sqlite3_data_count,
        sqlite3_column_name,
        sqlite3_bind_text,
        sqlite3_bind_int,
        sqlite3_bind_double,
        sqlite3_bind_blob,
        sqlite3_bind_parameter_index,
        sqlite3_clear_bindings,
        sqlite3_reset,
        sqlite3_finalize,
        sqlite3_exec,
        sqlite3_prepare_v2_sqlptr,
        sqlite3_prepare_v2,
        sqlite3_open,
        sqlite3_close_v2,
        sqlite3_errmsg,
        sqlite3_changes,
        sqlite3_value_type,
        sqlite3_value_int,
        sqlite3_value_double,
        sqlite3_value_text,
        sqlite3_value_bytes,
        sqlite3_value_blob,
        sqlite3_result_null,
        sqlite3_result_double,
        sqlite3_result_text,
        sqlite3_create_function_v2,
        RegisterExtensionFunctions
    } = Sqlite3;

    const {
        createDataFile,
        unlink,
        readFile
    } = wasmModule.FS;

    const {
        HEAP8,
        _free,
        stackAlloc,
        getValue,
        setValue,
        intArrayFromString,
        allocate,
        stackSave,
        stringToUTF8,
        lengthBytesUTF8,
        stackRestore
    } = wasmModule;

    //@copyright Ophir LOJKINE

    const apiTemp = stackAlloc(4);

    // Constants are defined in api-data.coffee
    const SQLite = {
        OK: 0,
        ERROR: 1,
        INTERNAL: 2,
        PERM: 3,
        ABORT: 4,
        BUSY: 5,
        LOCKED: 6,
        NOMEM: 7,
        READONLY: 8,
        INTERRUPT: 9,
        IOERR: 10,
        CORRUPT: 11,
        NOTFOUND: 12,
        FULL: 13,
        CANTOPEN: 14,
        PROTOCOL: 15,
        EMPTY: 16,
        SCHEMA: 17,
        TOOBIG: 18,
        CONSTRAINT: 19,
        MISMATCH: 20,
        MISUSE: 21,
        NOLFS: 22,
        AUTH: 23,
        FORMAT: 24,
        RANGE: 25,
        NOTADB: 26,
        NOTICE: 27,
        WARNING: 28,
        ROW: 100,
        DONE: 101,
        INTEGER: 1,
        FLOAT: 2,
        TEXT: 3,
        BLOB: 4,
        NULL: 5,
        UTF8: 1
    };

    /* Represents an prepared statement.

    Prepared statements allow you to have a template sql string,
    that you can execute multiple times with different parameters.

    You can't instantiate this class directly, you have to use a [Database](Database.html)
    object in order to create a statement.

    **Warning**: When you close a database (using db.close()), all its statements are
    closed too and become unusable.

    @see Database.html#prepare-dynamic
    @see https://en.wikipedia.org/wiki/Prepared_statement
    */
    class Statement {
        // Statements can't be created by the API user, only by Database::prepare
        // @private
        // @nodoc
        constructor(stmt, db) {
            this.stmt = stmt;
            this.db = db;
            this.pos = 1; // Index of the leftmost parameter is 1
            this.allocatedmem = []; // Pointers to allocated memory, that need to be freed when the statemend is destroyed
        }

        /* Bind values to the parameters, after having reseted the statement

        SQL statements can have parameters, named *'?', '?NNN', ':VVV', '@VVV', '$VVV'*,
        where NNN is a number and VVV a string.
        This function binds these parameters to the given values.

        *Warning*: ':', '@', and '$' are included in the parameters names

        *# Binding values to named parameters
        @example Bind values to named parameters
            var stmt = db.prepare("UPDATE test SET a=@newval WHERE id BETWEEN $mini AND $maxi");
            stmt.bind({$mini:10, $maxi:20, '@newval':5});
        - Create a statement that contains parameters like '$VVV', ':VVV', '@VVV'
        - Call Statement.bind with an object as parameter

        *# Binding values to parameters
        @example Bind values to anonymous parameters
            var stmt = db.prepare("UPDATE test SET a=? WHERE id BETWEEN ? AND ?");
            stmt.bind([5, 10, 20]);
        - Create a statement that contains parameters like '?', '?NNN'
        - Call Statement.bind with an array as parameter

        *# Value types
        Javascript type | SQLite type
        --- | ---
        number | REAL, INTEGER
        boolean | INTEGER
        string | TEXT
        Array, Uint8Array | BLOB
        null | NULL
        @see http://www.sqlite.org/datatype3.html

        @see http://www.sqlite.org/lang_expr.html#varparam
        @param values [Array,Object] The values to bind
        @return [Boolean] true if it worked
        @throw [String] SQLite Error
        */
        'bind'(values) {
            if (!this.stmt) { throw "Statement closed"; }
            this['reset']();
            if (Array.isArray(values)) { return this.bindFromArray(values); } else { return this.bindFromObject(values); }
        }

        /* Execute the statement, fetching the the next line of result,
        that can be retrieved with [Statement.get()](#get-dynamic) .

        @return [Boolean] true if a row of result available
        @throw [String] SQLite Error
        */
        'step'() {
            let ret;
            if (!this.stmt) { throw "Statement closed"; }
            this.pos = 1;
            switch ((ret = sqlite3_step(this.stmt))) {
                case SQLite.ROW:  return true;
                case SQLite.DONE: return false;
                default: return this.db.handleError(ret);
            }
        }

        // Internal methods to retrieve data from the results of a statement that has been executed
        // @nodoc
        getNumber(pos) { if (pos == null) { pos = this.pos++; } return sqlite3_column_double(this.stmt, pos); }
        // @nodoc
        getString(pos) { if (pos == null) { pos = this.pos++; } return sqlite3_column_text(this.stmt, pos); }
        // @nodoc
        getBlob(pos) {
            if (pos == null) { pos = this.pos++; }
            const size = sqlite3_column_bytes(this.stmt, pos);
            const ptr = sqlite3_column_blob(this.stmt, pos);
            const result = new Uint8Array(size);
            for (let i = 0, end = size, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) { result[i] = HEAP8[ptr+i]; }
            return result;
        }

        /* Get one row of results of a statement.
        If the first parameter is not provided, step must have been called before get.
        @param [Array,Object] Optional: If set, the values will be bound to the statement, and it will be executed
        @return [Array<String,Number,Uint8Array,null>] One row of result

        @example Print all the rows of the table test to the console

            var stmt = db.prepare("SELECT * FROM test");
            while (stmt.step()) console.log(stmt.get());
        */
        'get'(params) { // Get all fields
            if (params != null) { this['bind'](params) && this['step'](); }
            return (() => {
                const result = [];
                for (let field = 0, end = sqlite3_data_count(this.stmt), asc = 0 <= end; asc ? field < end : field > end; asc ? field++ : field--) {
                    switch (sqlite3_column_type(this.stmt, field)) {
                        case SQLite.INTEGER: case SQLite.FLOAT: result.push(this.getNumber(field)); break;
                        case SQLite.TEXT: result.push(this.getString(field)); break;
                        case SQLite.BLOB: result.push(this.getBlob(field)); break;
                        default: result.push(null);
                    }
                }
                return result;
            })();
        }

        /* Get the list of column names of a row of result of a statement.
        @return [Array<String>] The names of the columns
        @example

            var stmt = db.prepare("SELECT 5 AS nbr, x'616200' AS data, NULL AS nothing;");
            stmt.step(); // Execute the statement
            console.log(stmt.getColumnNames()); // Will print ['nbr','data','nothing']
        */
        'getColumnNames'() {
                return __range__(0, sqlite3_data_count(this.stmt), false).map((i) => sqlite3_column_name(this.stmt, i));
            }

        /* Get one row of result as a javascript object, associating column names with
        their value in the current row.
        @param [Array,Object] Optional: If set, the values will be bound to the statement, and it will be executed
        @return [Object] The row of result
        @see [Statement.get](#get-dynamic)

        @example

            var stmt = db.prepare("SELECT 5 AS nbr, x'616200' AS data, NULL AS nothing;");
            stmt.step(); // Execute the statement
            console.log(stmt.getAsObject()); // Will print {nbr:5, data: Uint8Array([1,2,3]), nothing:null}
        */
        'getAsObject'(params) {
            const values = this['get'](params);
            const names  = this['getColumnNames']();
            const rowObject = {};
            for (let i = 0; i < names.length; i++) { const name = names[i]; rowObject[name] = values[i]; }
            return rowObject;
        }

        /* Shorthand for bind + step + reset
        Bind the values, execute the statement, ignoring the rows it returns, and resets it
        @param [Array,Object] Value to bind to the statement
        */
        'run'(values) {
            if (values != null) { this['bind'](values); }
            this['step']();
            return this['reset']();
        }

        // Internal methods to bind values to parameters
        // @private
        // @nodoc
        bindString(string, pos) {
            let strptr;
            if (pos == null) { pos = this.pos++; }
            const bytes = intArrayFromString(string);
            this.allocatedmem.push(strptr = allocate(bytes, 'i8', ALLOC_NORMAL));
            this.db.handleError(sqlite3_bind_text(this.stmt, pos, strptr, bytes.length-1, 0));
            return true;
        }

        // @nodoc
        bindBlob(array, pos) {
            let blobptr;
            if (pos == null) { pos = this.pos++; }
            this.allocatedmem.push(blobptr = allocate(array, 'i8', ALLOC_NORMAL));
            this.db.handleError(sqlite3_bind_blob(this.stmt, pos, blobptr, array.length, 0));
            return true;
        }

        // @private
        // @nodoc
        bindNumber(num, pos) {
            if (pos == null) { pos = this.pos++; }
            const bindfunc = num === (num|0) ? sqlite3_bind_int : sqlite3_bind_double;
            this.db.handleError(bindfunc(this.stmt, pos, num));
            return true;
        }

        // @nodoc
        bindNull(pos) { if (pos == null) { pos = this.pos++; } return sqlite3_bind_blob(this.stmt, pos, 0,0,0) === SQLite.OK; }
        // Call bindNumber or bindString appropriatly
        // @private
        // @nodoc
        bindValue(val, pos) {
            if (pos == null) { pos = this.pos++; }
            switch (typeof val) {
                case "string": return this.bindString(val, pos);
                case "number":case "boolean": return this.bindNumber(val+0, pos);
                case "object":
                    if (val === null) { return this.bindNull(pos);
                    } else if (val.length != null) { return this.bindBlob(val, pos);
                    } else { throw `Wrong API use : tried to bind a value of an unknown type (${val}).`; }
            }
        }
        /* Bind names and values of an object to the named parameters of the statement
        @param [Object]
        @private
        @nodoc
        */
        bindFromObject(valuesObj) {
            for (let name in valuesObj) {
                const value = valuesObj[name];
                const num = sqlite3_bind_parameter_index(this.stmt, name);
                if (num !== 0) { this.bindValue(value, num); }
            }
            return true;
        }
        /* Bind values to numbered parameters
        @param [Array]
        @private
        @nodoc
        */
        bindFromArray(values) {
            for (let num = 0; num < values.length; num++) { const value = values[num]; this.bindValue(value, num+1); }
            return true;
        }

        /* Reset a statement, so that it's parameters can be bound to new values
        It also clears all previous bindings, freeing the memory used by bound parameters.
        */
        'reset'() {
            this.freemem();
            return (sqlite3_clear_bindings(this.stmt) === SQLite.OK) &&
            (sqlite3_reset(this.stmt) === SQLite.OK);
        }

        /* Free the memory allocated during parameter binding
        */
        freemem() {
            let mem;
            while ((mem = this.allocatedmem.pop())) { _free(mem); }
            return null;
        }

        /* Free the memory used by the statement
        @return [Boolean] true in case of success
        */
        'free'() {
            this.freemem();
            const res = sqlite3_finalize(this.stmt) === SQLite.OK;
            delete this.db.statements[this.stmt];
            this.stmt = NULL;
            return res;
        }
    }

    // Represents an SQLite database
    class Database {
        // Open a new database either by creating a new one or opening an existing one,
        // stored in the byte array passed in first argument
        // @param data [Array<Integer>] An array of bytes representing an SQLite database file
        constructor(data) {
            this.filename = `dbfile_${(0xffffffff*Math.random())>>>0}`;
            if (data) { createDataFile('/', this.filename, data, true, true); }
            this.handleError(sqlite3_open(this.filename, apiTemp));
            this.db = getValue(apiTemp, 'i32');
            RegisterExtensionFunctions(this.db);
            this.statements = {}; // A list of all prepared statements of the database
        }

        /* Execute an SQL query, ignoring the rows it returns.

        @param sql [String] a string containing some SQL text to execute
        @param params [Array] (*optional*) When the SQL statement contains placeholders, you can pass them in here. They will be bound to the statement before it is executed.

        If you use the params argument, you **cannot** provide an sql string that contains several
        queries (separated by ';')

        @example Insert values in a table
            db.run("INSERT INTO test VALUES (:age, :name)", {':age':18, ':name':'John'});

        @return [Database] The database object (useful for method chaining)
        */
        'run'(sql, params) {
            if (!this.db) { throw "Database closed"; }
            if (params) {
                const stmt = this['prepare'](sql, params);
                stmt['step']();
                stmt['free']();
            } else {
                this.handleError(sqlite3_exec(this.db, sql, 0, 0, apiTemp));
            }
            return this;
        }

        /* Execute an SQL query, and returns the result.

        This is a wrapper against Database.prepare, Statement.step, Statement.get,
        and Statement.free.

        The result is an array of result elements. There are as many result elements
        as the number of statements in your sql string (statements are separated by a semicolon)

        Each result element is an object with two properties:
            'columns' : the name of the columns of the result (as returned by Statement.getColumnNames())
            'values' : an array of rows. Each row is itself an array of values

        *# Example use
        We have the following table, named *test* :

        | id | age |  name  |
        |:--:|:---:|:------:|
        | 1  |  1  | Ling   |
        | 2  |  18 | Paul   |
        | 3  |  3  | Markus |


        We query it like that:
        ```javascript
        var db = new SQL.Database();
        var res = db.exec("SELECT id FROM test; SELECT age,name FROM test;");
        ```

        `res` is now :
        ```javascript
            [
                {columns: ['id'], values:[[1],[2],[3]]},
                {columns: ['age','name'], values:[[1,'Ling'],[18,'Paul'],[3,'Markus']]}
            ]
        ```

        @param sql [String] a string containing some SQL text to execute
        @return [Array<QueryResults>] An array of results.
        */
        'exec'(sql) {
            if (!this.db) { throw "Database closed"; }

            const stack = stackSave();
            // Store the SQL string in memory. The string will be consumed, one statement
            // at a time, by sqlite3_prepare_v2_sqlptr.
            // Allocate at most 4 bytes per UTF8 char, +1 for the trailing '\0'
            let nextSqlPtr = stackAlloc(sql.length<<(2 + 1));
            const lengthBytes = lengthBytesUTF8(sql) + 1;
            stringToUTF8(sql, nextSqlPtr, lengthBytes);
            // Used to store a pointer to the next SQL statement in the string
            const pzTail = stackAlloc(4);

            const results = [];
            while (getValue(nextSqlPtr,'i8') !== NULL) {
                setValue(apiTemp, 0, 'i32');
                setValue(pzTail, 0, 'i32');
                this.handleError(sqlite3_prepare_v2_sqlptr(this.db, nextSqlPtr, -1, apiTemp, pzTail));
                const pStmt = getValue(apiTemp, 'i32'); //  pointer to a statement, or null
                nextSqlPtr = getValue(pzTail, 'i32');
                if (pStmt === NULL) { continue; } // Empty statement
                const stmt = new Statement(pStmt, this);
                let curresult = null;
                while (stmt['step']()) {
                if (curresult === null) {
                    curresult = {
                    'columns' : stmt['getColumnNames'](),
                    'values' : []
                    };
                    results.push(curresult);
                }
                curresult['values'].push(stmt['get']());
                }
                stmt['free']();
            }
            stackRestore(stack);
            return results;
        }

        /* Execute an sql statement, and call a callback for each row of result.

        **Currently** this method is synchronous, it will not return until the callback has
        been called on every row of the result. But this might change.

        @param sql [String] A string of SQL text. Can contain placeholders that will be
        bound to the parameters given as the second argument
        @param params [Array<String,Number,null,Uint8Array>] (*optional*) Parameters to bind
        to the query
        @param callback [Function(Object)] A function that will be called on each row of result
        @param done [Function] A function that will be called when all rows have been retrieved

        @return [Database] The database object. Useful for method chaining

        @example Read values from a table
            db.each("SELECT name,age FROM users WHERE age >= $majority",
                            {$majority:18},
                            function(row){console.log(row.name + " is a grown-up.")}
                        );
        */
        'each'(sql, params, callback, done) {
            if (typeof params === 'function') {
                done = callback;
                callback = params;
                params = undefined;
            }
            const stmt = this['prepare'](sql, params);
            while (stmt['step']()) {
            callback(stmt['getAsObject']());
            }
            stmt['free']();
            if (typeof done === 'function') { return done(); }
        }

        /* Prepare an SQL statement
        @param sql [String] a string of SQL, that can contain placeholders ('?', ':VVV', ':AAA', '@AAA')
        @param params [Array] (*optional*) values to bind to placeholders
        @return [Statement] the resulting statement
        @throw [String] SQLite error
        */
        'prepare'(sql, params) {
            setValue(apiTemp, 0, 'i32');
            this.handleError(sqlite3_prepare_v2(this.db, sql, -1, apiTemp, NULL));
            const pStmt = getValue(apiTemp, 'i32'); //  pointer to a statement, or null
            if (pStmt === NULL) { throw 'Nothing to prepare'; }
            const stmt = new Statement(pStmt, this);
            if (params != null) { stmt.bind(params); }
            this.statements[pStmt] = stmt;
            return stmt;
        }

        /* Exports the contents of the database to a binary array
        @return [Uint8Array] An array of bytes of the SQLite3 database file
        */
        'export'() {
            for (let _ in this.statements) { const stmt = this.statements[_]; stmt['free'](); }
            this.handleError(sqlite3_close_v2(this.db));
            const binaryDb = readFile(this.filename, { encoding: "binary" });
            this.handleError(sqlite3_open(this.filename, apiTemp));
            this.db = getValue(apiTemp, 'i32');
            return binaryDb;
        }

        /* Close the database, and all associated prepared statements.

        The memory associated to the database and all associated statements
        will be freed.

        **Warning**: A statement belonging to a database that has been closed cannot
        be used anymore.

        Databases **must** be closed, when you're finished with them, or the
        memory consumption will grow forever
        */
        'close'() {
            for (let _ in this.statements) { const stmt = this.statements[_]; stmt['free'](); }
            this.handleError(sqlite3_close_v2(this.db));
            unlink(`/${this.filename}`);
            return this.db = null;
        }

        /* Analyze a result code, return null if no error occured, and throw
        an error with a descriptive message otherwise
        @nodoc
        */
        handleError(returnCode) {
            if (returnCode === SQLite.OK) {
                return null;
            } else {
                const errmsg = sqlite3_errmsg(this.db);
                throw new Error(errmsg);
            }
        }

        /* Returns the number of rows modified, inserted or deleted by the
        most recently completed INSERT, UPDATE or DELETE statement on the
        database Executing any other type of SQL statement does not modify
        the value returned by this function.

        @return [Number] the number of rows modified
        */
        'getRowsModified'() { return sqlite3_changes(this.db); }

        /* Register a custom function with SQLite
        @example Register a simple function
            db.create_function("addOne", function(x) {return x+1;})
            db.exec("SELECT addOne(1)") // = 2

        @param name [String] the name of the function as referenced in SQL statements.
        @param func [Function] the actual function to be executed.
        */
        'create_function'(name, func) {
            const wrapped_func = function(cx, argc, argv) {
                // Parse the args from sqlite into JS objects
                const args = [];
                for (let i = 0, end = argc, asc = 0 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
                    const value_ptr = getValue(argv+(4*i), 'i32');
                    var value_type = sqlite3_value_type(value_ptr);
                    const data_func = (() => { switch (false) {
                        case value_type !== 1: return sqlite3_value_int;
                        case value_type !== 2: return sqlite3_value_double;
                        case value_type !== 3: return sqlite3_value_text;
                        case value_type !== 4: return function(ptr) {
                            const size = sqlite3_value_bytes(ptr);
                            const blob_ptr = sqlite3_value_blob(ptr);
                            const blob_arg = new Uint8Array(size);
                            for (let j = 0, end1 = size, asc1 = 0 <= end1; asc1 ? j < end1 : j > end1; asc1 ? j++ : j--) { blob_arg[j] = HEAP8[blob_ptr+j]; }
                            return blob_arg;
                        };
                        default: return ptr => null;
                    } })();

                    const arg = data_func(value_ptr);
                    args.push(arg);
                }

                // Invoke the user defined function with arguments from SQLite
                const result = func.apply(null, args);

                // Return the result of the user defined function to SQLite
                if (!result) {
                    return sqlite3_result_null(cx);
                } else {
                    switch (typeof(result)) {
                        case 'number': return sqlite3_result_double(cx, result);
                        case 'string': return sqlite3_result_text(cx, result, -1, -1);
                    }
                }
            };

            // Generate a pointer to the wrapped, user defined function, and register with SQLite.
            const func_ptr = addFunction(wrapped_func);
            this.handleError(sqlite3_create_function_v2(this.db, name, func.length, SQLite.UTF8, 0, func_ptr, 0, 0, 0));
            return this;
        }
    }
    function __range__(left, right, inclusive) {
        let range = [];
        let ascending = left < right;
        let end = !inclusive ? right : ascending ? right + 1 : right - 1;
        for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
            range.push(i);
        }
        return range;
    }

    return {
        Statement,
        Database
    }
};