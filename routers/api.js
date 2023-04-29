var express = require("express");
var router = express.Router();
var dbControllers = require("../controllers/dbController");

router.get("/jobsToProcess", dbControllers.getJobsToProcess);
router.post("/jobsToProcess", dbControllers.insertJobToProcess);
router.put("/jobsToProcess/:guid", dbControllers.updateJobToProcess);
router.get("/jobsToProcess/latest", dbControllers.getLatestJobToProcess);

router.route("/scrapeState").get(dbControllers.getScrapeState);
router.route("/scrapeReport").get(dbControllers.getScrapeReport).post(dbControllers.insertScrapeReport);
router.route("/getApplicationLogs").get(dbControllers.getLogs);
router.route("/getScrapeLogs").get(dbControllers.getScrapeLogs);
router.route("/controlScrape/:command").post(dbControllers.controlScrape);
router.route("/scrapeSchedule").get(dbControllers.getScrapeSchedule).post(dbControllers.createScrapeSchedule);
router.route("/scrapeSchedule/:id").delete(dbControllers.deleteById);
router.route("/scrapeSchedule/getById/:id").get(dbControllers.getScrapeScheduleById);
router.route("/scrapeSchedule/getByScrapeId/:id").get(dbControllers.getScrapeScheduleByScrapeId);
router.route("/scrapeSchedule/getByTitle/:title").get(dbControllers.getScrapeScheduleByTitle);
router.route("/scrapeSchedule/update").post(dbControllers.updateById);

module.exports = router;