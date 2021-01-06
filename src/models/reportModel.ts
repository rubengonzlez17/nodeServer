import mongoose from "mongoose";
/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export type ReportDocument = mongoose.Document & {
    status: string;
    points: number;
    picas: number;
    mvp: boolean;
    tie: boolean;
    win: boolean;
    lost: boolean;
    yellowCard: number;
    redCard: number;
    goals: number;
    goalsPenalty: number;
    ownGoals: number;
    events: Array<any>;
    match_id: number;
}

const reportSchema = new mongoose.Schema({
    status:String,
    points:Number,
    picas:Number,
    mvp:Boolean,
    tie:Boolean,
    win:Boolean,
    lost:Boolean,
    yellowCard:Number,
    redCard:Number,
    goals:Number,
    goalsPenalty:Number,
    ownGoals:Number,
    events: Array,
    match_id:Number,    

}, { collection: "Reports", strict: false });

export const Report = mongoose.model<ReportDocument>("Reports", reportSchema);
