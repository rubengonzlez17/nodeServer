window.onload = () =>{
    sidebarActivateGoalKeeper();
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

function sidebarActivateGoalKeeper() {
    $("#goalkeeper").addClass("collapse-item active");
    $("#collapseMarket").addClass("show");
    $("#collapseMarketNavItem").addClass("active");
}