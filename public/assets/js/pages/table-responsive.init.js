/*
Template Name: Minible - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Table responsive Init Js File
*/

$(async function () {
    var currentURL = location.href;
    if (currentURL.includes("application-log")) {
        var logs;
        await $.ajax({ 'url': location.origin + '/api/getApplicationLogs', "method": "GET", success: function (res) { logs = res["logs"]; } });
        var logRows = [];
        for (const log of logs) {
            var row = `
            <tr>
            <th>${log.Profile}</span></th>
            <td>${log.Timestamp}</td>
            <td>${log.Text}</td>
            <td>${log.LogLevel}</td>
            <td>${log.Parameters}</td>
            <td>${log.RequestBody}</td>
            <td>${log.Response}</td>
            <td>${log.Status}</td>
            <td>${log.ErrorContext}</td>
            </tr>`;
            logRows.push(row);
        }
        document.getElementById("logRows").innerHTML = logRows.join("");
    }
    else if (currentURL.includes("scrape-log")) {
        var logs;
        var scrapeSchedule;
        await $.ajax({ 'url': location.origin + '/api/getScrapeLogs', "method": "GET", success: function (res) { logs = res["logs"]; } });
        await $.ajax({ 'url': location.origin + '/api/scrapeSchedule', "method": "GET", success: function (res) { scrapeSchedule = res; } });
        var logRows = [];
        for (const log of logs) {
          var filteredScrapeSchedule = scrapeSchedule.filter(x => x.ScrapeId === log.ScrapeId);
          var scrapeRegion = filteredScrapeSchedule.length > 0 ? filteredScrapeSchedule[0].ScrapeRegion : '';
          var inputCity = filteredScrapeSchedule.length > 0 ? filteredScrapeSchedule[0].InputCity : '';
          var nightsOfStayParam = filteredScrapeSchedule.length > 0 ? filteredScrapeSchedule[0].NightsOfStayParam : '';
          var adultParam = filteredScrapeSchedule.length > 0 ? filteredScrapeSchedule[0].AdultParam : '';
          var row = `
          <tr>
            <th>${log.ScrapeStart_Timestamp}</span></th>
            <td>${log.ScrapeEnd_Timestamp}</td>
            <td>${log.ScrapeRuntimeInHours}</td>
            <td>${scrapeRegion}</td>
            <td>${inputCity}</td>
            <td>${nightsOfStayParam}</td>
            <td>${adultParam}</td>
            <td>${log.ScrapeId}</td>
          </tr>`;
          logRows.push(row);
        }
        document.getElementById("logRows").innerHTML = logRows.join("");
        

    }

});