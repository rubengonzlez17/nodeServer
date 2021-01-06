window.onload = () =>{
    sidebarActivateForward();
    if(players.length>0){
        loadFitness("fitness");
        loadTitular();
        loadPicas();
        loadMatches();
        loadFitness("points");
        paintAreaChart();
        paintAreaChartPoints();
        paintBarChart();
    }
}

function sidebarActivateForward() {
    $("#forward").addClass("collapse-item active");
    $("#collapseMarket").addClass("show");
    $("#collapseMarketNavItem").addClass("active");
}