import createApi, { Database } from "../src";

describe("Extension Functions", () => {
    let db: Database;

    beforeAll(async () => {
        const sql = await createApi();
        db = new sql.Database();
        db.exec("CREATE TABLE test (str_data, data);");

        db.run("INSERT INTO test VALUES ('Hello World!', 1);");
        db.run("INSERT INTO test VALUES ('', 2);");
        db.run("INSERT INTO test VALUES ('', 2);");
        db.run("INSERT INTO test VALUES ('', 4);");
        db.run("INSERT INTO test VALUES ('', 5);");
        db.run("INSERT INTO test VALUES ('', 6);");
        db.run("INSERT INTO test VALUES ('', 7);");
        db.run("INSERT INTO test VALUES ('', 8);");
        db.run("INSERT INTO test VALUES ('', 9);");
    });

    it("mode() function works", () => {
        const res = db.exec("SELECT mode(data) FROM test;");
        const expectedResult = [{
            columns: ["mode(data)"],
            values: [
                [2]
            ]
        }];
        expect(res).toEqual(expectedResult);
    });

    it("lower_quartile() function works", () => {
        const res = db.exec("SELECT lower_quartile(data) FROM test;");
        const expectedResult = [{
            columns: ["lower_quartile(data)"],
            values: [
                [2]
            ]
        }];
        expect(res).toEqual(expectedResult);
    });

    it("upper_quartile() function works", () => {
        const res = db.exec("SELECT upper_quartile(data) FROM test;");
        const expectedResult = [{
            columns: ["upper_quartile(data)"],
            values: [
                [7]
            ]
        }];
        expect(res).toEqual(expectedResult);
    });

    it("upper_quartile() function works", () => {
        const res = db.exec("SELECT upper_quartile(data) FROM test;");
        const expectedResult = [{
            columns: ["upper_quartile(data)"],
            values: [
                [7]
            ]
        }];
        expect(res).toEqual(expectedResult);
    });

    it("variance() function works", () => {
        const res = db.exec("SELECT variance(data) FROM test;");
        expect(res[0].values[0][0].toFixed(2)).toEqual("8.11");
    });

    it("stdev() function works", () => {
        const res = db.exec("SELECT stdev(data) FROM test;");
        expect(res[0].values[0][0].toFixed(2)).toEqual("2.85");
    });

    it("acos() function works", () => {
        const res = db.exec("SELECT acos(data) FROM test;");
        expect(res[0].values[0][0].toFixed(2)).toEqual("0.00");
    });

    it("asin() function works", () => {
        const res = db.exec("SELECT asin(data) FROM test;");
        expect(res[0].values[0][0].toFixed(2)).toEqual("1.57");
    });

    it("atan2() function works", () => {
        const res = db.exec("SELECT atan2(data, 1) FROM test;");
        expect(res[0].values[0][0].toFixed(2)).toEqual("0.79");
    });

    it("difference() function works", () => {
        const res = db.exec("SELECT difference(str_data, 'ello World!') FROM test;");
        expect(res[0].values[0][0]).toEqual(3);
    });

    it("ceil() function works", () => {
        const res = db.exec("SELECT ceil(4.1)");
        expect(res[0].values[0][0]).toEqual(5);
    });

    it("floor() function works", () => {
        const res = db.exec("SELECT floor(4.1)");
        expect(res[0].values[0][0]).toEqual(4);
    });

    it("pi() function works", () => {
        const res = db.exec("SELECT pi()");
        expect(res[0].values[0][0].toFixed(5)).toEqual("3.14159");
    });

    it("reverse() function works", () => {
        const res = db.exec("SELECT reverse(str_data) FROM test;");
        expect(res[0].values[0][0]).toBe("!dlroW olleH");
    });

    afterAll(() => {
        db.close();
    });
});