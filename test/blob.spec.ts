import createSql, { Database } from "../src";

describe("Blob", () => {
    let db: Database;
    // eslint-disable
    let SQL;

    beforeAll(async () => {
        SQL = await createSql();
        db = new SQL.Database();
    });

    it("Can write a blob to the database", () => {
        db.exec("CREATE TABLE test (data); INSERT INTO test VALUES (x'6162ff'),(x'00')"); // Insert binary data. This is invalid UTF8 on purpose
    });

    it("Can read blob from the database", () => {
        const insertStatement = db.prepare("INSERT INTO test VALUES (?)");
        const bigArray = new Uint8Array(1e6);
        bigArray[500] = 0x42;
        insertStatement.run([bigArray]);

        const selectStatement = db.prepare("SELECT * FROM test ORDER BY length(data) DESC");

        selectStatement.step();
        const array = selectStatement.get()[0];
        expect(array.length).toBe(bigArray.length);
        for(let i = 0; i < array.length; i += 1) {
            // Avoid doing 1e6 assert, to not pollute the console
            if(array[i] !== bigArray[i]) {
                // The blob stored in the database should be exactly the same as the one that was inserted
                expect(array[i]).toBe(bigArray[i]);
            }
        }

        selectStatement.step();
        const readResponse = selectStatement.get();
        // Reading BLOB
        expect(readResponse).toEqual([new Uint8Array([0x61, 0x62, 0xff])]);

        selectStatement.step();
        const res = selectStatement.get();
        // Reading BLOB with a null byte
        expect(res).toEqual([new Uint8Array([0x00])]);

        // stmt.step() should return false after all values were read
        expect(selectStatement.step()).toBe(false);
    });

    afterAll(() => {
        db.close();
    });
});