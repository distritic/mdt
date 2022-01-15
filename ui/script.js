const mdtApp = new Vue({
    el: "#container",
    data: {
        page: "Home",
        officer: {
            name: "Guest",
            department: "police",
			rank: ''
        },
        style: {
            police: true
        },

        offenses: [],
        modal: null,
        notify: null,

        homepage: {
            button_press: 0,
            reports: false,
            warrants: false
        },
        recent_searches: {
            person: [],
            vehicle: []
        },

        report_search: "",
        report_edit: {
            enable: false,
            data: {}
        },
        report_results: {
            query: "",
            results: false
        },
        report_selected: {
            id: null,
            date: null,
            name: null,
            title: null,
            incident: null,
            charges: null,
            author: null,
            jailtime: null
        },
        report_new: {
            title: "",
            charges: {},
            charges_search: "",
            incident: "",
            name: null,
            char_id: null,
            focus: "name",
            recommended_fine: 0,
        },

        calls: {},
        current_call: {
            source: null,
            details: null,
            id: null,
            time: null,
            officers: null,
            coords: null,
            location: null
        },
        selected_call: null,
        edit_call: {
            details: "",
            index: null
        },

        offender_search: "",
        offender_results: {
            query: "",
            results: false
        },
        offender_selected: {
            firstname: null,
            lastname: null,
            notes: "",
            licenses: false,
            properties: {},
            phone_number: null,
            convictions: null,
            mugshot_url: "",
            dateofbirth: null,
            id: null,
            identifier: null,
            haswarrant: false,
            vehicles: {}
        },
        offender_changes: {
            notes: "",
            mugshot_url: "",
            licenses: [],
            licenses_removed: [],
            convictions: [],
            convictions_removed: [],
            bail: false
        },

        vehicle_search: "",
        vehicle_results: {
            query: "",
            results: false
        },
        vehicle_selected: {
            plate: null,
            type: null,
            owner: null,
            owner_id: null,
            model: null,
            color: null
        },
        edit_vehicle: {
            stolen: false,
            notes: ""
        },

        warrants: [],
        warrant_search: "",
        warrant_results: {
            query: "",
            results: {}
        },
        warrant_selected: {
            name: null,
            id: null,
            char_id: null,
            report_id: null,
            report_title: null,
            report_charges: {},
            date: null,
            expire: null,
            notes: null
        },
        warrant_new: {
            name: null,
            char_id: null,
            report_id: null,
            report_title: null,
            report_search: "",
            charges: {},
            notes: null
        }
    },
    methods: {
        changePage(page) {
            this.page = page;
            ClearActiveNavItems();
            if (page == "Home") {
                $("#home").addClass("nav-active");
            } else if (page == "Search Reports") {
                $("#search-reports").addClass("nav-active");
            } else if (page == "Search Offenders") {
                $("#search-offenders").addClass("nav-active");
            } else if (page == "Search Vehicles") {
                $("#search-vehicles").addClass("nav-active");
            } else if (page == "Warrants") {
                $.post('http://mdt/getWarrants');
                $("#warrants").addClass("nav-active");
            } else if (page == "Submit Report") {
                $("#submit-report").addClass("nav-active");
            } else if (page == "Calls") {
                $('#calls').addClass('nav-active');
                $.post('http://mdt/getCalls');
            }
        },
        closeMDT() {
            $.post('http://mdt/close', JSON.stringify({}));
        },
        getClass(element) {
            if (this.style.police) {
                return element
            } 
        },
        OffenderSearch() {
            if (this.offender_search) {

                this.offender_results.query = this.offender_search;
                $.post('http://mdt/performOffenderSearch', JSON.stringify({
                    query: this.offender_search
                }));

                this.offender_results.results = false;
                return;
            }
        },
        OpenOffenderDetails(id) {
            for (var key in this.offender_results.results) {
                if (id == this.offender_results.results[key].id) {

                    $.post('http://mdt/viewOffender', JSON.stringify({
                        offender: this.offender_results.results[key]
                    }));

                    this.modal = 'loading';

                    return;
                }
            }
        },
        SaveOffenderChanges() {
            $.post('http://mdt/saveOffenderChanges', JSON.stringify({
                changes: this.offender_changes,
                id: this.offender_selected.id,
                identifier: this.offender_selected.identifier
            }));
            this.modal = null;
            this.offender_selected.notes = this.offender_changes.notes;
            this.offender_selected.mugshot_url = this.offender_changes.mugshot_url;
            this.offender_selected.licenses = this.offender_changes.licenses;
            this.offender_selected.convictions = this.offender_changes.convictions;
            this.offender_selected.bail = this.offender_changes.bail;
            return;
        },
        ReportSearch() {
            if (this.report_search) {

                this.report_results.query = this.report_search
                this.warrant_new.report_search = this.report_search
                $.post('http://mdt/performReportSearch', JSON.stringify({
                    query: this.report_search
                }));

                this.report_results.results = false;
                this.report_selected = {
                    id: null,
                    date: null,
                    name: null,
                    title: null,
                    report: null,
                    charges: null,
                    author: null
                };
                return;
            }
        },
        AddCharge(id) {
            for (var key in this.offenses) {
                if (id == this.offenses[key].id) {
                    var offense_name = this.offenses[key].label
                    if (this.report_new.charges[offense_name]) {
                        Vue.set(this.report_new.charges, offense_name, this.report_new.charges[offense_name] + 1);
                    } else {
                        Vue.set(this.report_new.charges, offense_name, 1);
                    }

                    this.report_new.recommended_fine = this.report_new.recommended_fine + this.offenses[key].amount

                    return;
                }
            }

        },
        RemoveCharge(offense) {
            for (var key in this.report_new.charges) {
                if (offense == key) {
                    if ((this.report_new.charges[offense] - 1) > 0) {
                        Vue.set(this.report_new.charges, offense, this.report_new.charges[offense] - 1)
                    } else {
                        Vue.delete(this.report_new.charges, offense)
                    }

                    for (var key in this.offenses) {
                        if (offense == this.offenses[key].label) {
                            this.report_new.recommended_fine = this.report_new.recommended_fine - this.offenses[key].amount
                        }
                    }

                    return;
                }
            }
        },
        SubmitNewReport() {
            if (this.report_new.title && this.report_new.char_id && this.report_new.incident) {
                $.post('http://mdt/submitNewReport', JSON.stringify({
                    title: this.report_new.title,
                    char_id: this.report_new.char_id,
                    name: this.report_new.name,
                    charges: this.report_new.charges,
                    incident: this.report_new.incident,
                }));

                this.report_new.title = "";
                this.report_new.charges = {};
                this.report_new.charges_search = "";
                this.report_new.incident = "";
                this.report_new.name = null;
                this.report_new.char_id = null;
                this.report_new.focus = "name";
                this.report_new.recommended_fine = 0;
                this.offender_search = "";
                this.offender_results.query = "";
                this.offender_results.results = false;
                this.changePage("Search Reports");
                return;   
            }
        },
        OpenOffenderDetailsById(id) {
            $.post('http://mdt/getOffender', JSON.stringify({
                char_id: id
            }));

            this.modal = 'loading';
            return;
        },
        ToggleReportEdit() {
            if (this.report_edit.enable) {
                this.report_edit.enable = false;
                this.report_edit.data = {}
            } else {
                this.report_edit.enable = true;
                this.report_edit.data.title = this.report_selected.title;
                this.report_edit.data.incident = this.report_selected.incident;
            }
            return;
        },
        DeleteSelectedReport() {
            $.post('http://mdt/deleteReport', JSON.stringify({
                id: this.report_selected.id,
            }));
            this.changePage("Search Reports");
            this.report_selected = {
                id: null,
                date: null,
                name: null,
                title: null,
                report: null,
                charges: null,
                author: null
            };
            this.report_results = {
                query: "",
                results: false
            };
            this.report_search = "";
            return;
        },
        SaveReportEditChanges() {
            $.post('http://mdt/saveReportChanges', JSON.stringify({
                id: this.report_selected.id,
                title: this.report_edit.data.title,
                incident: this.report_edit.data.incident
            }));

            this.report_selected.title = this.report_edit.data.title;
            this.report_selected.incident = this.report_edit.data.incident;
            this.ToggleReportEdit();
            return;
        },
        VehicleSearch() {
            if (this.vehicle_search) {

                this.vehicle_results.query = this.vehicle_search;
                $.post('http://mdt/vehicleSearch', JSON.stringify({
                    plate: this.vehicle_search
                }));

                this.vehicle_results.results = false;
                return;
            }
        },
        OpenVehicleDetails(result) {
            $.post('http://mdt/getVehicle', JSON.stringify({
                vehicle: result
            }));

            this.modal = 'loading';
            return;
        },
        WarrantReportSearch() {
            if (this.warrant_new.report_search) {

                this.report_results.query = this.report_search
                $.post('http://mdt/performReportSearch', JSON.stringify({
                    query: this.report_search
                }));

                this.report_results.results = false;
                this.report_selected = {
                    id: null,
                    date: null,
                    name: null,
                    title: null,
                    report: null,
                    charges: null,
                    author: null
                };
                return;
            }
        },
        SubmitNewWarrant() {
            var date = new Date();
            date.setDate(date.getDate() + 7);
            $.post('http://mdt/submitNewWarrant', JSON.stringify({
                name: this.warrant_new.name,
                char_id: this.warrant_new.char_id,
                report_id: this.warrant_new.report_id,
                report_title: this.warrant_new.report_title,
                charges: this.warrant_new.charges,
                notes: this.warrant_new.notes,
                expire: date
            }));
            this.warrant_new = {
                name: null,
                char_id: null,
                report_id: null,
                report_title: null,
                report_search: "",
                charges: {},
                notes: null
            }
            this.report_results.results = false;
            this.report_results.query = "";
            return;
        },
        DeleteSelectedWarrant() {
            $.post('http://mdt/deleteWarrant', JSON.stringify({
                id: this.warrant_selected.id,
            }));
            this.warrant_selected = {
                name: null,
                id: null,
                char_id: null,
                report_id: null,
                report_title: null,
                report_charges: {},
                date: null,
                expire: null,
                notes: null
            };
            return;
        },
        OpenReportById(id) {
            $.post('http://mdt/getReport', JSON.stringify({
                id: id
            }));
            this.modal = 'loading';
            return;
        },
        RemoveLicense(license) {
            for (var key in this.offender_selected.licenses) {
                var license2 = this.offender_selected.licenses[key]
                if (license.label == license2.label) {
                    Vue.delete(this.offender_changes.licenses, key)
                    this.offender_changes.licenses_removed.push(license)
                }
            }
        },
        RemoveConviction(conviction) {
            for (var offense in this.offender_changes.convictions) {
                if (offense == conviction) {
                    if ((this.offender_changes.convictions[offense] - 1) > 0) {
                        Vue.set(this.offender_changes.convictions, offense, this.offender_changes.convictions[offense] - 1)
                    } else {
                        Vue.delete(this.offender_changes.convictions, offense)
                        this.offender_changes.convictions_removed.push(offense)
                    }
                }
            }
        },
        AttachToCall(index) {
            $.post('http://mdt/attachToCall', JSON.stringify({
                index: index,
                coords: this.calls[index].coords
            }));
            this.current_call = this.calls[index]
            return;
        },
        DetachFromCall(index) {
            $.post('http://mdt/detachFromCall', JSON.stringify({
                index: index
            }));
            this.current_call = {
                source: null,
                details: null,
                id: null,
                time: null,
                officers: null,
                coords: null,
                location: null
            }
            return;
        },
        SetCallWaypoint(index) {
            $.post('http://mdt/setCallWaypoint', JSON.stringify({
                coords: this.calls[index].coords
            }));
            return;
        },
        ShowCallDetails(index) {
            this.modal = "call_details";
            this.selected_call = index;
            return;
        },
        EditCall(index){
            this.modal = 'edit_call';
            this.edit_call.details = this.current_call.details;
            this.edit_call.index = index;
            return;
        },
        SaveEditCall() {
            $.post('http://mdt/editCall', JSON.stringify({
                index: this.edit_call.index,
                details: this.edit_call.details
            }));
            this.modal = null;
            this.edit_call.details = "";
            this.edit_call.index = null;
            return;
        },
        DeleteCall(index) {
            $.post('http://mdt/deleteCall', JSON.stringify({
                index: index
            }));
            return;
        },
        showNotification(message) {
            this.notify = message;
            $('#notification').show('fast', 'swing');
            setTimeout(function(){
                $('#notification').hide('fast', 'swing');
            }, 2500);
            return;
        },
        SaveVehicleEditChanges() {
            $.post('http://mdt/saveVehicleChanges', JSON.stringify({
                plate: this.vehicle_selected.plate,
                stolen: this.edit_vehicle.stolen,
                notes: this.edit_vehicle.notes
            }))

            this.vehicle_selected.stolen = this.edit_vehicle.stolen;
            this.vehicle_selected.notes = this.edit_vehicle.notes;
            this.edit_vehicle = {
                stolen: false,
                notes: ""
            };
            this.modal = null;
            return;
        },
        attached: function(index) {
            return Object.keys(this.calls[index].officers).length
        }
    },
    computed: {
        filtered_offenses() {
            return this.offenses.filter(offense => {
                if (
                    offense.label.toLowerCase().search(this.report_new.charges_search.toLowerCase()) != -1
                    )
                    return offense;
            })
        },
        filtered_warrants() {
            return this.warrants.filter(warrant => {
                if (
                    warrant.name.toLowerCase().search(this.warrant_search.toLowerCase()) != -1
                    )
                    return warrant;
            })
        }
    }
});

