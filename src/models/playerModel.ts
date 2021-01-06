import mongoose from "mongoose";
/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export type PlayerDocument = mongoose.Document & {
    _id: number;
    name: string;
    position: string;
    price: number;
    priceIncrement: number;
    birthdate: string;
    status: string;
    statusInfo: string;
    points: number;
    fitness: Array<number>;
    pointsHome: number;
    pointsAway: number;
    pointsLastSeason: number;
    playedHome: number;
    playedAway: number;
    img: string;
    quality: string;
    objetivePrice: string;
    tendecy: string;
    demand: string;
    sale: string;
    use: string;
    prices: Array<any>;
    team_id: number;
    reports_id: Array<string>;
}

const playerSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    position: String,
    price: Number,
    priceIncrement: Number,
    birthdate: String,
    status: String,
    statusInfo: String,
    points: Number,
    fitness: Array,
    pointsHome: Number,
    pointsAway: Number,
    pointsLastSeason: Number,
    playedHome: Number,
    playedAway: Number,
    img: String,
    quality: String,
    objetivePrice: String,
    tendecy: String,
    demand: String,
    sale: String,
    use: String,
    prices: Array,
    team_id: Number,
    reports_id: Array,

}, { collection: "Players", strict: false });

export const Player = mongoose.model<PlayerDocument>("Players", playerSchema);
