var mongo = require('mongodb');
var mongoose = require('mongoose');


const Schema = mongoose.Schema;
const exerciseSchema = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },
    username: String,
    exercise: [{
        description: String,
        duration: Number,
        date: {}
    }]
});

const URL = mongoose.model('exercise', exerciseSchema);
