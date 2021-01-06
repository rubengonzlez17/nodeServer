import { Team, TeamDocument } from "../models/teamModel";
import { MatchDocument } from "../models/matchModel";
import moment from "moment";

enum defaultValues {
    select = "",
    grey = "#848484",
    red = "#ff1100",
    blue = "#06b4fb",
    green = "#19bb00",
    orange = "#fba606",
    purple = "#dd06fb",
    lastValues = "40", //last 2 month,
    defaultSelectValue = ""
}

function formatStatus(status: string, statusInfo: string){
    let statusPlayer: [string, string, string] = ["","",""];
    if(status == "injured") statusPlayer = ["fas fa-ban", "red", statusInfo];
    if(status == "sanctioned") statusPlayer = ["fa fa-times", "red", statusInfo];
    if(status == "ok") statusPlayer = ["fa fa-check-circle", "green", "Disponible"];
    if(status == "doubt") statusPlayer =["fa fa-exclamation", "orange", statusInfo];
    return statusPlayer;
}

function setColorPoints(fitness: Array<any>){
    const listFitness: [string, string][] = [];
    for(const i of fitness){
        if(i == null || i == 0) listFitness.push(["fa fa-minus", null]);
        if(i == "injured") listFitness.push(["fa fa-plus", defaultValues.red]);
        if(i == "sanctioned") listFitness.push(["fa fa-times", defaultValues.red]);
        if(i == "doubt") listFitness.push(["fa fa-question", defaultValues.purple]);
        if(i < 0) listFitness.push([i.toString(), defaultValues.red]);
        if(i > 0 && i<6) listFitness.push([i.toString(), defaultValues.orange]);
        if(i >= 6 && i<10) listFitness.push([i.toString(), defaultValues.green]);
        if(i >= 10) listFitness.push([i.toString(), defaultValues.blue]);
    }
    return listFitness;
}

async function getNextMatch(nextMatch: MatchDocument, team: TeamDocument){
    const date = new Date(nextMatch.date *1000).toISOString();
    let nextMatchData: any;
    if(nextMatch.home.team_id == team.id){
        const teamAway = await Team.findOne({_id:nextMatch.away.team_id});
        nextMatchData = {
            "home":[team.id, team.img],
            "away":[teamAway.id, teamAway.img],
            "date": moment(date).utc().format("DD/MM/YYYY")
        };
    }else{
        const teamHome = await Team.findOne({_id:nextMatch.home.team_id});
        nextMatchData = {
            "home":[teamHome.id, teamHome.img],
            "away":[team.id, team.img],
            "date": moment(date).utc().format("DD/MM/YYYY")
        };
    }
    return nextMatchData;
}

export {
    formatStatus,
    setColorPoints,
    getNextMatch,
    defaultValues
};