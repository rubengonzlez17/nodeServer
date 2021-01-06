import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import smtpTransport from "nodemailer-smtp-transport";
import axios from "axios";
import passport from "passport";
import { WriteError } from "mongodb";
import { User, UserDocument, AuthToken, League } from "../models/userModel";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import "../config/passport";
import { encryptData } from "../utils/crypt";

enum endpointsUser {
    isUser = "/is_user",
    getUser ="/get_user"
}

enum  endpoints {
    User = "player"
}
export class UserController{
    public api_address: string = process.env.MANAGER_API + "/" + endpoints.User.toLowerCase();

    /**
     * POST /login
     * Sign in using email and password.
     */
    public postLogin = (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (email == null || email == "") {
            req.flash("errors", "Introduzca un nombre de usuario");
            return res.redirect("/");
        }

        if (password == null || password == "") {
            req.flash("errors", "Introduzca una contraseña");
            return res.redirect("/");
        }

        passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
            if (err) { return next(err); }
            if (!user) {
                req.flash("errors", "Usuario o contraseña incorrectos");
                return res.redirect("/");
            }
            req.logIn(user, (err) => {
                if (err) { return next(err); }
                res.redirect("/");
            });
        })(req, res, next);
    };

    /**
     * GET /logout
     * Log out.
     */
    public logout = (req: Request, res: Response) => {
        req.logout();
        res.redirect("/");
    };

    /**
     * GET /account/profile
     */
    public getProfile = (req: Request, res: Response)=>{
        if(!req.user){
            return res.redirect("/");
        }
        res.render("account/profile",{
            title:"Perfil"
        });
    };

    /**
     * POST /account/remove
     * remove account page
     */
    public async postRemove(req: Request, res: Response) {
        if (!req.user) {
            return res.redirect("/");
        }

        // Get current user
        const user: any = req.user;
        
        User.findOne({ _id : user.id }, (err, user: any)=>{
            user.remove();
            return res.redirect("/");
        });

    }

    /**
     * POST /account/modify-password
     */
    public async postModifyPassword(req: Request, res: Response){
        if (!req.user) {
            return res.redirect("/");
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (currentPassword == null){
            req.flash("errors", "La contraseña actual es incorrecta");
            return res.redirect("/account/profile");
        }

        // Get current user
        const user: any = req.user;
        
        // If user does not exists return error
        if(user == null){
            req.flash("errors", "La contraseña actual es incorrecta");
            return res.redirect("/account/profile");
        }

        if(newPassword.length < 6) {
            req.flash("errors", "La contraseña debe tener más de 6 caracteres");
            return res.redirect("/account/profile");
        }
        if(newPassword !== confirmPassword) {
            req.flash("errors", "Las contraseñas no coinciden");
            return res.redirect("/account/profile");
        }

        User.findOne({ _id : user.id }, (err, user: any)=>{
            user.password = newPassword;
            user.save();
            req.flash("success", "La contraseña se modifico satisfactoriamente");
            return res.redirect("/account/profile");
        });

    }

    /**
     * POST /account/modify
     */
    public async postModify(req: Request, res: Response){
        if (!req.user) {
            return res.redirect("/");
        }
        const { name, surname } = req.body;
        const currentUser: any = req.user;

        if (name == null || name == "") {
            req.flash("errors", "El campo nombre esta vacio");
            return res.redirect("/account/profile");
        }
        if (surname == null || surname == "") {
            req.flash("errors", "El campo apellidos esta vacio");
            return res.redirect("/account/profile");
        }

        User.findOne({ email : currentUser.email }, (err, user: any)=>{
            user.profile.name = name;
            user.profile.surname = surname;
            user.save();
            req.flash("success", "Datos actualizados");
            return res.redirect("/account/profile");
        });
    }

    /**
     * GET /account/signup
     * Signup page.
     */
    public getSignup = (req: Request, res: Response) => {
        if (req.user) {
            return res.redirect("/");
        }
        res.render("account/signup", {
            title: "Crear Cuenta"
        });
    };

    /**
     * POST /account/signup
     * Create a new local account.
     */
    public postSignup = async (req: Request, res: Response, next: NextFunction) => {
        const { email, password, confirmPassword, name, surname, emailBiwenger, passwordBiwenger } = req.body;
        const leagues: Array<League> = [];
        let status=null;
        if(email == null || email == ""){
            req.flash("errors", "El campo email esta vacio");
            return res.redirect("/account/signup");
        }

        if(name == null || name == ""){
            req.flash("errors", "El campo nombre esta vacio");
            return res.redirect("/account/signup");
        }

        if(surname == null || surname == ""){
            req.flash("errors", "El campo apellido esta vacio");
            return res.redirect("/account/signup");
        }

        if(password == null || password == ""){
            req.flash("errors", "El campo contraseña esta vacio");
            return res.redirect("/account/signup");
        }

        if(emailBiwenger == null || emailBiwenger == ""){
            req.flash("errors", "El campo email de Biwenger esta vacio");
            return res.redirect("/account/signup");
        }

        if(passwordBiwenger == null || passwordBiwenger == ""){
            req.flash("errors", "El campo contraseña de Biwenger esta vacio");
            return res.redirect("/account/signup");
        }

        if (password.length < 6) {
            req.flash("errors", "La contraseña debe tener más de 6 caracteres");
            return res.redirect("/account/signup");
        }
        if(password !== confirmPassword) {
            req.flash("errors", "LAs contraseña no coinciden");
            return res.redirect("/account/signup");
        }

        //make request to is_user
        await this.makeBiwengerRequest(res, this.api_address + endpointsUser.isUser, emailBiwenger, passwordBiwenger).then(data => {
            status = data;
        });

        if(status == 400){
            req.flash("errors", "El nombre o contraseña de Biwenger es incorrecto");
            return res.redirect("/account/signup");
        }

        //get user leagues
        await this.makeBiwengerRequest(res, this.api_address + endpointsUser.getUser, emailBiwenger, passwordBiwenger).then(data => {
            for(const league of data.credentials["x_leagues"]){
                leagues.push(league);
            }
        });

        const user = new User({
            email: email,
            password: password,
            profile: {
                name: name,
                surname: surname,
                emailBiwenger: emailBiwenger,
                passwordBiwenger: encryptData(passwordBiwenger)
            },
            leagues:leagues,
            defaultLeague:0
        });

        User.findOne({ email: req.body.email }, (err, existingUser) => {
            if (err) { return next(err); }
            if (existingUser) {
                req.flash("errors", "Ya existe un usuario con ese email");
                return res.redirect("/account/signup");
            }
            user.save((err) => {
                if (err) { return next(err); }
                req.flash("success", "Usuario creado satisfactoriamente");
                return res.redirect("/");
            });
        });
    };

    /**
     * GET /account/forgot
     * Forgot Password page.
     */
    public getForgot = (req: Request, res: Response) => {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        res.render("account/forgot", {
            title: "Recordar Contraseña",
            reset: false
        });
    };

    /**
     * POST /account/forgot
     * Create a random token, then the send user an email with a reset link.
     */
    public postForgot = (req: Request, res: Response, next: NextFunction) => {
        const { email } = req.body; 

        async.waterfall([
            function createRandomToken(done: Function) {
                crypto.randomBytes(16, (err, buf) => {
                    const token = buf.toString("hex");
                    done(err, token);
                });
            },
            function setRandomToken(token: AuthToken, done: Function) {
                User.findOne({ email: email }, (err, user: any) => {
                    if (err) { return done(err); }
                    if (!user) {
                        req.flash("errors", "No existe usuario con ese email");
                        return res.redirect("/account/forgot");
                    }
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 600000; // 10 min
                    user.save((err: WriteError) => {
                        done(err, token, user);
                    });
                });
            },
            function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: Function) {
                const transporter = nodemailer.createTransport(smtpTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.SENDGRID_USER,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                }));
                const mailOptions = {
                    to: user.email,
                    from: process.env.SENDGRID_USER,
                    subject: "Restablecer contraseña",
                    text: `Recibió este correo electrónico porque usted (u otra persona) solicitó el restablecimiento de la contraseña de su cuenta.\n\n
                            Haga click en el siguiente enlace o péguelo en su navegador para completar el proceso:\n\n
                            http://${req.headers.host}/reset/${token}\n\n
                            Si no solicitó esto, ignore este correo electrónico y su contraseña permanecerá sin cambios.\n`
                };
                transporter.sendMail(mailOptions, (err) => {
                    req.flash("success", `Un email se envio al correo ${user.email} con las instrucciones a seguir.`);
                    done(err);
                });
            }
        ], (err) => {
            if (err) { return next(err); }
            res.redirect("/account/forgot");
        });
    };

    /**
     * GET /reset/:token
     * Reset Password page.
     */
    public getReset = (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            return res.redirect("/");
        }
        User.findOne({ passwordResetToken: req.params.token })
            .where("passwordResetExpires").gt(Date.now())
            .exec((err, user: any) => {
                if (err) { return next(err); }
                if (!user) {
                    req.flash("errors", "El token de recuperar contraseña es incorrecto o ha expirado");
                    return res.redirect("/account/forgot");
                }
                res.render("account/forgot", {
                    title: "Recuperar Contraseña",
                    reset: true,
                    token: req.params.token
                });
            });
    };

    /**
     * POST /reset/:token
     * Process the reset password request.
     */
    public postReset = (req: Request, res: Response, next: NextFunction) => {
        const { password, confirmPassword, token } = req.body;

        if (password.length < 6) {
            req.flash("errors", "La contraseña debe tener más de 6 caracteres");
            return res.redirect("back");
        }
        if(password !== confirmPassword) {
            req.flash("errors", "Las contraseñas no coinciden");
            return res.redirect("back");
        }

        async.waterfall([
            function resetPassword(done: Function) {
                User.findOne({ passwordResetToken: token })
                    .where("passwordResetExpires").gt(Date.now())
                    .exec((err, user: any) => {
                        if (err) { return next(err); }
                        if (!user) {
                            req.flash("errors", "El token de recuperar contraseña es incorrecto o ha expirado");
                            return res.redirect("back");
                        }
                        user.password = password;
                        user.passwordResetToken = undefined;
                        user.passwordResetExpires = undefined;
                        user.save((err: WriteError) => {
                            if (err) { return next(err); }
                            done(err, user);
                        });
                    });
            },
            function sendResetPasswordEmail(user: UserDocument, done: Function) {
                const transporter = nodemailer.createTransport(smtpTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.SENDGRID_USER,
                        pass: process.env.SENDGRID_PASSWORD
                    }
                }));
                const mailOptions = {
                    to: user.email,
                    from: process.env.SENDGRID_USER,
                    subject: "Su contraseña ha sido actualizada",
                    text: `Hola,\n\nEsta es una confirmación de que la contraseña de su cuenta ${user.email} acaba de ser cambiada.\n`
                };
                transporter.sendMail(mailOptions, (err) => {
                    req.flash("success", "Tu contraseña ha sido modificada satisfactoriamente");
                    done(err);
                });
            }
        ], (err) => {
            if (err) { return next(err); }
            res.redirect("/");
        });
    };

    /**
     * GET /change-league/:league
     * Process default league change.
     */
    public getChangeLeague = (req: Request, res: Response) => {
        if (!req.user) {
            return res.redirect("/");
        }

        const user: any = req.user;
        if(user){
            user.defaultLeague=req.params.league;
            user.save();
        }

        return res.redirect("back");
    }
    
    private async makeBiwengerRequest(res: Response, url: string, user: string, password: string) {
        return axios.get("http://" + url, {
            params:{
                user: user,
                password: password
            }
        }).then(response => {
            return response.data;
        }).catch(error => {
            return 400;
        });
    };

}


