window.onload = () =>{
    sidebarActivateConservative();
    loadInitOptionsSelect();
}

function sidebarActivateConservative() {
    $("#aggressive").addClass("collapse-item active");
    $("#collapseRecommender").addClass("show");
    $("#collapseRecommenderNavItem").addClass("active");
}

function loadInitOptionsSelect(){
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

function getRecommendedPlayer() {
    var position = document.getElementById("inputSelectPosition");
    makeRequest("aggressive", position.value, balance);
};