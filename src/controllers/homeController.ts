import { Request, Response } from "express";

export class HomeController{

    /**
     * GET /
     * Home page.
     */
    public home = (req: Request, res: Response) => {
        if (req.user) {
            res.redirect("variations");
            
        }else{
            res.render("login", {
                title: "Login"
            });
        }
    };

}