$("#home").addClass("nav-active");

document.onreadystatechange = () => {
    if (document.readyState === "complete") {
        window.addEventListener('message', function(event) {
            if (event.data.type == "enable") {
                document.body.style.display = event.data.isVisible ? "block" : "none";
            } else if (event.data.type == "returnedPersonMatches") {
                mdtApp.offender_results.results = event.data.matches;
            } else if (event.data.type == "returnedOffenderDetails") {
                mdtApp.offender_selected = event.data.details;
                mdtApp.offender_results.results = false;
                mdtApp.offender_results.query = "";
                mdtApp.offender_changes.notes = mdtApp.offender_selected.notes;
                mdtApp.offender_changes.mugshot_url = mdtApp.offender_selected.mugshot_url;
                mdtApp.offender_changes.licenses = mdtApp.offender_selected.licenses;
                mdtApp.offender_changes.licenses_removed = [];
                mdtApp.offender_changes.convictions = mdtApp.offender_selected.convictions;
                mdtApp.offender_changes.convictions_removed = [];
                mdtApp.offender_changes.bail = mdtApp.offender_selected.bail;
                mdtApp.offender_search = mdtApp.offender_selected.firstname + " " + mdtApp.offender_selected.lastname;
                mdtApp.changePage("Search Offenders");

                mdtApp.recent_searches.person.unshift(event.data.details);
                if (mdtApp.recent_searches.person.length > 3) {
                    Vue.delete(mdtApp.recent_searches.person, 3)
                }

                mdtApp.modal = null;
            } else if (event.data.type == "offensesAndOfficerLoaded") {
                mdtApp.offenses = event.data.offenses;
                mdtApp.officer.name = event.data.name;
            } else if (event.data.type == "returnedReportMatches") {
                mdtApp.report_results.results = event.data.matches;
            } else if (event.data.type == "returnedVehicleMatches") {
                mdtApp.vehicle_results.results = event.data.matches;
                mdtApp.vehicle_selected = {
                    plate: null,
                    type: null,
                    owner: null,
                    owner_id: null,
                    model: null,
                    color: null
                };
            } else if (event.data.type == "returnedVehicleDetails") {
                mdtApp.vehicle_selected = event.data.details;
                mdtApp.vehicle_search = mdtApp.vehicle_selected.plate;

                mdtApp.recent_searches.vehicle.unshift(event.data.details);
                if (mdtApp.recent_searches.vehicle.length > 3) {
                    Vue.delete(mdtApp.recent_searches.vehicle, 3)
                }
                mdtApp.changePage("Search Vehicles");

                mdtApp.modal = null;
            } else if (event.data.type == "returnedVehicleMatchesInFront") {
                mdtApp.vehicle_results.results = event.data.matches;
                mdtApp.vehicle_results.query = event.data.plate;
                mdtApp.vehicle_search = event.data.plate;
                mdtApp.vehicle_selected = {
                    plate: null,
                    type: null,
                    owner: null,
                    owner_id: null,
                    model: null,
                    color: null
                };
                mdtApp.changePage("Search Vehicles");
            } else if (event.data.type == "returnedWarrants") {
                mdtApp.warrants = event.data.warrants;
            } else if (event.data.type == "completedWarrantAction") {
                mdtApp.changePage("Warrants");
            } else if (event.data.type == "returnedReportDetails") {
                mdtApp.changePage("Search Reports");
                mdtApp.report_selected = event.data.details;

                mdtApp.modal = null;
            } else if (event.data.type == "recentReportsAndWarrantsLoaded") {
                mdtApp.homepage.reports = event.data.reports;
                mdtApp.homepage.warrants = event.data.warrants;
                mdtApp.officer.name = event.data.officer;
				mdtApp.officer.rank = event.data.rank + ' ';
                if (mdtApp.officer.department != event.data.department) {
                    mdtApp.officer.department = event.data.department;
                    if (event.data.department == 'police') {
                        mdtApp.style.police = true;
                    }
                }
            } else if (event.data.type == "sendNotification") {
                mdtApp.showNotification(event.data.message);
            } else if (event.data.type == "newCall") {
                var today = new Date();
                var time = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var call = {
                    source: event.data.source,
                    id: event.data.id,
                    details: event.data.details,
                    coords: event.data.coords,
                    location: event.data.location,
                    time: time,
                    officers: []
                }
                Vue.set(mdtApp.calls, event.data.id, call)
            } else if (event.data.type == "newCallAttach") {
                mdtApp.calls[event.data.call].officers.push(event.data.charname)
            } else if (event.data.type == "newCallDetach") {
                var i = mdtApp.calls[event.data.call].officers.length
                while (i--) {
                    if (mdtApp.calls[event.data.call].officers[i] == event.data.charname) {
                        mdtApp.calls[event.data.call].officers.splice(i, 1);
                    }
                }
            } else if (event.data.type == "editCall") {
                mdtApp.calls[event.data.call].details = event.data.details;
            } else if (event.data.type == "deleteCall") {
                if (mdtApp.current_call.id == mdtApp.calls[event.data.call].id) {
                    $.post('http://mdt/deleteCallBlip')
                    mdtApp.current_call = {
                        source: null,
                        details: null,
                        id: null,
                        time: null,
                        officers: null,
                        coords: null,
                        location: null
                    }
                }
                Vue.delete(mdtApp.calls, event.data.call)
            } else if (event.data.type == "closeModal") {
                mdtApp.modal = null;
            };
        });
    };
};

