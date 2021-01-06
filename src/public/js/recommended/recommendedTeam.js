window.onload = () =>{
    loadInitOptionsSelect()
    sidebarActivateMyTeam();
}

function sidebarActivateMyTeam() {
    $("#recommendedTeam").addClass("collapse-item active");
    $("#collapseMyTeam").addClass("show");
    $("#collapseMyTeamNavItem").addClass("active");
}

function loadInitOptionsSelect(){
    var selectStrategy = document.getElementById("inputSelectStrategy");
    createDefaultOption("Select Strategy",selectStrategy);
    for(var strategy of listStrategy) {
        selectStrategy.options[selectStrategy.options.length] = new Option(strategy);
    }
}

function createDefaultOption(text, inputSelect){
    let option = document.createElement('option');
    option.value = DefaultSelectValue
    option.text = text;
    inputSelect.add(option);
}

function getRecommendedTeam() {
    var strategy = document.getElementById("inputSelectStrategy");
    if(strategy.value != DefaultSelectValue){
        makeRequest(strategy.value);
    }else{
        const divTeam = document.getElementById("team");
        divTeam.innerHTML = ``;
    }
};

function makeRequest(strategy){
    $("body").addClass("loading");
    requestAjax = $.ajax({
        method: 'POST',
        url: "/getRecommendedTeamByFilters",
        dataType: 'json',
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        data: {
            strategy: strategy
        },
    }).done(function (data) {
        const divTeam = document.getElementById("team");
        insertTeam(divTeam, data["goalkeeper"], data["defenses"], data["midfielders"], data["forwards"]);
        $("body").removeClass("loading");
    }).fail(function () {
        console.log("AJAX ERROR");
    })
}

function createDiv(players){
    let div = `<div class="col-md-6 modal-footer m-auto justify-content-center"></div>
                    <div class="col-md-12">
                        <div class="form-row p-4 justify-content-center" style="padding-top:0 !important;">`;
    for(var item of players){
        div = div + `<div class="col-xl-2 col-md-6 mb-4">
                <div class="card shadow py-2">
                    <div class="card-box text-center">
                        <div class="member-card">
                            <p>${item.name}</p>
                            <ul class="list-inline">
                                <li class="list-inline-item">${item.position}</li>
                                <li class="list-inline-item">
                                    <div class="thumb-lg member-thumb">
                                        <a href="/player/${item.img[1]}"><img class="rounded-circle img-thumbnail" width="70" height="70" alt="profile-image" src=${item.img[0]}></a>
                                    </div>
                                </li>
                                <li class="list-inline-item">
                                    <a href="/team/${item.team[1]}"> <img width="30" height="40" alt="profile-image" src=${item.team[0]}></a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    div = div + '</div>';
    return div
}

function insertTeam(div, goalkeepers, defenses, midfielders, forwards){
    const goalkeeper = `<div class="form-row p-4 justify-content-center" style="padding-top:0 !important;">
                    <div class="col-xl-2 col-md-6 mb-4">
                        <div class="card shadow py-2">
                            <div class="card-box text-center">
                                <div class="member-card">
                                    <p>${goalkeepers[0].name}</p>
                                    <ul class="list-inline">
                                        <li class="list-inline-item">${goalkeepers[0].position}</li>
                                        <li class="list-inline-item">
                                            <div class="thumb-lg member-thumb">
                                                <a href="/player/${goalkeepers[0].img[1]}"><img class="rounded-circle img-thumbnail" width="70" height="70" alt="profile-image" src=${goalkeepers[0].img[0]}></a>
                                            </div>
                                        </li>
                                        <li class="list-inline-item">
                                            <a href="/team/${goalkeepers[0].team[1]}"> <img width="30" height="40" alt="profile-image" src=${goalkeepers[0].team[0]}></a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    html = goalkeeper + createDiv(defenses) + createDiv(midfielders) + createDiv(forwards);

    div.innerHTML = html;
}