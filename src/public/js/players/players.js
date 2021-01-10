window.onload = () =>{
    sidebarActivatePlayers();
    loadInitOptionsSelect();
    if(players.length>0){
        loadTable(null);
    }
}

function sidebarActivatePlayers() {
    $("#allPlayers").addClass("collapse-item active");
    $("#collapseLeague").addClass("show");
    $("#collapseLeagueNavItem").addClass("active");
}

function loadInitOptionsSelect(){
    var selectTeam = document.getElementById("inputSelectTeam");
    createDefaultOption("Select Team",selectTeam);
    for(var team of listTeam) {
        selectTeam.options[selectTeam.options.length] = new Option(team[0]);
    }
    var selectPosition = document.getElementById("inputSelectPosition");
    createDefaultOption("Select Position",selectPosition);
    for(var position of listPosition) {
        selectPosition.options[selectPosition.options.length] = new Option(position);
    }
}

function createDefaultOption(text, inputSelect){
    let option = document.createElement('option');
    option.value = DefaultSelectValue
    option.text = text;
    inputSelect.add(option);
}

function selectOption(select, numSelect) {
    var positionValue = document.getElementById('inputSelectPosition').value;
    var teamValue = document.getElementById('inputSelectTeam').value;
    var teamID="";
    for(const team of listTeam){
        if(team[0]==teamValue){
            teamID=team[1];
            break;
        }
    }
    loadPlayers(positionValue, teamID);
}

function loadPlayers(positionValue, teamValue){
    $.ajax({
        method: 'POST',
        url: "/getPlayersByFilters",
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        data: {
            position: positionValue,
            team: teamValue,
        },
    }).done(function (data) {
        listPlayers = data.players;
        loadTable(listPlayers, true, true);
    }).fail(function () {
        console.log("AJAX ERROR");
    })
}

function loadTable(listPlayers) {
    if(listPlayers) players = listPlayers;
    $('#tablePlayers').DataTable({
        select: false,
        destroy: true,
        "data": players,
        "paging": true,
        "searching": true,
        "info": false,
        "scrollX": true,
        columnDefs: [
            {
                targets: 0,
                render: function (data) {
                    return '<p><a href="/player/'+data[1]+'">'+data[0]+'</a></p>'
                }
            },
            {
                targets: 1,
                render: function (data) {
                    return '<a href="/team/'+data[1]+'"> <img width="35" height="40" src="' + data[0] + '">'
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
                        if(point[0].length>3){
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
        ],

    });
}