/* eslint-disable */

export interface QueryResults {
    columns: string[];
    values: any[][];
}

type Param = string | number | Uint8Array | null;

export declare class Statement {
    // eslint-disable-next-line
    constructor(stmt: any, db: Database);
    bind(values: any): boolean;
    step(): boolean;
    get(params?: any): Param[];
    getColumnNames(): string[];
    getAsObject(params?: any): any;
    run(values: any): void;
    reset(): void;
    freemem(): void;
    free(): boolean;
}

export declare class Database {
    // eslint-disable-next-line
    constructor(data?: number[]);
    run(sql: string, params?: any[]): Database;
    exec(sql: string): QueryResults[];
    each(sql: string, params: Param[], callback: (row: any) => void, done: () => void): Database;
    prepare(sql: string, params?: any[]): Statement;
    export(): Uint8Array;
    close(): void;
    handleError(returnCode: any): {};
    getRowsModified(): number;
    // eslint-disable-next-line
    create_function(name: string, func: Function): void;
}

export declare interface SQLWasm {
    Statement: typeof Statement,
    Database: typeof Database
};