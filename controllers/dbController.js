const scrapeSchedule = require("../model/scrapeSchedule");
const scrapeReport = require("../model/scrapeReport");
const controlScraper = require("../model/controlScraper");
const jobsToProcess = require("../model/jobsToProcess");

exports.getJobsToProcess = async (req, res, next) => {
  try {
    const jobsToProcessObj = await jobsToProcess.getData();
    res.status(200).json(jobsToProcessObj);
  } catch (error) {
    console.error("Error getting jobs to process:", error);
    res.status(500).json({ message: "Error getting jobs to process" });
  }
};

exports.insertJobToProcess = async (req, res, next) => {
  try {
    const jobToProcess = new jobsToProcess(req.body);
    await jobToProcess.insertData();
    res.status(200).json({ message: "Job inserted successfully" });
  } catch (error) {
    console.error("Error inserting job to process:", error);
    res.status(500).json({ message: "Error inserting job to process" });
  }
};

exports.updateJobToProcess = async (req, res, next) => {
  try {
    const jobToProcess = new jobsToProcess(req.body);
    await jobToProcess.updateData();
    res.status(200).json({ message: "Job updated successfully" });
  } catch (error) {
    console.error("Error updating job to process:", error);
    res.status(500).json({ message: "Error updating job to process" });
  }
};

exports.getLatestJobToProcess = async (req, res, next) => {
  try {
    const latestJobToProcess = await jobsToProcess.getLatestRecord();
    res.status(200).json(latestJobToProcess);
  } catch (error) {
    console.error("Error getting latest job to process:", error);
    res.status(500).json({ message: "Error getting latest job to process" });
  }
};

exports.getScrapeReport = async (req, res, next) => {
  var scrapeReportOutput = await scrapeReport.getData();
  res.status(200).json({ scrapeReportOutput });
};

exports.jobsToProcess = async (req, res, next) => {
  var jobsToProcessObj = await jobsToProcess.getData();
  res.status(200).json(jobsToProcessObj);
};

exports.insertJobToProcess = async (req, res, next) => {
  var jobToProcessObj = new jobsToProcess(req.body);
  jobsToProcessObj = await jobToProcessObj.insertData();
  res.status(200).json({ jobsToProcessObj });
};

exports.updateJobById = async (req, res, next) => {
  var resBody = req.body;
  for (var id of resBody) {
    var jobId = id["JobId"];
    await jobsToProcess.updateById(jobId);
  }
  res.status(200).json("Ok.");
};

exports.getScrapeState = async (req, res, next) => {
  var scrapeState = await scrapeReport.getScrapeState();
  res.status(200).json({ IsDone: "", Timestamp: "", ActionToTake: scrapeState, Body: "" });
};

exports.getLogs = async (req, res, next) => {
  var [logs, _] = await scrapeReport.getApplicationLogs();
  res.status(200).json({ logs });
};

exports.getScrapeLogs = async (req, res, next) => {
  var [logs, _] = await scrapeReport.getScrapeLogs();
  res.status(200).json({ logs });
};

exports.insertScrapeReport = async (req, res, next) => {
  var scrapeReportObj = new scrapeReport(req.body);
  scrapeReportObj = await scrapeReportObj.insertData();
  res.send(scrapeReportObj);
};

exports.controlScrape = async (req, res, next) => {
  var command = req.params.command;
  var funcResult = await controlScraper.executeCommand(command);
  res.status(200).send(funcResult);
};

exports.getScrapeSchedule = async (req, res, next) => {
  var [allSchedule, _] = await scrapeSchedule.findAll();
  res.status(200).json(allSchedule);
};

exports.getScrapeScheduleById = async (req, res, next) => {
  var paramId = req.params.id;
  var [schedule, _] = await scrapeSchedule.findById(paramId);
  res.status(200).json({ data: schedule });
};

exports.getScrapeScheduleByScrapeId = async (req, res, next) => {
  var paramId = req.params.id;
  var [schedule, _] = await scrapeSchedule.findByScrapeId(paramId);
  res.status(200).json({ data: schedule });
};

exports.getScrapeScheduleByTitle = async (req, res, next) => {
  var paramId = req.params.title;
  var [schedule, _] = await scrapeSchedule.findByTitle(paramId);
  res.status(200).json({ data: schedule });
};

exports.updateById = async (req, res, next) => {
  var schedule = new scrapeSchedule(req.body);
  schedule = await schedule.updateById(schedule.ScrapeId);
  res.send(schedule);
};

exports.createScrapeSchedule = async (req, res, next) => {
  var schedule = new scrapeSchedule(req.body);
  schedule = await schedule.insertToDb();
  res.send(schedule);
};

exports.deleteById = async (req, res, next) => {
  var id = req.params.id;
  var [deleteQueryResult, _] = await scrapeSchedule.deleteById(id);
  res.status(200).send(deleteQueryResult);
};
