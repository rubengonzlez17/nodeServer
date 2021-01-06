import mongoose from "mongoose";
/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export type MatchDocument = mongoose.Document & {
    _id: number;
    date: number;
    status: string;
    round_id: number;
    home: {
        team_id: number;
    };
    away: {
        team_id: number;
    };
}

const matchSchema = new mongoose.Schema({
    _id: Number,
    date: Number,
    status: String,
    round_id: Number,
    home:{
        team_id:Number,
    },
    away:{
        team_id:Number,
    }
}, { collection: "Matches", strict: false });

export const Match = mongoose.model<MatchDocument>("Matches", matchSchema);
