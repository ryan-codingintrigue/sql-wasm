import createSql, { Database } from "../src";

describe("Database", () => {
    let db: Database;

    beforeEach(async () => {
        // Create a database
        const SQL = await createSql();
        db = new SQL.Database();
    });

    it("Database Tests", async () => {
        // Execute some sql
        let sqlstr = "CREATE TABLE test (a, b, c, d, e);";
        let res = db.exec(sqlstr);
        expect(res).toEqual([]);

        db.run("INSERT INTO test VALUES (NULL, 42, 4.2, 'fourty two', x'42');");

        // Retrieving values
        sqlstr = "SELECT * FROM test;";
        res = db.exec(sqlstr);
        const expectedResult = [{
            columns: ["a", "b", "c", "d", "e"],
            values: [
                [null, 42, 4.2, "fourty two", new Uint8Array([0x42])]
            ]
        }];
        expect(res).toEqual(expectedResult);


        // Export the database to an Uint8Array containing the SQLite database file
        const binaryArray = db.export();
        // The first 6 bytes of an SQLite database should form the word 'SQLite'
        expect(String.fromCharCode.apply(null, binaryArray.subarray(0, 6))).toBe("SQLite");
        db.close();

        const SQL = await createSql();
        const db2 = new SQL.Database(binaryArray);
        const result = db2.exec("SELECT * FROM test");
        // Exporting and re-importing the database should lead to the same database
        expect(result).toEqual(expectedResult);
        db2.close();

        db = new SQL.Database();
        // Newly created databases should be empty
        expect(db.exec("SELECT * FROM sqlite_master")).toEqual([]);
        // Testing db.each
        db.run("CREATE TABLE test (a,b); INSERT INTO test VALUES (1,'a'),(2,'b')");
        let count = 0;

        await new Promise(resolve => {
            db.each("SELECT * FROM test ORDER BY a", row => {
                count += 1;
                if(count === 1) {
                    // db.each returns the correct 1st row
                    expect(row).toMatchObject({ a: 1, b: "a" });
                }
                if(count === 2) {
                    // db.each returns the correct 2nd row
                    expect(row).toMatchObject({ a: 2, b: "b" });
                }
            }, () => {
                // db.each returns the right number of rows
                expect(count).toBe(2);
                resolve();
            });
        });
    });
});