import { Request, Response, NextFunction } from "express";
import { Player, PlayerDocument } from "../models/playerModel";
import { Team, TeamDocument } from "../models/teamModel";
import { Report } from "../models/reportModel";
import { Round } from "../models/roundModel";
import axios from "axios";
import { User, UserDocument } from "../models/userModel";
import { Match, MatchDocument } from "../models/matchModel";
import { decryptData } from "../utils/crypt";
import { formatStatus, setColorPoints, defaultValues, getNextMatch} from "../utils/utils";


/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

enum endpoints {
    User = "player"
}

enum endpointsUser {
    market = "/get_market",
    lineUp = "/get_my_team",
    recommendedSold = "/get_players_sold"
}

enum strategies {
    conservative = "conservative",
    moderate = "moderate",
    agressive = "aggressive"
}

export class PlayersController{
    public api_address: string = process.env.MANAGER_API + "/" + endpoints.User.toLowerCase();
    public allRounds = ["R1","R2","R3","R4","R5","R6","R7","R8","R9","R10","R11","R12","R13","R14","R15","R16","R17","R18","R19","R20","R21","R22","R23","R24","R25","R26","R27","R28","R29","R30","R31","R32","R33","R34","R35","R36","R37","R38"];
    public listStrategy = ["4-3-3", "3-4-3", "3-5-2", "4-4-2","4-5-1","5-3-2", "5-4-1"]
    
