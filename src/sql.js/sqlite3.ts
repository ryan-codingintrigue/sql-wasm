/* eslint-disable camelcase */

export default (module: any) => {
    const sqlite3_open = module.cwrap("sqlite3_open", "number", ["string", "number"]);
    const sqlite3_close_v2 = module.cwrap("sqlite3_close_v2", "number", ["number"]);
    const sqlite3_exec = module.cwrap("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]);
    const sqlite3_free = module.cwrap("sqlite3_free", "", ["number"]);
    const sqlite3_changes = module.cwrap("sqlite3_changes", "number", ["number"]);

    // Prepared statements
    // prepare
    const sqlite3_prepare_v2 = module.cwrap("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]);
    // Version of sqlite3_prepare_v2 to which a pointer to a string that is already
    // in memory is passed.
    const sqlite3_prepare_v2_sqlptr = module.cwrap("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]);

    // Bind parameters

    // int sqlite3_bind_text(sqlite3_stmt*, int, const char*, int n, void(*)(void*));
    // We declare const char* as a number, because we will manually allocate the memory and pass a pointer to the function
    const sqlite3_bind_text = module.cwrap("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]);
    const sqlite3_bind_blob = module.cwrap("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]);
    // int sqlite3_bind_double(sqlite3_stmt*, int, double);
    const sqlite3_bind_double = module.cwrap("sqlite3_bind_double", "number", ["number", "number", "number"]);
    // int sqlite3_bind_double(sqlite3_stmt*, int, int);
    const sqlite3_bind_int = module.cwrap("sqlite3_bind_int", "number", ["number", "number", "number"]);
    // int sqlite3_bind_parameter_index(sqlite3_stmt*, const char *zName);
    const sqlite3_bind_parameter_index = module.cwrap("sqlite3_bind_parameter_index", "number", ["number", "string"]);

    // Get values
    // int sqlite3_step(sqlite3_stmt*)
    const sqlite3_step = module.cwrap("sqlite3_step", "number", ["number"]);
    const sqlite3_errmsg = module.cwrap("sqlite3_errmsg", "string", ["number"]);
    // int sqlite3_data_count(sqlite3_stmt *pStmt);
    const sqlite3_data_count = module.cwrap("sqlite3_data_count", "number", ["number"]);
    const sqlite3_column_double = module.cwrap("sqlite3_column_double", "number", ["number", "number"]);
    const sqlite3_column_text = module.cwrap("sqlite3_column_text", "string", ["number", "number"]);
    const sqlite3_column_blob = module.cwrap("sqlite3_column_blob", "number", ["number", "number"]);
    const sqlite3_column_bytes = module.cwrap("sqlite3_column_bytes", "number", ["number", "number"]);
    const sqlite3_column_type = module.cwrap("sqlite3_column_type", "number", ["number", "number"]);
    // const char *sqlite3_column_name(sqlite3_stmt*, int N);
    const sqlite3_column_name = module.cwrap("sqlite3_column_name", "string", ["number", "number"]);
    // int sqlite3_reset(sqlite3_stmt *pStmt);
    const sqlite3_reset = module.cwrap("sqlite3_reset", "number", ["number"]);
    const sqlite3_clear_bindings = module.cwrap("sqlite3_clear_bindings", "number", ["number"]);
    // int sqlite3_finalize(sqlite3_stmt *pStmt);
    const sqlite3_finalize = module.cwrap("sqlite3_finalize", "number", ["number"]);

    // Create custom functions
    const sqlite3_create_function_v2 = module.cwrap("sqlite3_create_function_v2", "number", ["number", "string", "number", "number", "number", "number", "number", "number", "number"]);
    const sqlite3_value_type = module.cwrap("sqlite3_value_type", "number", ["number"]);
    const sqlite3_value_bytes = module.cwrap("sqlite3_value_bytes", "number", ["number"]);
    const sqlite3_value_text = module.cwrap("sqlite3_value_text", "string", ["number"]);
    const sqlite3_value_int = module.cwrap("sqlite3_value_int", "number", ["number"]);
    const sqlite3_value_blob = module.cwrap("sqlite3_value_blob", "number", ["number"]);
    const sqlite3_value_double = module.cwrap("sqlite3_value_double", "number", ["number"]);
    const sqlite3_result_double = module.cwrap("sqlite3_result_double", "", ["number", "number"]);
    const sqlite3_result_null = module.cwrap("sqlite3_result_null", "", ["number"]);
    const sqlite3_result_text = module.cwrap("sqlite3_result_text", "", ["number", "string", "number", "number"]);
    const RegisterExtensionFunctions = module.cwrap("RegisterExtensionFunctions", "number", ["number"]);

    return {
        sqlite3_open,
        sqlite3_close_v2,
        sqlite3_exec,
        sqlite3_free,
        sqlite3_changes,
        sqlite3_prepare_v2,
        sqlite3_prepare_v2_sqlptr,
        sqlite3_bind_text,
        sqlite3_bind_blob,
        sqlite3_bind_double,
        sqlite3_bind_int,
        sqlite3_bind_parameter_index,
        sqlite3_step,
        sqlite3_errmsg,
        sqlite3_data_count,
        sqlite3_column_double,
        sqlite3_column_text,
        sqlite3_column_blob,
        sqlite3_column_bytes,
        sqlite3_column_type,
        sqlite3_column_name,
        sqlite3_reset,
        sqlite3_clear_bindings,
        sqlite3_finalize,
        sqlite3_create_function_v2,
        sqlite3_value_type,
        sqlite3_value_bytes,
        sqlite3_value_text,
        sqlite3_value_int,
        sqlite3_value_blob,
        sqlite3_value_double,
        sqlite3_result_double,
        sqlite3_result_null,
        sqlite3_result_text,
        RegisterExtensionFunctions
    };
};