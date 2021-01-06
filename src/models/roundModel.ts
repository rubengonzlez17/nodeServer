import mongoose from "mongoose";
/*eslint @typescript-eslint/camelcase: ["error", {properties: "never"}]*/

export type RoundDocument = mongoose.Document & {
    _id: number;
    name: string;
    short: string;
}

const roundSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    short: String,

}, { collection: "Rounds", strict: false });

export const Round = mongoose.model<RoundDocument>("Rounds", roundSchema);