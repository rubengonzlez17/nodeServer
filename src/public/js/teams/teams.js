window.onload = () =>{
    sidebarActivateForward();
    if(teams.length>0){
        loadTable();
    }
}

function sidebarActivateForward() {
    $("#allTeams").addClass("collapse-item active");
    $("#collapseLeague").addClass("show");
    $("#collapseLeagueNavItem").addClass("active");
}

function loadTable() {
    $('#tableTeams').DataTable({
        select: false,
        "data": teams,
        "paging": true,
        "searching": true,
        "info": false,
        "scrollX": true,
        columnDefs: [
            {
                targets: 0,
                render: function (data) {
                    return '<a href="/team/'+data[1]+'"> <img width="35" height="40" src="' + data[0] + '">'
                }
            },
            {
                targets: 4,
                render: function (data) {
                    return data + "€";
                }
            },
        ],

    });
}