document.onkeydown = function (data) {
    if (data.which == 27 || data.which == 112) { // ESC or F1
        $.post('http://mdt/close', JSON.stringify({}));
    } else if (data.which == 13) { // enter
        /* stop enter key from crashing MDT in an input?  */
        var textarea = document.getElementsByTagName('textarea');
        if (!$(textarea).is(':focus')) {
            return false;
        }
    }
};

function ClearActiveNavItems() {
    $("#home").removeClass("nav-active");
    $("#search-reports").removeClass("nav-active");
    $("#search-offenders").removeClass("nav-active");
    $("#search-vehicles").removeClass("nav-active");
    $("#warrants").removeClass("nav-active");
    $("#submit-report").removeClass("nav-active");
    $("#calls").removeClass("nav-active");
}

function WarrantTimer() {
    var timer = setInterval(function() {
        for (var key in mdtApp.warrants) {
            var warrant = mdtApp.warrants[key]
            var now = new Date().getTime();
            var expire_time = new Date(warrant.expire).getTime();
            var t = expire_time - now;
            if (t >= 0) {
                var days = Math.floor(t / (1000 * 60 * 60 * 24));
                var hours = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var mins = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
                var secs = Math.floor((t % (1000 * 60)) / 1000);
                warrant.expire_time = days + 'd ' + hours + 'h ' + mins + 'm ' + secs + 's';
            } else {
                warrant.expire_time = 'EXPIRED';
                $.post('http://mdt/deleteWarrant', JSON.stringify({
                    id: warrant.id
                }));
                Vue.delete(mdtApp.warrants, key)
            }
        }
    }, 1000);
}

WarrantTimer()
