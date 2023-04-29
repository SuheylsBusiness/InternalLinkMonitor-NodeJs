var db = require("../config/db");
var scrapeReportObj = require("../model/scrapeReport");
const jobsToProcess = require("../model/jobsToProcess");

class ControlScraper {
    constructor() {
    }
    static async executeCommand(command) {
        if (command == "PauseScraper") {
            var [runningScrapesData,_] = await db.execute(`SELECT * FROM runningscrapesreport ORDER BY id DESC LIMIT 1`);
            runningScrapesData=runningScrapesData[0];
            runningScrapesData.RegionThatIsRunning = "(Paused) " + runningScrapesData.RegionThatIsRunning;
            var scrapeReport = new scrapeReportObj({ "RunningScrapesReport":runningScrapesData,"PastScrapes":[],"Logs":[] });
            scrapeReport.insertData();
            var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":command,"Timestamp":new Date(),"JobId":Date.now(),"Body":""});
            jobToProcessObj.insertData();
            await db.execute(`UPDATE scrapecontrol SET ScrapeStatus = 'ScrapeIsPaused'`);
        }
        else if (command == "ResumeScraper") {
            var [runningScrapesData,_] = await db.execute(`SELECT * FROM runningscrapesreport ORDER BY id DESC LIMIT 1`);
            runningScrapesData=runningScrapesData[0];
            runningScrapesData.RegionThatIsRunning = runningScrapesData.RegionThatIsRunning.replace("(Paused) ","");
            var scrapeReport = new scrapeReportObj({ "RunningScrapesReport":runningScrapesData ,"PastScrapes":[],"Logs":[]});
            scrapeReport.insertData();
            var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":command,"Timestamp":new Date(),"JobId":Date.now(),"Body":""});
            jobToProcessObj.insertData();
            await db.execute(`UPDATE scrapecontrol SET ScrapeStatus = 'ScrapeIsRunning'`);
        }
        else if (command == "StopScraper") {
            var [runningScrapesDataResult,_] = await db.execute(`SELECT * FROM runningscrapesreport ORDER BY id DESC LIMIT 1`);
            runningScrapesDataResult=runningScrapesDataResult[0];
            var runningScrapesData ={ 
                "IsScrapeRunning":"False",
                "Timestamp":"None",
                "ScrapeStartTimestamp":"",
                "TimeRegionThatIsRunning":"",
                "CityThatIsRunning":"",
                "ScrapeProgress":"-"
             };
             var scrapeReport = new scrapeReportObj({ "RunningScrapesReport":runningScrapesData ,"PastScrapes":[],"Logs":[]});
            scrapeReport.insertData();
            var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":command,"Timestamp":new Date(),"JobId":Date.now(),"Body":""});
            jobToProcessObj.insertData();
            await db.execute(`UPDATE scrapecontrol SET ScrapeStatus = 'ScrapeIsStopped'`);
        }
        else if (command == "StartScraper") {
            var runningScrapesData ={ 
                "IsScrapeRunning":"True",
                "Timestamp":"None",
                "ScrapeStartTimestamp":"",
                "RegionThatIsRunning":"Starting...",
                "CityThatIsRunning":"Can take up to 1 min.",
                "ScrapeProgress":"Calculating..."
             };
            var scrapeReport = new scrapeReportObj({ "RunningScrapesReport":runningScrapesData ,"PastScrapes":[],"Logs":[]});
            scrapeReport.insertData();
            var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":command,"Timestamp":new Date(),"JobId":Date.now(),"Body":""});
            jobToProcessObj.insertData();
            await db.execute(`UPDATE scrapecontrol SET ScrapeStatus = 'ScrapeIsRunning'`);
        }
    }
}

module.exports = ControlScraper;