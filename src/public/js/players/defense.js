window.onload = () =>{
    sidebarActivateDefense();
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

function sidebarActivateDefense() {
    $("#defense").addClass("collapse-item active");
    $("#collapseMarket").addClass("show");
    $("#collapseMarketNavItem").addClass("active");
}