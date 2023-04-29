/*
Template Name: Minible - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Table editable Init Js File
*/

// table edits table

$(async function () {
    var scrapeSchedule;
    await $.ajax({ 'url': location.origin + '/api/scrapeSchedule', "method": "GET", success: function (res) { scrapeSchedule = res; } });
    var scrapeScheduleRows = [];
    var i =1;
    for (const schedule of scrapeSchedule) {
        var row = `
        <tr data-id="${i}"> 
            <td data-field="ScrapeRegion">${schedule.ScrapeRegion}</td>
            <td data-field="InputCity">${schedule.InputCity}</td>
            <td data-field="HoursToWaitBetweenRuns">${schedule.HoursToWaitBetweenRuns}</td>
            <td data-field="WeekdaysToRun">${schedule.WeekdaysToRun}</td>
            <td data-field="MinimumStartDate">${schedule.MinimumStartDate}</td>
            <td data-field="MaximumStartDate">${schedule.MaximumStartDate}</td>
            <td data-field="MaximumJobRuns">${schedule.MaximumJobRuns}</td>
            <td data-field="ScrapeSource">${schedule.ScrapeSource}</td>
            <td data-field="AdultParam">${schedule.AdultParam}</td>
            <td data-field="NightsOfStayParam">${schedule.NightsOfStayParam}</td>
            <td id="scrapeId">${schedule.ScrapeId}</td>
            <td style="width: 100px">
                <a class="btn btn-outline-secondary btn-sm edit" title="Edit">
                    <i class="fas fa-pencil-alt"></i>
                </a>
            </td>
            <td style="width: 100px">
                <a class="btn btn-outline-secondary btn-sm delete" title="Delete" deleteId="${schedule.ScrapeId}">
                    <i class="uil-ban"></i>
                </a>
            </td>
        </tr>`;
        scrapeScheduleRows.push(row);
        i++;
    }
    document.getElementById("scrapeScheduleRows").innerHTML = scrapeScheduleRows.join("");

    $('.delete').click(async function(values){
        var scrapeId = values.currentTarget.attributes.deleteid.nodeValue;
        await $.ajax({ 'url': location.origin + '/api/scrapeSchedule/' + scrapeId, "method": "DELETE", success: function (res) { location.reload(); } });
        location.reload();
    });

    var pickers = {};
    $('.table-edits tr').editable({
        edit: function (values) {
            $(".edit i", this)
                .removeClass('fa-pencil-alt')
                .addClass('fa-save')
                .attr('title', 'Save');
        },
        save: async function (values) {
            $(".edit i", this)
                .removeClass('fa-save')
                .addClass('fa-pencil-alt')
                .attr('title', 'Edit');

            let scrapeScheduleToEdit;
            console.log(values);
            var settings = {
                'url': location.origin + '/api/scrapeSchedule/update',
                "method": "POST",
                "timeout": 0,
                "headers": {
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({
                    "ScrapeRegion": values.ScrapeRegion,
                    "InputCity": values.InputCity,
                    "HoursToWaitBetweenRuns": values.HoursToWaitBetweenRuns,
                    "WeekdaysToRun": values.WeekdaysToRun,
                    "MinimumStartDate": values.MinimumStartDate,
                    "MaximumStartDate": values.MaximumStartDate,
                    "MaximumJobRuns": values.MaximumJobRuns,
                    "ScrapeSource": values.ScrapeSource,
                    "AdultParam": values.AdultParam,
                    "NightsOfStayParam": values.NightsOfStayParam,
                    "ScrapePosition": values.ScrapePosition,
                    "ScrapeId": $(this).find("#scrapeId")[0].innerText
                }),
            };

            await $.ajax(settings).done(function (response) { });
            location.reload();

            if (this in pickers) {
                pickers[this].destroy();
                delete pickers[this];
            }
        },
        cancel: function (values) {
            $(".edit i", this)
                .removeClass('fa-save')
                .addClass('fa-pencil-alt')
                .attr('title', 'Edit');

            if (this in pickers) {
                pickers[this].destroy();
                delete pickers[this];
            }
        }
    });
});

