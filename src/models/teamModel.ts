import mongoose from "mongoose";
/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export type TeamDocument = mongoose.Document & {
    _id: number;
    name: string;
    position: number;
    points: number;
    won: number;
    lost: number;
    tied: number;
    scored: number;
    against: number;
    img: string;
    penalties: Array<number>;
    fouls: Array<number>;
    line_up: string;
    line_up_players_id: Array<number>;
    next_match_id: number;
}

const teamSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    position: Number,
    points: Number,
    won: Number,
    lost:Number,
    tied: Number,
    scored: Number,
    against: Number,
    img: String,
    penalties: Array,
    fouls: Array,
    line_up: String,
    line_up_players_id: Array,
    next_match_id: Number,

}, { collection: "Teams", strict: false });

export const Team = mongoose.model<TeamDocument>("Teams", teamSchema);
