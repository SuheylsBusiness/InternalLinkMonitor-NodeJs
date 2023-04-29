var db = require("../config/db");
var moment = require("moment");
var mysql = require('mysql');

class ScrapeReport {
    constructor(reqBody) {
        this.RunningScrapesReport = reqBody.RunningScrapesReport;
        this.PastScrapes = reqBody.PastScrapes;
        this.Logs = reqBody.Logs;
    }
    static async getApplicationLogs() {
        var logs = await db.execute(`SELECT * FROM log ORDER BY id DESC LIMIT 100`);
        return logs;
    }
    static async getScrapeLogs() {
        var logs = await db.execute(`SELECT * FROM scrapelog ORDER BY id DESC`);
        return logs;
    }
    static async getScrapeState() {
        var [scrapeStatus, _] = await db.execute(`SELECT ScrapeStatus FROM scrapecontrol ORDER BY id DESC Limit 1`);
        scrapeStatus = scrapeStatus[0].ScrapeStatus;
        return scrapeStatus;
    }
    static async getData() {
        var [runningScrapesData, _] = await db.execute(`SELECT * FROM runningscrapesreport ORDER BY id DESC LIMIT 2`);
        var outputObj = {
            "activeScrape": "Bot not running.",
            "scrapeProgress": "-",
            "totalScrapeCount": "0",
            "lastSyncTimestamp": "-",
            "recentActivity": "",
            "nextScrape": "",
            "previousScrape": "",
            "scrapeIdRunning": "",
            "controlScraper": ""
        };

        if (runningScrapesData.length > 1) {
            runningScrapesData = runningScrapesData[0];
            if (runningScrapesData.Timestamp == "None" || runningScrapesData.Timestamp == "null" || runningScrapesData.Timestamp.length < 1) {
                var [queryResult, _] = await db.execute(`SELECT * FROM runningscrapesreport WHERE LENGTH(Timestamp) > 10 ORDER BY id DESC LIMIT 1`);
                if (queryResult.length > 0) {
                    runningScrapesData.Timestamp = queryResult[0].Timestamp;
                }
            }

            let t1 = moment(runningScrapesData.Timestamp, "MM/DD/YYYY h:mm:ss AM/PM").toDate();
            console.log(runningScrapesData.Timestamp);
            var t2 = new Date();
            var dif = t1.getTime() - t2.getTime();
            var Seconds_Between_Dates = Math.abs(dif / 1000);
            outputObj.lastSyncTimestamp = Math.round(Seconds_Between_Dates) + " sec. ago";

            if (runningScrapesData.IsScrapeRunning == "True") {
                outputObj.activeScrape = `${runningScrapesData.RegionThatIsRunning} – ${runningScrapesData.CityThatIsRunning}`;                
                outputObj.scrapeIdRunning = runningScrapesData.ScrapeId;
                if(runningScrapesData.ScrapeProgress == "-")runningScrapesData.ScrapeProgress="Calculating...";
                outputObj.scrapeProgress = runningScrapesData.ScrapeProgress;
            }
        }
        var [queryResults, _] = await db.execute(`SELECT COUNT(id) AS COUNT FROM scrapelog`);
        outputObj.totalScrapeCount = queryResults[0].COUNT;


        var [scrapeSchedule, _] = await db.execute(`SELECT * FROM scrapeschedule`);
        for (var i = 0; i < scrapeSchedule.length; i++) {
            var title = `${scrapeSchedule[i].ScrapeRegion} – ${scrapeSchedule[i].InputCity}`;

            if (scrapeSchedule[i].ScrapeId == outputObj.scrapeIdRunning) {
                try { outputObj.nextScrape = `<span class="text-info me-1"><i class="mdi mdi-arrow-down-bold me-1"></i>Next Scrape:</span> ${scrapeSchedule[i + 1].ScrapeRegion} – ${scrapeSchedule[i + 1].InputCity}`; } catch (error) { }
                try { outputObj.previousScrape = `<span class="text-success me-1"><i class="mdi mdi-arrow-up-bold me-1"></i>Previous Scrape:</span> ${scrapeSchedule[i - 1].ScrapeRegion} – ${scrapeSchedule[i - 1].InputCity}`; } catch (error) { }
                break;
            }
        }

        var [scrapeLog, _] = await db.execute(`SELECT * FROM log ORDER BY id DESC Limit 10`);
        var feedItem = [];
        for (var logItem of scrapeLog) {
            feedItem.push(`
                    <li class="feed-item">
                        <p class="text-muted mb-1 font-size-13">${logItem.Timestamp}</p>
                        <p class="mt-0 mb-0">${logItem.Text}</p>
                    </li>
                `);
        }
        outputObj.recentActivity = feedItem.join("");

        var [scrapeStatus, _] = await db.execute(`SELECT ScrapeStatus FROM scrapecontrol ORDER BY id DESC Limit 1`);
        scrapeStatus = scrapeStatus[0].ScrapeStatus;
        if (scrapeStatus == "ScrapeIsRunning") {
            outputObj.controlScraper = `
                <button type="button" class="btn btn-warning waves-effect waves-light" id="pauserScraper">Pause Scraper</button>
                <button type="button" class="btn btn-danger waves-effect waves-light" id="stopScraper">Stop Scraper</button>
                `;
        }
        else if (scrapeStatus == "ScrapeIsPaused") {
            outputObj.controlScraper = `
                <button type="button" class="btn btn-primary waves-effect waves-light" id="resumeScraper">Resume Scraper</button>
                `;
        }
        else if (scrapeStatus == "ScrapeIsStopped") {
            outputObj.controlScraper = `
                <button type="button" class="btn btn-success waves-effect waves-light" id="startScraper">Start Scraper</button>
                `;
        }
        return outputObj;
    }
    async insertData() {
        if (this.RunningScrapesReport.IsScrapeRunning != "ScrapeIsPaused") {
            await db.execute(`
            INSERT INTO runningscrapesreport(
                Timestamp,
                IsScrapeRunning,
                ScrapeStartTimestamp,
                RegionThatIsRunning,
                CityThatIsRunning,
                ScrapeProgress,
                ScrapeId
            )
            VALUES(
                '${this.RunningScrapesReport.Timestamp}',
                '${this.RunningScrapesReport.IsScrapeRunning}',
                '${this.RunningScrapesReport.ScrapeStartTimestamp}',
                '${this.RunningScrapesReport.RegionThatIsRunning}',
                '${this.RunningScrapesReport.CityThatIsRunning}',
                '${this.RunningScrapesReport.ScrapeProgress}',
                '${this.RunningScrapesReport.ScrapeId}'
            )`);
        }
        for (const scrape of this.PastScrapes) {
            await db.execute(`
                INSERT INTO scrapelog(
                    ScrapeStart_Timestamp,
                    ScrapeEnd_Timestamp,
                    ScrapeRuntimeInHours,
                    ScrapeId
                )
                VALUES(
                    '${scrape.ScrapeStart_Timestamp}',
                    '${scrape.ScrapeEnd_Timestamp}',
                    '${scrape.ScrapeRuntimeInHours}',
                    '${scrape.ScrapeId}'
                )`);
        }
        for (const scrape of this.Logs) {
            await db.execute(`
                INSERT INTO log(
                    Profile,
                    Timestamp,
                    Text,
                    LogLevel,
                    Parameters,
                    RequestBody,
                    Response,
                    Status,
                    ErrorContext
                )
                VALUES(
                    ${mysql.escape(scrape.Profile)},
                    ${mysql.escape(scrape.Timestamp)},
                    ${mysql.escape(scrape.Text)},
                    ${mysql.escape(scrape.LogLevel)},
                    ${mysql.escape(scrape.Parameters)},
                    ${mysql.escape(scrape.RequestBody)},
                    ${mysql.escape(scrape.Response)},
                    ${mysql.escape(scrape.Status)},
                    ${mysql.escape(scrape.ErrorContext)}
                )`);
        }

        return "True";
    }
}

module.exports = ScrapeReport;