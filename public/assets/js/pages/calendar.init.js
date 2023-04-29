/*
Template Name: Minible - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Calendar init js
*/

!function ($) {
    "use strict";
    var CalendarPage = function () { };
    CalendarPage.prototype.init = async function () {

        var addEvent = $("#event-modal");
        var modalTitle = $("#modal-title");
        var formEvent = $("#form-event");
        var selectedEvent = null;
        var newEventData = null;
        var forms = document.getElementsByClassName('needs-validation');
        var newEventData = null;
        var eventObject = null;
        /* initialize the calendar */

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        var Draggable = FullCalendarInteraction.Draggable;
        var externalEventContainerEl = document.getElementById('external-events');
        // init dragable
        new Draggable(externalEventContainerEl, {
            itemSelector: '.external-event',
            eventData: function (eventEl) {
                return {
                    title: eventEl.innerText,
                    className: $(eventEl).data('class')
                };
            }
        });

        let scrapeSchedule;
        await $.ajax({ 'url': location.origin + '/api/scrapeSchedule', "method": "GET", success: function (res) { scrapeSchedule = res; } });
        var defaultEvents = [];
        var threeMonthsFutureDate = new Date(date.setMonth(date.getMonth() + 3));
        var hourToSet=0;
        for (const schedule of scrapeSchedule) {
            var maxJobRuns = schedule.MaximumJobRuns;
            var hoursToWaitBetweenRuns = schedule.HoursToWaitBetweenRuns;
            var weekday = schedule.WeekdaysToRun;
            var hexColor = schedule.HexColor;
            var title = `${schedule["ScrapeRegion"]} – ${schedule["InputCity"]}`;
            var startDate = schedule["MinimumStartDate"] || new Date();
            var endDate = schedule["MaximumStartDate"] || threeMonthsFutureDate;
            startDate = new Date(startDate);
            endDate = new Date(endDate);

            for (var d = startDate, e = 0; d <= endDate; e++) {
                var canAdd = true;
                if (maxJobRuns && maxJobRuns.length > 0 && e >= maxJobRuns) {
                    break;
                }

                if (weekday && weekday.length > 0) {
                    if ((weekday.includes(d.toLocaleString("en-US", { weekday: "long" }))) == false) {
                        canAdd = false;
                    }
                }

                if (canAdd) {
                    var startDateParam = new Date(d);
                    var nextDateParam = new Date(d);
                    startDateParam.setHours(hourToSet);
                    nextDateParam.setHours(hourToSet+1);
                  
                    // Check if startDateParam and nextDateParam fall on the same day after the hour is added
                    if (startDateParam.getDate() === nextDateParam.getDate()) {
                      // If they fall on the same day, use the original nextDateParam with hour added
                      defaultEvents.push({
                        hexColor: hexColor,
                        title: title,
                        start: startDateParam,
                        end: nextDateParam,
                        className: 'bg-info'
                      });
                    } else {
                      // If they fall on different days, add only one second to nextDateParam
                      nextDateParam = new Date(startDateParam.getTime() + 1000); // Add one second
                      defaultEvents.push({
                        hexColor: hexColor,
                        title: title,
                        start: startDateParam,
                        end: nextDateParam,
                        className: 'bg-info'
                      });
                    }
                  }
                  
                if (hoursToWaitBetweenRuns && hoursToWaitBetweenRuns.length > 0 && hoursToWaitBetweenRuns != "0") {
                    d.setHours(d.getHours() + parseInt(hoursToWaitBetweenRuns));
                }
                else d.setDate(d.getDate() + 1);
            }
            hourToSet++;
            if(hourToSet >24)hourToSet=0;
        }
        console.log(defaultEvents);

        var draggableEl = document.getElementById('external-events');
        var calendarEl = document.getElementById('calendar');

        function addNewEvent(info) {
            addEvent.modal('show');
            formEvent.removeClass("was-validated");
            formEvent[0].reset();

            $("#event-title").val();
            $('#event-category').val();
            modalTitle.text('Add Scrape Schedule');
            newEventData = info;
        }


        var calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: ['bootstrap', 'interaction', 'dayGrid', 'timeGrid'],
            editable: true,
            droppable: true,
            selectable: true,
            defaultView: 'dayGridMonth',
            themeSystem: 'bootstrap',
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
            },
            eventClick: async function (info) {
                addEvent.modal('show');
                formEvent[0].reset();
                selectedEvent = info.event;
                let scrapeSchedule;
                await $.ajax({ 'url': location.origin + '/api/scrapeSchedule/getByTitle/' + selectedEvent.title, "method": "GET", success: function (res) { scrapeSchedule = res; } });
                var directJson = scrapeSchedule["data"][0];
                $("#scrape-Region").val(directJson["ScrapeRegion"]);
                $("#scrape-City").val(directJson["InputCity"]);
                $("#hoursToPass").val(directJson["HoursToWaitBetweenRuns"]);
                $("#minStartDate").val(directJson["MinimumStartDate"]);                
                $("#maxStartDate").val(directJson["MaximumStartDate"]);
                $("#selectWeekdayValue")[0].innerText = directJson["WeekdaysToRun"];
                $("#maxJobRuns").val(directJson["MaximumJobRuns"]);
                $("#selectedScrapeSourceVal")[0].innerText = directJson["ScrapeSource"];
                $("#adultParam").val(directJson["AdultParam"]);
                $("#nightsOfStay").val(directJson["NightsOfStayParam"]);
                $("#scrapePosition").val(directJson["ScrapePosition"]);
                $("#scrapeId").val(directJson["ScrapeId"]);
                $('#event-category').val(selectedEvent.classNames[0]);
                newEventData = null;
                modalTitle.text('Edit Scrape Schedule');

                if($("#selectWeekdayValue")[0].innerText == ''){
                    $("#selectWeekdayValue")[0].innerText ="default";
                }
            },
            dateClick: function (info) {
                addNewEvent(info);
            },
            events: defaultEvents
        });
        calendar.render();

        /*Add new event*/
        // Form to add new event

        $(formEvent).on('submit', async function (ev) {
            ev.preventDefault();
            var inputs = $('#form-event :input');
            var scrapeRegion = $("#scrape-Region").val();
            var scrapeCity = $("#scrape-City").val();
            var hoursToPass = $("#hoursToPass").val();
            var weekdaysToRun = $("#selectWeekdayValue")[0].innerText;
            var minStartDate = $("#minStartDate").val();
            var maxStartDate = $("#maxStartDate").val();
            var maxJobRuns = $("#maxJobRuns").val();
            var scrapeSource = $("#selectedScrapeSourceVal")[0].innerText;
            var adultParam = $("#adultParam").val();
            var nightsOfStay = $("#nightsOfStay").val();
            var scrapePosition = $("#scrapePosition").val();
            var scrapeId = $("#scrapeId").val();
            var title = `${scrapeRegion} – ${scrapeCity}`

            if(weekdaysToRun == 'default'){
                weekdaysToRun ='';
            }

            //var updatedTitle = $("#event-title").val();
            var updatedCategory = $('#event-category').val();

            // validation
            if (forms[0].checkValidity() === false) {
                event.preventDefault();
                event.stopPropagation();
                forms[0].classList.add('was-validated');
            } else {
                if (selectedEvent) {
                    selectedEvent.setProp("scrapeRegion", scrapeRegion);
                    selectedEvent.setProp("scrapeCity", scrapeCity);
                    selectedEvent.setProp("hoursToPass", hoursToPass);
                    selectedEvent.setProp("weekdaysToRun", weekdaysToRun);
                    selectedEvent.setProp("minStartDate", minStartDate);
                    selectedEvent.setProp("maxStartDate", maxStartDate);
                    selectedEvent.setProp("maxJobRuns", maxJobRuns);
                    selectedEvent.setProp("scrapeSource", scrapeSource);
                    selectedEvent.setProp("adultParam", adultParam);
                    selectedEvent.setProp("nightsOfStay", nightsOfStay);
                    selectedEvent.setProp("scrapePosition", scrapePosition);
                    selectedEvent.setProp("scrapeId", scrapeId);
                    selectedEvent.setProp("classNames", [updatedCategory]);

                    let scrapeSchedule;
                    await $.ajax({ 'url': location.origin + '/api/scrapeSchedule/getByTitle/' + selectedEvent.title, "method": "GET", success: function (res) { scrapeSchedule = res; } });
                    var directJson = scrapeSchedule["data"][0];
                    var settings = {
                        'url': location.origin + '/api/scrapeSchedule/update',
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({
                            "ScrapeRegion": scrapeRegion,
                            "InputCity": scrapeCity,
                            "HoursToWaitBetweenRuns": hoursToPass,
                            "WeekdaysToRun": weekdaysToRun,
                            "MinimumStartDate": minStartDate,
                            "MaximumStartDate": maxStartDate,
                            "MaximumJobRuns": maxJobRuns,
                            "ScrapeSource": scrapeSource,
                            "AdultParam": adultParam,
                            "NightsOfStayParam": nightsOfStay,
                            "ScrapePosition": scrapePosition,
                            "ScrapeId": directJson["ScrapeId"]
                        }),
                    };

                    await $.ajax(settings).done(function (response) { });
                    location.reload();

                } else {
                    //var newEvent = {
                    //    title: title,
                    //    start: newEventData.date,
                    //    allDay: newEventData.allDay,
                    //    className: updatedCategory
                    //}
                    //calendar.addEvent(newEvent);
                    scrapeId = Date.now();

                    var buttonColors = ["#50a5f1", "#f19350", "#f15050", "#509ff1", "#505cf1", "#ac50f1", "#4a1c34", "#2e1c4a", "#1d1c4a", "#203b56", "#205656", "#205638", "#375620", "#562020", "#4a76c7"];
                    var randomHexColor = buttonColors[Math.floor(Math.random() * buttonColors.length)];

                    var settings = {
                        'url': location.origin + '/api/scrapeSchedule',
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Content-Type": "application/json"
                        },
                        "data": JSON.stringify({
                            "ScrapeRegion": scrapeRegion,
                            "InputCity": scrapeCity,
                            "HoursToWaitBetweenRuns": hoursToPass,
                            "WeekdaysToRun": weekdaysToRun,
                            "MinimumStartDate": minStartDate,
                            "MaximumStartDate": maxStartDate,
                            "MaximumJobRuns": maxJobRuns,
                            "ScrapeSource": scrapeSource,
                            "AdultParam": adultParam,
                            "NightsOfStayParam": nightsOfStay,
                            "ScrapePosition": scrapePosition,
                            "ScrapeId": scrapeId,
                            "HexColor": randomHexColor
                        }),
                    };

                    await $.ajax(settings).done(function (response) { });
                    location.reload();
                }
                addEvent.modal('hide');
            }
        });

        $("#btn-delete-event").on('click', async function (e) {
            if (selectedEvent) {
                var title = selectedEvent.title;
                selectedEvent.remove();
                selectedEvent = null;
                addEvent.modal('hide');
                let scrapeSchedule;
                await $.ajax({ 'url': location.origin + '/api/scrapeSchedule/getByTitle/' + title, "method": "GET", success: function (res) { scrapeSchedule = res; } });
                var directJson = scrapeSchedule["data"][0];
                await $.ajax({ 'url': location.origin + '/api/scrapeSchedule/' + directJson["ScrapeId"], "method": "DELETE", success: function (res) { } });
                location.reload();
            }
        });

        $("#btn-new-event").on('click', function (e) {
            addNewEvent({ date: new Date(), allDay: true });
            location.reload();
        });

    },
        //init
        $.CalendarPage = new CalendarPage, $.CalendarPage.Constructor = CalendarPage
}(window.jQuery),

    //initializing 
    function ($) {
        "use strict";
        $.CalendarPage.init()
    }(window.jQuery);