var index=1;
var indexPoints=1;
let dataSetChar = [];
const colors = {
    '1': "#ff1100",
    '2': "#06b4fb",
    '3': "#19bb00",
    '4': "#fba606",
}

function setDataSet(){
    const dataSet = [];
    for(var player of players){
        var color = getRandomColor(index);
        index++;
        dataSet.push({
            type: 'line',
            fill: false,
            label: player['name'],
            lineTension: 0.3,
            borderColor: color,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: color,
            pointHitRadius: 10,
            pointBorderWidth: 2,
            data: player['values'],
        })
        dataSetChar.push({
            label: player['name'],
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            data: [player['values'][lastValues-1],player['values'][lastValues-7],player['values'][lastValues-14]],
        })
    }
    return dataSet;
}

function setRounds(){
    const dataSetPoints = []
    for(const player of players){
        const points = [];
        const rounds = [];
        const playerStatitics = player['reports'];
        for(const statitics of playerStatitics.slice(lastRound-9, lastRound)){
            if(statitics['points'][0] == "fa fa-minus"){
                points.push(null);
            }else{
                points.push(statitics['points'][0]);
            }
            rounds.push(statitics['round']);
        }
        dataSetPoints.push({"name":player['name'], "points":points,"rounds":rounds.slice(0, 10)});
    }
    return dataSetPoints
}

function setDataSetPoints(){
    const dataSet = [];
    const playersPoints = setRounds();
    for(var player of playersPoints){
      var color = getRandomColor(indexPoints);
      indexPoints++;
      dataSet.push({
          type: 'line',
          fill: false,
          label: player['name'],
          lineTension: 0.3,
          borderColor: color,
          pointRadius: 2,
          pointHoverRadius: 3,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointHitRadius: 10,
          pointBorderWidth: 2,
          data: player['points'],
        })
    }
    return dataSet;
  }

function getRandomColor(index) {
    return colors[index];
}

function paintAreaChart(){
    var ctx = document.getElementById("areaChart");
    new Chart(ctx, {
        type: 'line',
        data: {
        labels: players[0]['dateValues'],
        datasets: setDataSet(),
        },
        options: {
            responsive: true,   
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                        maxTicksLimit:13
                    },
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [{
                ticks: {
                    maxTicksLimit: 8,
                    padding: 1,
                    callback: function(value, index, values) {
                    return value+'€';
                    }
                },
                gridLines: {
                    color: "rgb(234, 236, 244)",
                    zeroLineColor: "rgb(234, 236, 244)",
                    drawBorder: false,
                    borderDash: [2],
                    zeroLineBorderDash: [2]
                }
                }],
            },
            legend: {
                labels: {
                    useLineStyle: true,
                },
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ':' + tooltipItem.yLabel +' €';
                    }
                }
            }
        }
    });
}

function paintBarChart(){
    var ctx = document.getElementById("marketValueBarChart")
    new Chart(ctx, {
        type: "bar",
        responsive: true,
        data: {
            labels: ["Yesterday", "Last Week", "Two Week Ago"],
            datasets: dataSetChar
        }
    });
}

function paintAreaChartPoints(){
    var ctx = document.getElementById("pointsChart");
    new Chart(ctx, {
        type: 'line',
        data: {
        labels:setRounds()[0]['rounds'],
        datasets: setDataSetPoints(),
        },
        options: {
            responsive: true,   
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    ticks: {
                    maxTicksLimit:38
                    }
                }],
                yAxes: [{
                ticks: {
                    maxTicksLimit: 8,
                    padding: 2,
                },
                gridLines: {
                    color: "rgb(234, 236, 244)",
                    zeroLineColor: "rgb(234, 236, 244)",
                    drawBorder: false,
                    borderDash: [2],
                    zeroLineBorderDash: [2]
                }
                }],
            },
            legend: {
                labels: {
                    useLineStyle: true,
                },
                strokeStyle: "rgb(234, 236, 244)", 
                position: "bottom"
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ':' + tooltipItem.yLabel +' points';
                    }
                }
            }
        }
    });
}


function loadTitular(){
    var index = 0;
    const reports=[];
    for(const pl of players){
        reports.push(pl['reports']);
        const player = reports[index].slice(lastRound-5,lastRound).reverse();
        const id = "titular"+index;
        const documentPlayer = document.getElementById(id);
        var html = "";
        var innerHtml = "";
        for(const report of player){
            if(report['titular'] == undefined){
                innerHtml = `<span class="points bg"><p style="font-weight:bold;"><i class="fa fa-minus"></i></p></span>`
            }else{
                innerHtml = `<span class="points bg"><p style="font-weight:bold; background-color: ${report['titular'][1]};">${report['titular'][0]}</p></span>`
            }
            html = html+innerHtml;
        }
        documentPlayer.innerHTML = html;
        html = "";
        var innerHtml = "";
        index++;
    }
}

function loadPicas(){
    var index = 0;
    const reports=[];
    for(const pl of players){
        reports.push(pl['reports']);
        const player = reports[index].slice(lastRound-5,lastRound).reverse();
        const id = "picas"+index;
        const documentPlayer = document.getElementById(id);
        var html = "";
        var innerHtml = "";
        for(const report of player){
            if(report['picas'][0] == undefined){
                innerHtml = `<span class="points bg"><p style="font-weight:bold;">0</i></p></span>`
            }else{
                innerHtml = `<span class="points bg"><p style="font-weight:bold; background-color:${report['picas'][1]}">${report['picas'][0]}</p></span>`
            }
            html = html+innerHtml;
        }
        const title = `<h7>Picas:</h7>`;
        documentPlayer.innerHTML = title + html;
        html = "";
        var innerHtml = "";
        index++;
    }
}

function loadMatches(){
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
        const title = `<h7>Partidos:</h7>`;
        documentPlayer.innerHTML = title + html;
        html = "";
        var innerHtml = "";
        index++;
    }
}

function loadFitness(idDiv){
    var index = 0;
    const reports=[];
    for(const pl of players){
        reports.push(pl['reports']);
        const player = reports[index].slice(lastRound-5,lastRound).reverse();
        const id = idDiv+index;
        const documentPlayer = document.getElementById(id);
        var html = "";
        var innerHtml = "";
        for(const report of player){
            if(report['points'] == null || report['points'][1] == null){
                innerHtml = `<span class="points bg"><p style="font-weight:bold;"><i class="fa fa-minus"></i></p></span>`
            }else if(report['points'][0].length >3){
                innerHtml = `<span class="points bg"><p style="font-weight:bold; background-color:${report['points'][1]};"><i class="${report['points'][0]}" ></i></p></span>`
            }else{
                innerHtml = `<span class="points bg"><p style="font-weight:bold; background-color:${report['points'][1]}">${report['points'][0]}</p></span>`
            }
            html = html+innerHtml;
        }
        let title = "";
        if(idDiv == 'points'){
            title = `<h7>Puntos:</h7>`;
        }
        documentPlayer.innerHTML = title + html;
        html = "";
        var innerHtml = "";
        index++;
    }
}