const db = require("../config/db");

class JobsToProcess {
  constructor(reqBody) {
    this.Timestamp = reqBody.Timestamp;
    this.Guid = reqBody.Guid;
    this.Url = reqBody.Url;
    this.IsCompleted = reqBody.IsCompleted;
    this.OutputHTML = reqBody.OutputHTML;
  }

  static async getData() {
    try {
      const [jobsToProcess, _] = await db.execute(
        "SELECT * FROM jobstoprocess WHERE IsCompleted = ?",
        [0]
      );
      return jobsToProcess;
    } catch (error) {
      console.error("Error getting jobs to process:", error);
      return [];
    }
  }

  async insertData() {
    try {
      await db.execute(
        "INSERT INTO jobstoprocess(Timestamp, Guid, Url, IsCompleted, OutputHTML) VALUES (?, ?, ?, ?, ?)",
        [
          this.Timestamp,
          this.Guid,
          this.Url,
          this.IsCompleted,
          this.OutputHTML,
        ]
      );
    } catch (error) {
      console.error("Error inserting job to process:", error);
    }
  }

  async updateData() {
    try {
      await db.execute(
        "UPDATE jobstoprocess SET Timestamp = ?, Url = ?, IsCompleted = ?, OutputHTML = ? WHERE Guid = ?",
        [
          this.Timestamp,
          this.Url,
          this.IsCompleted,
          this.OutputHTML,
          this.Guid
        ]
      );
    } catch (error) {
      console.error("Error updating job to process:", error);
    }
  }

  static async getLatestRecord() {
    try {
      const [latestRecord, _] = await db.execute(
        "SELECT * FROM jobstoprocess WHERE IsCompleted = '1' AND LENGTH(OutputHTML) > 2 ORDER BY ID DESC LIMIT 1"
      );
      return latestRecord[0];
    } catch (error) {
      console.error("Error getting latest record:", error);
      return null;
    }
  }
  
}

module.exports = JobsToProcess;