    /**
     * GET /myTeam
     */
    public getTeam = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const user: any = req.user;
            const lineUpData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.lineUp, user, null);

            const players = await Player.find({_id:{$in: lineUpData[0]["all_players"]}});
            const teamPlayers: Array<number> = [];
            const playerFields: Array<any> = [];
            
            for(const player of players){
                teamPlayers.push(player.team_id);
            }

            const teams = await Team.find({_id:{$in:teamPlayers}});
            let lineUp: any;

            for(const player of players){
                for(const team of teams){
                    if(player.team_id == team._id){
                        const status = formatStatus(player.status, player.statusInfo);
                        if(lineUpData[0]["line_up_ids"].find((element: any) => element == player.id)){
                            lineUp = ["fa fa-check-circle", "green"];
                        }else{
                            lineUp = ["fas fa-ban", "red"];
                        }
                        playerFields.push([
                            [player.name, player.id],
                            [team.img, team.id],
                            player.position,
                            player.points,
                            status,
                            setColorPoints(player.fitness),
                            new Intl.NumberFormat().format(player.price),
                            lineUp
                        ]);
                    }
                }
            }

            const best = players.sort((a, b) => b["points"] - a["points"])[0];
            const mostExpensive = players.sort((a, b) => b["price"] - a["price"])[0];

            res.render("my-team", {
                title: "Mi Equipo",
                players: playerFields,
                balance: new Intl.NumberFormat().format(lineUpData[0]["balance"]),
                points: lineUpData[0]["points"],
                bestPlayer: best.name,
                mostExpensive: mostExpensive.name,
                type: lineUpData[0]["type"]
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /**
     * /player/:id
     */
    public getPlayer = async (req: Request, res: Response) =>{
        if (!req.user) {
            return res.redirect("/");
        }
        try{
            const { id } = req.params;
            const player = await Player.findOne({_id:id});
            const team = await Team.findOne({_id:player.team_id});
            const nextMatch = await Match.findOne({_id:team.next_match_id});
            const nextMatchData = await getNextMatch(nextMatch, team);
            const match = player.playedAway + player.playedHome;
            const playerFields: any = await this.getDataPlayer(player, team, match);

            res.render("player", {
                title: player.name,
                player: playerFields,
                nextMatch: nextMatchData,
                lastRound: await this.getLastMatch(),
                lastValues: parseInt(defaultValues.lastValues),
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /**
     * GET /recommendedTeam
     */
    public getRecommendedTeam = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            res.render("recommended-team", {
                title: "Once Recomendado",
                listStrategy: this.listStrategy,
                defaultSelectValue: defaultValues.defaultSelectValue
            });
            
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }
    
     /**
     * GET /variations
     */
    public getVariations = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const playersUps = await Player.find().sort({priceIncrement:-1}).limit(20);
            const playerDowns = await Player.find().sort({priceIncrement:1}).limit(20);
            const teamPlayers = await Team.find();
            const teams = await Team.find({_id:{$in:teamPlayers}});
            const playerFieldsUps = this.getPlayersVariations(playersUps, teams);
            const playerFieldsDowns = this.getPlayersVariations(playerDowns, teams);

            res.render("variations", {
                title: "Variaciones",
                ups: playerFieldsUps,
                downs: playerFieldsDowns
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        } 
    }

     /**
     * GET /all-market
     */
    public getAllMarket = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players = await this.getAllMarketPlayers(req, res);

            res.render("all-market", {
                title: "Todo el Mercado",
                players: players["players"],
                maximumBid: players["maximumBid"],
                balance: players["balance"]
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

     /**
     * GET /players
     */
    public getAllPlayers = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players = await Player.find();
            const allTeams = await Team.find();

            const teamPlayers: Array<number> = [];
            const teamsID = [];

            for(const player of players){
                teamPlayers.push(player.team_id);
            }

            for(const team of allTeams){
                teamsID.push([team.name, team.id]);
            }

            const teams = await Team.find({_id:{$in:teamPlayers}});
            const playerFields = this.getDataPlayers(players, teams);


            res.render("players",{
                title:"Jugadores",
                players: playerFields,
                teams: teamsID,
                positions: await this.getPositions(),
                defaultSelectValue: defaultValues.defaultSelectValue
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /*
    * GET /getPlayersByFilters
     */
    public getPlayerByFilters = async (req: Request, res: Response) =>{
        const { position, team } = req.body;

        let players: Array<any> = [];
        const teamPlayers: Array<number> = [];

        if(position != defaultValues.select){
            if(team != defaultValues.select){
                players = await Player.find({team_id:team, position:position});
            }else{
                players = await Player.find({position:position});
            }
        }else{
            if(team != defaultValues.select){
                players = await Player.find({team_id:team});
            }else{
                players = await Player.find();
            }
        }

        for(const player of players){
            teamPlayers.push(player.team_id);
        }

        const teams = await Team.find({_id:{$in:teamPlayers}});
        const playerFields = this.getDataPlayers(players, teams);

        res.send({ players: playerFields });
    }

     /**
     * GET /goalkeepers
     */
    public getGoalkeepers = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players: Array<any> = await this.getPlayers(req, res, "PT");
            await this.renderMarket(res, players, "goalkeepers", "Porteros");
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

     /**
     * GET /defenses
     */
    public getDefenses = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players: Array<any> = await this.getPlayers(req, res, "DF");
            await this.renderMarket(res, players, "defenses", "Defensas");
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

     /**
     * GET /midfielders
     */
    public getMidfielders = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players: Array<any> = await this.getPlayers(req, res, "MC");
            await this.renderMarket(res, players, "midfielders", "Mediocentros");
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

     /**
     * GET /forwards
     */
    public getForwards = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const players: Array<any> = await this.getPlayers(req, res, "DL");
            await this.renderMarket(res, players, "forwards", "Delanteros");
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /*
    * GET /conservative
    */
    public getConservativeStrategy = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const user: any = req.user;
            const marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
            const marketPlayers = marketData[0].players; 
            const listMarketPlayers: any = [];
            for(const player of marketPlayers) { listMarketPlayers.push(player["id"]);};

            const players = await Player.find({_id:{$in: listMarketPlayers}});

            res.render("conservative", {
                title: "Estrategia Conservadora",
                positions: await this.getPositions(),
                defaultSelectValue: defaultValues.defaultSelectValue,
                lastRound: await this.getLastMatch(),
                balance: new Intl.NumberFormat().format(marketData[0]["balance"])
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /*
    * GET /moderate
    */
   public getModerateStrategy = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const user: any = req.user;
            const marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
            const marketPlayers = marketData[0].players;
            const listMarketPlayers: any = [];
            for(const player of marketPlayers) { listMarketPlayers.push(player["id"]);};

            const players = await Player.find({_id:{$in: listMarketPlayers}});

            res.render("moderate", {
                title: "Estrategia Moderada",
                positions: await this.getPositions(),
                defaultSelectValue: defaultValues.defaultSelectValue,
                lastRound: await this.getLastMatch(),
                balance: new Intl.NumberFormat().format(marketData[0]["balance"])
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /*
    * GET /agressive
    */
    public getAggressiveStrategy = async (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        try{
            const user: any = req.user;
            const marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
            const marketPlayers = marketData[0].players;  
            const listMarketPlayers: any = [];
            for(const player of marketPlayers) { listMarketPlayers.push(player["id"]);};

            const players = await Player.find({_id:{$in: listMarketPlayers}});

            res.render("aggressive", {
                title: "Estrategia Agresiva",
                positions: await this.getPositions(),
                defaultSelectValue: defaultValues.defaultSelectValue,
                lastRound: await this.getLastMatch(),
                balance: new Intl.NumberFormat().format(marketData[0]["balance"])
            });
        }catch(error){
            console.log(error);
            res.redirect("back");
        }
    }

    /*
    * POST /getRecommendedPlayerByFilters
    */
    public getRecommendedPlayerByFilters = async (req: Request, res: Response) => {
        
        const { typeSearch, position, balance } = req.body;
        const user: any = req.user;
        const  marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
        const marketPlayers = marketData[0].players;  
        const listMarketPlayers: any = [];
        let player: any = [];
        let sold: any = [];
        const listSold: any =[];
        for(const player of marketPlayers) { listMarketPlayers.push(player["id"]);};

        let players = await Player.find({_id:{$in: listMarketPlayers}});

        if(typeSearch == strategies.agressive){
            players = players.filter(element => element["price"] > 4000000);
        }else if(typeSearch == strategies.moderate){
            players = players.filter(element => element["price"] > 2500000 && element["price"]<4000000);
        }else{
            players = players.filter(element => element["price"] < 1500000);
        }

        players.sort(function(a: { use: string }, b: { use: string }){
            if ( parseInt(a.use) > parseInt(b.use) ) return -1;
            if ( parseInt(a.use) < parseInt(b.use) ) return 1;
            return 0;
        });

        let newBalance: number = -1;
        while(newBalance<0){
            if(players.length == 0){
                player = null;
                break;
            }
            if(position != defaultValues.defaultSelectValue){
                player = this.getBestPlayers(players, position.toString(), 1)[0];
            }else{
                player = players[0];
            }
            
            if(player != null){
                newBalance = this.formatBalance(balance)-player.price;
                if(newBalance<0){
                    const playersSold = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.recommendedSold, user, Math.abs(newBalance));
                    sold = await Player.find({_id:{$in:playersSold}});
                    for(const p of sold) newBalance =  newBalance+p.price;
                }

                players = players.filter(element => element["_id"] != player["_id"]);
            }else{
                break;
            }
        }

        if(player == null){
            res.send({"player":null, "sold":[], "balance": balance});
        }else{
            const teamPlayer = await Team.findOne({_id:player.team_id});
            const teams = await Team.find();
            const match = player.playedAway + player.playedHome;
            const playerFields: any = await this.getDataPlayer(player, teamPlayer, match);
            for(const team of teams){
                for(const p of sold){
                    if(team.id == p.team_id) listSold.push(await this.getDataPlayer(p, team, match));
                }
            }
            res.send({"player":playerFields, "sold":listSold, "balance": new Intl.NumberFormat().format(newBalance)});
        }
    }

    /*
    * POST /getRecommendedTeamByFilters
    */
    public getRecommendedTeamByFilters = async (req: Request, res: Response) => {
        const { strategy } = req.body;
        const listStrategy = strategy.split("-");
        const user: any = req.user;
        const lineUpData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.lineUp, user, null);
        const players = await Player.find({_id:{$in: lineUpData[0]["all_players"]}});
        const teams = await Team.find();
        players.sort(function(a: { use: string }, b: { use: string }){
            if ( parseInt(a.use) > parseInt(b.use) ) return -1;
            if ( parseInt(a.use) < parseInt(b.use) ) return 1;
            return 0;
        });
        //Portero
        const goalkeeper = this.getBestPlayers(players, "PT", 1);
        const teamGoalKeeper = await Team.findOne({_id:goalkeeper[0].team_id});
        //Defensas
        const defenses = this.getBestPlayers(players, "DF", Number(listStrategy[0]));
        const defensesFields: any = [];
        //Mediocentros
        const midfielders = this.getBestPlayers(players, "MC", Number(listStrategy[1]));
        const midfieldersFields: any = [];
        //Delanteros
        const forwards = this.getBestPlayers(players, "DL", Number(listStrategy[2]));
        const forwardsFields: any = [];
        const goalkeeperField: any = [{
            "name":goalkeeper[0].name,
            "position":goalkeeper[0].position,
            "img":[goalkeeper[0].img, goalkeeper[0].id],
            "team":[teamGoalKeeper.img, teamGoalKeeper._id],
        }];
        for(const team of teams){
            for(const defense of defenses){
                if(defense.team_id == team.id){
                    defensesFields.push({
                        "name":defense.name,
                        "position":defense.position,
                        "img":[defense.img, defense.id],
                        "team":[team.img, team._id],
                    });
                }
            }
            for(const midfielder of midfielders){
                if(midfielder.team_id == team.id){
                    midfieldersFields.push({
                        "name":midfielder.name,
                        "position":midfielder.position,
                        "img":[midfielder.img, midfielder.id],
                        "team":[team.img, team._id],
                    });
                }
            }
            for(const forward of forwards){
                if(forward.team_id == team.id){
                    forwardsFields.push({
                        "name":forward.name,
                        "position":forward.position,
                        "img":[forward.img, forward.id],
                        "team":[team.img, team._id],
                    });
                }
            }
        }
        res.send({"goalkeeper": goalkeeperField, "defenses": defensesFields, "midfielders": midfieldersFields, "forwards": forwardsFields});
    }

    /* Functions */
    private getBestPlayers(players: any, position: string, num: number){
        const bestPlayers = [];
        for(const player of players){
            if(player["position"] == position){
                bestPlayers.push(player);
                if(bestPlayers.length == num) break;
            }
        }
        return bestPlayers;
    }

    private async getPositions(){
        const players = await Player.find();
        let positions: Array<string> = [];

        for(const player of players){
            positions.push(player.position);
        }

        //Delete repeated elements
        positions = positions.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        return positions;
    }

    private getPlayersVariations(players: Array<PlayerDocument>, teams: Array<TeamDocument>){
        const playerFields: Array<any> = [];
        for(const player of players){
            for(const team of teams){
                if(player.team_id == team._id){
                    const match = player.playedAway + player.playedHome;
                    let mean = player.points/match;
                    const status = formatStatus(player.status, player.statusInfo);
                    if(!mean) mean=0;
                    playerFields.push([
                        player.position,
                        [team.img, team.id],
                        [player.name,player.id],
                        new Intl.NumberFormat().format(player.priceIncrement),
                    ]);
                }
            }
        }
        return playerFields;
    }

    private getDataPlayers(players: Array<PlayerDocument>, teams: Array<TeamDocument>){
        const playerFields: Array<any> = [];
        for(const player of players){
            for(const team of teams){
                if(player.team_id == team._id){
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
            }
        }
        return playerFields;
    }

    private async getAllMarketPlayers(req: Request, res: Response){
        const user: any = req.user;
        const listPlayers: Array<number> = [];
        const teamPlayers: Array<number> = [];
        const marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
        const marketPlayers = marketData[0].players;
        for(const player of marketPlayers){
            listPlayers.push(player["id"]);
        }

        const players =  await Player.find({_id:{$in: listPlayers}});

        for(const player of players){
            teamPlayers.push(player.team_id);
        }

        const teams = await Team.find({_id:{$in:teamPlayers}});

        const playerFields: Array<any> = [];
        for(let index=0; index<marketPlayers.length;index++){
            for(const player of players){
                if(player.id == marketPlayers[index]["id"]){
                    for(const team of teams){
                        if(player.team_id == team._id){
                            const status = formatStatus(player.status, player.statusInfo);
                            playerFields.push([
                                player.position,
                                [team.img, team.id],
                                [player.name, player.id],
                                player.points,
                                status,
                                setColorPoints(player.fitness),
                                new Intl.NumberFormat().format(player.price),
                                new Intl.NumberFormat().format(marketPlayers[index]["price"]),
                            ]);
                        }
                    }
                }
            }
        }

        const balance = new Intl.NumberFormat().format(marketData[0]["balance"]);
        const maximumBid = new Intl.NumberFormat().format(marketData[0]["maximumBid"]);
        
        return {"players":playerFields, "balance":balance,"maximumBid":maximumBid}; 
    }

    private async getPlayers(req: Request, res: Response, position: string){
        const user: any = req.user;
        const listPlayers: Array<number> = [];
        const teamPlayers: Array<number> = [];
        const marketData = await this.makeBiwengerRequest(res, this.api_address + endpointsUser.market, user, null);
        const marketPlayers = marketData[0].players;
        for(const player of marketPlayers){
            listPlayers.push(player["id"]);
        }

        const players =  await Player.find({position: position, _id:{$in: listPlayers}});

        for(const player of players){
            teamPlayers.push(player.team_id);
        }

        const teams = await Team.find({_id:{$in:teamPlayers}});

        const playerFields: Array<any> = [];
        for(let index=0; index<marketPlayers.length;index++){
            for(const player of players){
                if(player.id == marketPlayers[index]["id"]){
                    for(const team of teams){
                        if(player.team_id == team._id){
                            const match = player.playedAway + player.playedHome;
                            let mean = player.points/match;
                            const marketValues = this.formatMarketValue(player.prices);
                            const listReports = await this.getReportPlayer(player.reports_id);
                            const totalStatitics = this.getTotalStatitics(listReports);
                            const importance = await this.calculateImportance(player.team_id, player.points);
                            const status = formatStatus(player.status, player.statusInfo);
                            if(!mean) mean=0;
                            playerFields.push({
                                "name":player.name,
                                "position":player.position,
                                "img":[player.img,player.id],
                                "teamImg":[team.img, team.id],
                                "price": new Intl.NumberFormat().format(player.price),
                                "points":player.points,
                                "sale":player.sale,
                                "demand":player.demand,
                                "use":player.use,
                                "match":match,
                                "mean":mean.toFixed(2),
                                "penaltyTaker":(await this.isPenaltyTaker(player.team_id, player.id)),
                                "foulTaker":(await this.isFoulTaker(player.team_id, player.id)),
                                "importance":importance.toFixed(2),
                                "values":marketValues["values"],
                                "dateValues":marketValues["dateValues"],
                                "reports":listReports,
                                "totalStatitics": totalStatitics,
                                "role":(await this.getlineUpPlayer(player.id, player.team_id)),
                                "priceMarket":new Intl.NumberFormat().format(marketPlayers[index]["price"]),
                                "status":status
                            });
                        }
                    }
                }
            }
        }

        playerFields.sort(function(a, b){
            if ( parseInt(a.use) > parseInt(b.use) ) return -1;
            if ( parseInt(a.use) < parseInt(b.use) ) return 1;
            return 0;
        });

        if(playerFields.length > 4) playerFields.splice(4);

        return playerFields; 
    }

    private async getDataPlayer(player: PlayerDocument, team: TeamDocument, match: number){
        let mean = player.points/match;
        let meanHome = player.pointsHome/player.playedHome;
        let meanAway = player.pointsAway/player.playedAway;
        const marketValues = this.formatMarketValue(player.prices);
        const listReports = await this.getReportPlayer(player.reports_id);
        const totalStatitics = this.getTotalStatitics(listReports);
        const importance = await this.calculateImportance(player.team_id, player.points);
        const penaltyTaker = await this.isPenaltyTaker(player.team_id, player.id);
        const foulTaker = await this.isFoulTaker(player.team_id, player.id);
        const role = await this.getlineUpPlayer(player.id, player.team_id);
        const status = formatStatus(player.status, player.statusInfo);
        let tendecy: any = ["fas fa-equals", null];
        if(player.priceIncrement>0) tendecy = ["fa fa-angle-double-up", defaultValues.green];
        if(player.priceIncrement<0) tendecy = ["fa fa-angle-double-down", defaultValues.red];
        if(!mean) mean=0;
        if(!meanHome) meanHome=0;
        if(!meanAway) meanAway=0;
        const playerFields = {
            "name":player.name,
            "position":player.position,
            "img":[player.img, player.id],
            "teamImg":[team.img, team.id],
            "price": new Intl.NumberFormat().format(player.price),
            "points":player.points,
            "pointsHome":player.pointsHome,
            "pointsAway":player.pointsAway,
            "meanHome":meanHome.toFixed(2),
            "playedHome":player.playedHome,
            "playedAway":player.playedAway,
            "meanAway":meanAway.toFixed(2),
            "tendecy":tendecy,
            "sale":player.sale,
            "demand":player.demand,
            "use":player.use,
            "match":match,
            "mean":mean.toFixed(2),
            "penaltyTaker":penaltyTaker,
            "foulTaker":foulTaker,
            "importance":importance.toFixed(2),
            "values":marketValues["values"],
            "dateValues":marketValues["dateValues"],
            "reports":listReports,
            "totalStatitics": totalStatitics,
            "role":role,
            "status":status
        };
        return playerFields;
    }

    private async renderMarket(res: Response, players: Array<any>, window: string, nameWindow: string){
        res.render(window, {
            title: nameWindow,
            players: players,
            lastValues: parseInt(defaultValues.lastValues),
            lastRound: await this.getLastMatch()
        });
    }

    private async isPenaltyTaker(teamId: number, idPlayer: number){
        const penaltyTakers = await Team.findOne({_id:teamId});
        const isTaker = penaltyTakers.penalties.filter(number => number == idPlayer);
        if(isTaker.length > 0){
            return ["fa fa-check-circle", "green"];
        }
        return ["fas fa-ban", "red"];
    }

    private async isFoulTaker(teamId: number, idPlayer: number){
        const penaltyTakers = await Team.findOne({_id:teamId});
        const isTaker = penaltyTakers.fouls.filter(number => number == idPlayer);
        if(isTaker.length > 0){
            return ["fa fa-check-circle", "green"];
        }
        return ["fas fa-ban", "red"];
    }

    private getTotalStatitics(listReports: Array<any>){
        let numMVP=0;
        let numGoals=0;
        let yellowCard=0;
        let redCard=0;
        for(const report of listReports){
            if(report["mvp"]) numMVP++;
            if(report["yellowCard"]!=null) yellowCard+=report["yellowCard"];
            if(report["redCard"]!=null) redCard+=report["redCard"];
            if(report["goals"]!=null) numGoals+=report["goals"];
        }
        return [numMVP, numGoals, yellowCard, redCard];
    }

    private async getlineUpPlayer(idPlayer: number, idTeam: number){
        const lineUpPlayer = await Team.findOne({_id:idTeam});
        for(const player of lineUpPlayer.line_up_players_id){
            if(player == idPlayer){
                return "Pertenece al equipo base";
            }
        }
        return "No pertenece al equipo base";
    }

    private async getReportPlayer(reportsId: Array<string>){
        const reports = await Report.find({_id:{$in: reportsId}});
        const reportsPlayer: Array<any> = [];
        let reportPlayer: any;
        let result: [string,string];
        for(const round of this.allRounds){
            for(const report of reports){
                const matchId = await Match.findOne({_id:report.match_id});
                if(report.win) result=["V", defaultValues.green];
                if(report.tie) result=["E", defaultValues.orange];
                if(report.lost) result=["P", defaultValues.red];
                const roundId = await Round.findOne({_id:matchId.round_id});
                if(round == roundId.short){
                    const titular = this.isTitular(report.events, report.points);
                    const points = this.setColorPointReport(report.points, report.status);
                    reportPlayer = {"points":points, "picas":[report.picas,this.setColorPointsPicas(report.picas)], "goals":report.goals+report.goalsPenalty,"titular":titular, "result":result};
                    break;
                }
                
            }
            if(!reportPlayer){
                reportPlayer = {"points":[null,null], "picas":[null, null], "mvp":null, "goals":0, "titular":null, "result":null};
            }
            reportsPlayer.push({"points":reportPlayer["points"], "picas":reportPlayer["picas"], "mvp":reportPlayer["mvp"], "goals":reportPlayer["goals"],"titular":reportPlayer["titular"], "result":reportPlayer["result"], "round":round});
            reportPlayer=null;
        }
        return reportsPlayer;
    }

    private setColorPointReport(point: number, status: string){

        if(point == null || point == 0){
            if(status == "injured") return(["fa fa-plus", defaultValues.red]);
            if(status == "sanctioned") return(["fa fa-times", defaultValues.red]);
            if(status == "doubt") return(["fa fa-question", defaultValues.purple]);
            return(["fa fa-minus", null]);
        }
        if(point < 0) return([point.toString(), defaultValues.red]);
        if(point > 0 && point<6) return([point.toString(), defaultValues.orange]);
        if(point >= 6 && point<10) return ([point.toString(), defaultValues.green]);
        if(point >= 10) return ([point.toString(), defaultValues.blue]);

    }

    private isTitular(events: Array<any>, points: number){
        if(events != null && points != null){
            if(events.length == 0) return ["T", defaultValues.green];
            for(const i of events){
                if(Array.isArray(i)){
                    for(const j of i){
                        if(j["type"] == 5){
                            return ["S", defaultValues.red];
                        }
                    }
                    return ["T", defaultValues.green];
                }else{
                    if(i["type"] == 5){
                        return ["S", defaultValues.red];
                    }
                    return ["T", defaultValues.green];
                }
            }
        }else if(events == null && points != null){
            return ["T", defaultValues.green];
        }
        return ["S", defaultValues.red];
    }

    private setColorPointsPicas(picas: number){
        if(picas == 0) return defaultValues.red;
        if(picas == 1) return defaultValues.orange;
        if(picas == 2) return defaultValues.green;
        if(picas == 3) return defaultValues.blue;
        if(picas == 4) return defaultValues.purple;
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
    
    private async calculateImportance(teamId: number, points: number){
        const maxPointsByTeam: any = await this.getBestPlayerByTeam(teamId);
        let playerImportance: number = (points/maxPointsByTeam["points"])*10;
        if(playerImportance<0) playerImportance=0;
        return playerImportance;
    }

    private async getLastMatch(){
        const matches = await Match.find({status:"finished"});
        const lastMatch = matches.sort((a, b) => b["date"] - a["date"])[0];
        const lastRound = await Round.findOne({_id:lastMatch.round_id});
        return parseInt(lastRound.short.substr(1));
    }

    /* format functions */
    private formatMarketValue(valuesPlayer: Array<any>){
        const values = [];
        const dateValues = [];
        let index = 0;
        valuesPlayer = valuesPlayer.reverse();
        for(const item of valuesPlayer){
            if (index==parseInt(defaultValues.lastValues)) break; 
            values.push(item[1]);
            dateValues.push(this.formatDate(item[0]));
            index++;
        }

        return {"values":values.reverse(), "dateValues":dateValues.reverse()};
    }

    private formatBalance(balance: string){
        let balanceInt = "";
        const balanceList = balance.split(",");
        for(const item of balanceList){
            balanceInt = balanceInt + item;
        }
        return Number.parseInt(balanceInt);
    }

    private formatDate(date: string){
        const dateString = ""+date;
        const formatDate = "";
        return formatDate.concat(dateString.charAt(4),dateString.charAt(5),"/",dateString.charAt(2),dateString.charAt(3),"/",dateString.charAt(0),dateString.charAt(1));
    }

    private async makeBiwengerRequest(res: Response, url: string, user: UserDocument, price: number) {
        return axios.get("http://" + url, {
            params:{
                user: user.profile.emailBiwenger,
                password: decryptData(user.profile.passwordBiwenger),
                league: user.leagues[user.defaultLeague].x_league,
                userLeague: user.leagues[user.defaultLeague].x_user,
                price: price
            }
        }).then(response => {
            return response.data;
        }).catch(error => {
            return 400;
        });
    };

}
