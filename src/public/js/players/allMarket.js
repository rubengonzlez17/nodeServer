window.onload = () =>{
    sidebarActivateForward();
    if(players.length>0){
        loadTable();
    }
}

function sidebarActivateForward() {
    $("#allMarket").addClass("collapse-item active");
    $("#collapseMarket").addClass("show");
    $("#collapseMarketNavItem").addClass("active");
}

function loadTable() {
    $('#tableMarket').DataTable({
        select: false,
        "data": players,
        "paging": false,
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
                targets: 4,
                render: function (data) {
                    return '<i class="' + data[0] + '" style="color:' + data[1] + '";></i>'
                }
            },
            {
                targets: 5,
                render: function (data) {
                    html = `<div class="fitness" title="Puntos conseguidos en las últimas jornadas">`;
                    for (var point of data) {
                        if(point[0].length>4){
                            html += '<span class="points bg"><p style="font-weight:bold; background-color:'+point[1]+'";><i class="'+point[0]+'"></i></p></span>'
                        }else{
                            html += '<span class="points bg"><p style="font-weight:bold; background-color:'+point[1]+'";>'+point[0]+'</p></span>'
                        }
                    }
                    html += '</div>';
                    return html;
                }
            },
            {
                targets: 6,
                render: function (data) {
                    return data + "€";
                }
            },
            {
                targets: 7,
                render: function (data) {
                    return data + "€";
                }
            },
        ],

    });
}