var db = require("../config/db");
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const Enumerable = require('linq');
const { count } = require("console");
 

module.exports = async function () {
    let tablesToHave =
        [{ "TableName": "ScrapeSchedule", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/ScrapeSchedule.txt", 'utf8') },
        { "TableName": "RunningScrapesReport", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/RunningScrapesReport.txt", 'utf8') },
        { "TableName": "ScrapeLog", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/ScrapeLog.txt", 'utf8') },
        { "TableName": "Log", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/Log.txt", 'utf8') },
        { "TableName": "ScrapeControl", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/ScrapeControl.txt", 'utf8') },
        { "TableName": "JobsToProcess", "CreationScript": fs.readFileSync(path.resolve() + "/controllers/CreateTableScripts/JobsToProcess.txt", 'utf8') }
        ];
    var [tablesThatExist, _] = await db.execute(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${process.env.DB_NAME}';`);
    var tablesToCreate = [];
    if (tablesThatExist.length > 0) {
        var tblsToRemove = Enumerable.from(tablesThatExist).select(x => x["TABLE_NAME"].toLowerCase()).toArray();
        if (tblsToRemove.length > 0) {
            tablesToCreate = Enumerable.from(tablesToHave).select(x => x["TableName"].toLowerCase()).toArray().filter(function (item) {
                return !tblsToRemove.includes(item);
            });
        }
        else tablesToCreate = Enumerable.from(tablesToHave).select(x => x["TableName"].toLowerCase()).toArray();
    }
    else tablesToCreate = Enumerable.from(tablesToHave).select(x => x["TableName"].toLowerCase()).toArray();
    for (const table of tablesToCreate) {
        var tableObj = table.toLowerCase();
        await db.execute(Enumerable.from(tablesToHave).where(x => x["TableName"].toLowerCase() == tableObj).toArray()[0]["CreationScript"]);
        if (tableObj == "scrapecontrol") {
            await db.execute(`INSERT INTO ${tableObj}(ScrapeStatus) VALUES('ScrapeIsStopped')`);
        }
        else if (tableObj == "runningscrapesreport") {
            await db.execute(`INSERT INTO ${tableObj}(IsScrapeRunning) VALUES('False')`);
        }
        else if (tableObj == "log") {
            await db.execute(`INSERT INTO ${tableObj}(Timestamp,Text) VALUES('${new Date().toLocaleString('default', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '')}','Dashboard started.')`);
        }
    }
}