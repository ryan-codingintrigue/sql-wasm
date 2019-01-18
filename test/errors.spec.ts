import createApi from "../src";

describe("Errors", () => {
    it("Throws an error when querying an invalid database", async () => {
        const sql = await createApi();
        const db = new sql.Database([1, 2, 3]);
        expect(() => {
            db.exec("SELECT * FROM sqlite_master");
        }).toThrow();
        db.close();
    });

    it("Throws an error for invalid SQL", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        expect(() => {
            db.exec("I ain't be no valid sql ...");
        }).toThrow();
        db.close();
    });

    it("Throws an error when inserting two rows with the same primary key", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        db.exec("CREATE TABLE test (a INTEGER PRIMARY KEY, b, c, d, e);");
        expect(() => {
            db.run("INSERT INTO test (a) VALUES (1)");
            db.run("INSERT INTO test (a) VALUES (1)");
        }).toThrow();
        db.close();
    });

    it("Throws an error when binding too many parameters in a prepared statement", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        db.exec("CREATE TABLE test (a INTEGER PRIMARY KEY, b, c, d, e);");
        const stmt = db.prepare("INSERT INTO test (a) VALUES (?)");
        expect(() => {
            stmt.bind([1, 2, 3]);
        }).toThrow();
        db.close();
    });

    it("Throws an error when trying to create a table that already exists", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        db.exec("CREATE TABLE test (a INTEGER PRIMARY KEY, b, c, d, e);");
        expect(() => {
            db.run("CREATE TABLE test (this,wont,work)");
        }).toThrow();
        db.close();
    });

    it("Previous errors should not have spoiled the statement", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        db.exec("CREATE TABLE test (a INTEGER PRIMARY KEY, b, c, d, e);");
        const stmt = db.prepare("INSERT INTO test (a) VALUES (?)");
        try {
            stmt.bind([1, 2, 3]);
        } catch(e) {
            // Don't care about this
        }
        stmt.run([2]);
        const results = db.exec("SELECT a,b FROM test WHERE a=2");
        expect(results).toBeInstanceOf(Array);
        expect(results[0]).toMatchObject({ columns: ["a", "b"], values: [[2, null]] });
        db.close();
    });

    it("Throws an error when trying to execute against an already closed database", async () => {
        const sql = await createApi();
        const db = new sql.Database();
        db.close();
        expect(() => {
            db.exec("SELECT a,b FROM test WHERE a=2");
        }).toThrow();
    });
});