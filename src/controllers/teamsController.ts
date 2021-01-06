import { Request, Response, NextFunction } from "express";
import { Player } from "../models/playerModel";
import { Team } from "../models/teamModel";
import { Match } from "../models/matchModel";
import { formatStatus, setColorPoints, getNextMatch} from "../utils/utils";

/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export class TeamsController{
    
    /**
     * GET /teams
     */
    public getTeams = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const teams = await Team.find().sort({position:1});
            const teamFields: Array<any> = [];

            for(const team of teams){
                const totalPoints = await this.getTotalPointsTeam(team.id);
                const value = await this.getValueTeam(team.id);
                teamFields.push([
                    [team.img, team.id],
                    team.name,
                    team.position,
                    totalPoints,
                    value,
                    team.scored,
                    team.against,
                    team.won,
                    team.tied,
                    team.lost
                ]);
            }

            res.render("teams",{
                title:"Equipos",
                teams: teamFields
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /**
     * /team/:id
     */
    public getTeam = async (req: Request, res: Response) =>{
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const { id } = req.params;
            const team = await Team.findOne({_id:id});
            const nextMatch = await Match.findOne({_id:team.next_match_id});
            const players = await Player.find({team_id:team.id});
            const playerFields: Array<any> = [];
            const nextMatchData = await getNextMatch(nextMatch, team);

            for(const player of players){
                const status = formatStatus(player.status, player.statusInfo);
                playerFields.push([
                    [player.name, player.id],
                    [team.img, team.id],
                    player.position,
                    player.points,
                    status,
                    setColorPoints(player.fitness),
                    new Intl.NumberFormat().format(player.price),
                ]);
            }

            const bestPlayer = await this.getBestPlayerByTeam(team.id);
            const best = await Player.findOne({_id:bestPlayer.id});

            res.render("team",{
                title:team.name,
                team: team,
                nextMatch: nextMatchData,
                players: playerFields,
                totalPoints: await this.getTotalPointsTeam(team.id),
                value: await this.getValueTeam(team.id),
                bestPlayer: best.name
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /* Functions */
    private async getTotalPointsTeam(teamID: number){
        const players = await Player.find({team_id: teamID});
        let totalPoints: number = 0;
        for(const player of players){
            totalPoints+=player.points;
        }

        return totalPoints;
    }

    private async getValueTeam(teamID: number){
        const players = await Player.find({team_id: teamID});
        let value: number = 0;
        for(const player of players){
            value+=player.price;
        }

        return new Intl.NumberFormat().format(value);
    }

    private async getBestPlayerByTeam(teamId: number){
        const players = await Player.find({team_id:teamId});
        const listPlayers: Array<any> = [];
        for(const player of players){
            listPlayers.push({"points":player.points, "id":player.id});
        }
        const bestPlayer = listPlayers.sort((a, b) => b["points"] - a["points"])[0];

        return bestPlayer;
    }

}