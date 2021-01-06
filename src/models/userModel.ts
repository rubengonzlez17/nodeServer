import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

export interface League extends Document {
    name_league: string;
    x_league: number;
    x_user: number;
}

export type UserDocument = mongoose.Document & {
    email: string;
    password: string;
    passwordResetToken: string;
    passwordResetExpires: Date;

    tokens: AuthToken[];

    profile: {
        name: string;
        surname: string;
        emailBiwenger: string;
        passwordBiwenger: string;
    };

    leagues: Array<League>;
    defaultLeague: number;

    comparePassword: comparePasswordFunction;
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

export interface AuthToken {
    accessToken: string;
    kind: string;
}

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    tokens: Array,
    profile: {
        name: String,
        surname: String,
        emailBiwenger: String,
        passwordBiwenger: String
    },
    leagues: Array,
    defaultLeague: Number

}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
    const user = this as UserDocument;
    
    if (!user.isModified("password")) { 
        return next();
    }
    
    bcrypt.genSalt(10, (err, salt) => {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
        cb(err, isMatch);
    });
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>("User", userSchema);
