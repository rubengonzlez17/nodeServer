function makeRequest(typeSearch, position, balance) {
    $("body").addClass("loading");
    requestAjax = $.ajax({
        method: 'POST',
        url: "/getRecommendedPlayerByFilters",
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        data: {
            position: position,
            typeSearch: typeSearch,
            balance: balance
        },
    }).done(function (data) {
        players = [];
        var divPlayer = document.getElementById("recommendedPlayer");
        var divPlayersSold = document.getElementById("playersSold");
        var divBalance = document.getElementById("balance");
        insertBalance(divBalance, data["balance"]);
        if (data["player"] != null) {
            if (data["sold"].length != 0) {
                insertPlayersSold(divPlayersSold, data["sold"]);
                insertRecommendedPlayer(divPlayer, data["player"], "Para fichar..");
            } else {
                divPlayersSold.style.display = "none";
                insertRecommendedPlayer(divPlayer, data["player"], "Deberias fichar a..");
            }
        } else {
            divPlayersSold.style.display = "none";
            divPlayer.innerHTML = "<h4>No hay fichajes posibles con esos filtros...</h4>";
        }
        $("body").removeClass("loading");
    }).fail(function () {
        console.log("AJAX ERROR");
    })
}

function insertBalance(div, balance) {
    const html = `<div class="row justify-content-center align-items-center h-100">
    <div class="col col-sm-12 col-md-12 col-lg-4 col-xl-6">
        <div class="card shadow text-center">
        <div class="card-body">
            <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Saldo Futuro</div>
                    <div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">${balance} €</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    </div>`
    div.innerHTML = html;
}

function insertPlayersSold(div, data) {
    let html = `<div class="row justify-content-center align-items-center h-100">
                    <div class="col col-sm-12 col-md-12">
                        <div class="form-group">
                            <label>Deberias vender a..</label>
                        </div>
                        <div class="form-group">
                            <div class="row accordion d-flex">`;
    var index = 1;
    for (var player of data) {
        html = html + `<div class="col-xl-4 col-md-6 mb-4">
                            <div class="card shadow ">
                                <div class="p-3 card-box text-center" id="heading${index}">
                                    <div class="member-card">
                                        <ul class="list-inline">
                                            <li class="list-inline-item">
                                                <h7>Lanz. Penaltis</h7>
                                                <i class="${player['penaltyTaker'][0]}" style="color:${player['penaltyTaker'][1]}"></i>
                                            </li>
                                            <li class="list-inline-item">
                                                <h7>Lanz. Faltas</h7>
                                                <i class="${player['foulTaker'][0]}" style="color:${player['foulTaker'][1]}"></i>
                                            </li>
                                                <li class="list-inline-item">
                                                <h7>MVP <i class="fa fa-star"></i> ${player['totalStatitics'][0]}</h7>
                                            </li>
                                        </ul>
                                        <ul class="list-inline">
                                            <li class="list-inline-item">
                                                <h5>${player['name']}</h5><i class="${player['status'][0]}" style="color:${player['status'][1]}"></i><h7> ${player['status'][2]}</h7>
                                                <h6>Puntos: ${player['points']}</h6>
                                            </li>
                                        </ul>
                                        <ul class="list-inline">
                                            <li class="list-inline-item">${player['position']}</li>
                                            <li class="list-inline-item">
                                                <div class="thumb-lg member-thumb mx-auto">
                                                    <a href="/player/${player['img'][1]}"><img class="rounded-circle img-thumbnail" src=${player['img'][0]}></a>
                                                </div>
                                            </li>
                                            <li class="list-inline-item">
                                            <a href="/team/${player['teamImg'][1]}"> <img width="45" height="45" alt="profile-image" src=${player['teamImg'][0]} ></a>
                                            </li>
                                        </ul>
                                        <p class="mb-0">${player['role']}</p>
                                        <p class="mb-0">Precio: ${player['price']} €
                                        <div id="fitness${index}" class="fitness text-center" style="margin-top:10px" title="Puntos conseguidos en las últimas jornadas"></div>
                                        <div id="titular${index}" class="fitness text-center" style="margin-top:10px" title="Titularidades en las últimas jornadas"></div>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        players.push(player);
        index++;
    }
    html = html + `</div></div></div></div>`;
    div.innerHTML = html;
}

function insertRecommendedPlayer(div, data, title) {
    players.push(data);
    const html = `
    <div class="row justify-content-center align-items-center h-100">
        <div class="col col-sm-12 col-md-12 col-lg-4 col-xl-6">
            <div class="form-group">
                <label>${title}</label>
            </div>
            <div class="form-group">
                <div class="row accordion d-flex">
                    <div class="col-xl-12 col-md-6 mb-4">
                        <div class="card shadow ">
                            <div class="p-3 card-box text-center" id="heading">
                                <div class="member-card">
                                    <ul class="list-inline">
                                        <li class="list-inline-item">
                                            <h7>Lanz. Penaltis</h7>
                                            <i class="${data['penaltyTaker'][0]}" style="color:${data['penaltyTaker'][1]}"></i>
                                        </li>
                                        <li class="list-inline-item">
                                            <h7>Lanz. Faltas</h7>
                                            <i class="${data['foulTaker'][0]}" style="color:${data['foulTaker'][1]}"></i>
                                        </li>
                                            <li class="list-inline-item">
                                            <h7>MVP <i class="fa fa-star"></i> ${data['totalStatitics'][0]}</h7>
                                        </li>
                                    </ul>
                                    <ul class="list-inline">
                                        <li class="list-inline-item">
                                            <h5>${data['name']}</h5><i class="${data['status'][0]}" style="color:${data['status'][1]}"></i><h7> ${data['status'][2]}</h7>
                                            <h6>Puntos: ${data['points']}</h6>
                                        </li>
                                    </ul>
                                    <ul class="list-inline">
                                        <li class="list-inline-item">${data['position']}</li>
                                        <li class="list-inline-item">
                                            <div class="thumb-lg member-thumb mx-auto">
                                                <a href="/player/${data['img'][1]}"><img class="rounded-circle img-thumbnail" src=${data['img'][0]}></a>
                                            </div>
                                        </li>
                                        <li class="list-inline-item">
                                        <a href="/team/${data['teamImg'][1]}"> <img width="45" height="45" alt="profile-image" src=${data['teamImg'][0]} ></a>
                                        </li>
                                    </ul>
                                    <p class="mb-0">${data['role']}</p>
                                    <p class="mb-0">Precio: ${data['price']} €
                                    <div id="fitness0" class="fitness text-center" style="margin-top:10px" title="Puntos conseguidos en las últimas jornadas"></div>
                                    <div id="titular0" class="fitness text-center" style="margin-top:10px" title="Titularidades en las últimas jornadas"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`
    div.innerHTML = html;
    loadTitular();
    loadFitness('fitness');
}