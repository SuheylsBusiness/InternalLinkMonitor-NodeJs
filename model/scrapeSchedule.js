var db = require("../config/db");
const jobsToProcess = require("../model/jobsToProcess");

class ScrapeSchedule{
    constructor(reqBody){
        this.ScrapeRegion = reqBody.ScrapeRegion;
        this.InputCity = reqBody.InputCity;
        this.HoursToWaitBetweenRuns = reqBody.HoursToWaitBetweenRuns;
        this.WeekdaysToRun = reqBody.WeekdaysToRun;
        this.MinimumStartDate = reqBody.MinimumStartDate;
        this.MaximumStartDate = reqBody.MaximumStartDate;
        this.MaximumJobRuns = reqBody.MaximumJobRuns;
        this.ScrapeSource = reqBody.ScrapeSource;
        this.AdultParam = reqBody.AdultParam;
        this.NightsOfStayParam = reqBody.NightsOfStayParam;
        this.ScrapePosition = reqBody.ScrapePosition;
        this.ScrapeId = reqBody.ScrapeId;
        this.HexColor = reqBody.HexColor;
    }

    async insertToDb(){
        let sql = `
        INSERT INTO scrapeschedule(
            ScrapeRegion,
            InputCity,
            HoursToWaitBetweenRuns,
            WeekdaysToRun,
            MinimumStartDate,
            MaximumStartDate,
            MaximumJobRuns,
            ScrapeSource,
            AdultParam,
            NightsOfStayParam,
            ScrapePosition,
            ScrapeId,
            HexColor
        )
        VALUES(
            '${this.ScrapeRegion}',
            '${this.InputCity}',
            '${this.HoursToWaitBetweenRuns}',
            '${this.WeekdaysToRun}',
            '${this.MinimumStartDate}',
            '${this.MaximumStartDate}',
            '${this.MaximumJobRuns}',
            '${this.ScrapeSource}',
            '${this.AdultParam}',
            '${this.NightsOfStayParam}',
            '${this.ScrapePosition}',
            '${this.ScrapeId}',
            '${this.HexColor}'
        )
        `;

        const [newScrapeSchedule,_] = await db.execute(sql);

        var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":"AddRegion","Timestamp":new Date(),"JobId":Date.now(),"Body":this});
        jobToProcessObj.insertData();

        return newScrapeSchedule;
    }
    async updateById(id){

        let sql = `UPDATE scrapeschedule SET ` +
        `ScrapeRegion = '${this.ScrapeRegion}',` +
        `InputCity = '${this.InputCity}',` +
        `HoursToWaitBetweenRuns = '${this.HoursToWaitBetweenRuns}',` +
        `WeekdaysToRun = '${this.WeekdaysToRun}',` +
        `MinimumStartDate = '${this.MinimumStartDate}',` +
        `MaximumStartDate = '${this.MaximumStartDate}',` +
        `MaximumJobRuns = '${this.MaximumJobRuns}',` +
        `ScrapeSource = '${this.ScrapeSource}',` +
        `AdultParam = '${this.AdultParam}',` +
        `NightsOfStayParam = '${this.NightsOfStayParam}',` +
        `ScrapePosition = '${this.ScrapePosition}',` +
        `HexColor = '${this.HexColor}'` +
        `WHERE ScrapeId = '${id}'`;

        const [newScrapeSchedule,_] = await db.execute(sql);

        var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":"UpdateRegion","Timestamp":new Date(),"JobId":Date.now(),"Body":this});
        jobToProcessObj.insertData();

        return newScrapeSchedule;
    }
    static deleteById(id){
        let sql = `DELETE FROM scrapeschedule WHERE ScrapeId = ${id}`;        

        var jobToProcessObj = new jobsToProcess({ "IsDone":"0","ActionToTake":"RemoveRegion","Timestamp":new Date(),"JobId":Date.now(),"Body":{"Id":id}});
        jobToProcessObj.insertData();

        return db.execute(sql);
    }
    static findById(id){
        let sql =`SELECT * FROM scrapeschedule WHERE id = ${id}`;

        return db.execute(sql);
    }
    static findByScrapeId(id){
        let sql =`SELECT * FROM scrapeschedule WHERE ScrapeId = ${id}`;

        return db.execute(sql);
    }
    static findByTitle(title){
        var tempList = title.split("–");
        let sql =`SELECT * FROM scrapeschedule WHERE ScrapeRegion = '${tempList[0].trim()}' AND InputCity = '${tempList[1].trim()}'`;

        return db.execute(sql);
    }
    static findAll(){
        let sql =`SELECT * FROM scrapeschedule`;

        return db.execute(sql);
    }
}

module.exports = ScrapeSchedule;