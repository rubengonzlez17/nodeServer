import express from "express";

// Controllers (route handlers)
import { HomeController } from "../controllers/homeController";
import { UserController } from "../controllers/userController";
import { PlayersController } from "../controllers/playersController";
import { TeamsController } from "../controllers/teamsController";
export class Routes{

    public homeController: HomeController = new HomeController();
    public userController: UserController = new UserController();
    public playersController: PlayersController = new PlayersController();
    public teamsController: TeamsController = new TeamsController();

    public doRouting(app: express.Application): void{
        //Users
        app.get("/", this.homeController.home);
        app.post("/login", this.userController.postLogin);
        app.get("/logout", this.userController.logout);
        app.get("/reset/:token", this.userController.getReset);
        app.post("/reset", this.userController.postReset);

        app.get("/account/signup", this.userController.getSignup);
        app.post("/account/signup", this.userController.postSignup);
        app.get("/account/forgot", this.userController.getForgot);
        app.post("/account/forgot", this.userController.postForgot);
        app.get("/account/change-league/:league", this.userController.getChangeLeague);
        app.get("/account/profile", this.userController.getProfile);
        app.post("/account/remove", this.userController.postRemove);
        app.post("/account/modify", this.userController.postModify);
        app.post("/account/modify-password", this.userController.postModifyPassword);

        //MyTeam
        app.get("/myTeam", this.playersController.getTeam);
        app.get("/recommendedTeam", this.playersController.getRecommendedTeam);
        app.post("/getRecommendedTeamByFilters", this.playersController.getRecommendedTeamByFilters);

        //News
        app.get("/variations", this.playersController.getVariations);

        //Market
        app.get("/all-market", this.playersController.getAllMarket);
        app.get("/goalkeepers", this.playersController.getGoalkeepers);
        app.get("/defenses", this.playersController.getDefenses);
        app.get("/midfielders", this.playersController.getMidfielders);
        app.get("/forwards", this.playersController.getForwards);

        //Spanish League
        //Players
        app.get("/players", this.playersController.getAllPlayers);
        app.post("/getPlayersByFilters", this.playersController.getPlayerByFilters);
        app.get("/player/:id", this.playersController.getPlayer);
        //Teams
        app.get("/teams", this.teamsController.getTeams);
        app.get("/team/:id", this.teamsController.getTeam);

        //recommended
        app.get("/conservative", this.playersController.getConservativeStrategy);
        app.get("/moderate", this.playersController.getModerateStrategy);
        app.get("/aggressive", this.playersController.getAggressiveStrategy);
        app.post("/getRecommendedPlayerByFilters", this.playersController.getRecommendedPlayerByFilters);

    }
    
}
