window.onload = () =>{
    if(players.length>0){
        loadTitular();
        loadFitness('fitness');
        loadMatchesPlayer();
        paintAreaChart();
        paintAreaChartPoints();
    }
}

function loadMatchesPlayer(){
    var index = 0;
    const reports=[];
    for(const pl of players){
        reports.push(pl['reports']);
        const player = reports[index].slice(lastRound-5,lastRound).reverse();
        const id = "matches"+index;
        const documentPlayer = document.getElementById(id);
        var html = "";
        var innerHtml = "";
        for(const report of player){
            if(report['result'] == undefined){
                innerHtml = `<span class="points bg"><p style="font-weight:bold;"><i class="fa fa-minus"></i></p></span>`
            }else{
                innerHtml = `<span class="points bg"><p style="font-weight:bold; background-color:${report['result'][1]}">${report['result'][0]}</p></span>`
            }
            html = html+innerHtml;
        }
        documentPlayer.innerHTML = html;
    }
}