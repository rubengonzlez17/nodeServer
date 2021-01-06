window.onload = () =>{
    sidebarActivateVariations();
    loadTable("tableDowns", downs, "fa-angle-down", "red");
    loadTable("tableUps", ups, "fa-angle-up", "green");
}

function sidebarActivateVariations() {
    $("#variations").addClass("collapse-item active");
    $("#collapseNews").addClass("show");
    $("#collapseNewsNavItem").addClass("active");
}

function loadTable(table, data, icon, color){
    const nameTable = '#' + table
    $(nameTable).DataTable({
        select: false,
        destroy: true,
        "data": data,
        "paging": true,
        "searching": true,
        "info": false,
        "scrollX": true,
        columnDefs: [
            {
                targets: 1,
                render: function (data) {
                    return '<a href="/team/'+data[1]+'"> <img width="35" height="40" src="' + data[0] + '">'
                }
            },
            {
              targets: 2,
                render: function (data) {
                    return '<p><a href="/player/'+data[1]+'">'+data[0]+'</a></p>'
                }
            },
            {
              targets: 3,
                render: function (data) {
                    return '<i class="fas '+icon+'" style="color:'+color+'"></i> ' +data + '€'
                }
            },
        ],
    });
}