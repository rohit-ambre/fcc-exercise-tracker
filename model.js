// var mongo = require('mongodb');
var mongoose = require('mongoose');
const shortId = require('shortid')


const Schema = mongoose.Schema;
const personExerciseSchema = new Schema({
    shortId: { type: String, unique: true, default: shortId.generate },
    username: String,
    exercise: [{
        description: String,
        duration: Number,
        date: {}
    }]
});

const personExercise = mongoose.model('exercise', personExerciseSchema);

exports.createUser = (name, done) => {
    personExercise.findOne({ username: name }, (err, data) => {

        if (data == null) {
            const person = new personExercise({ username: name, exercise: [] });
            person.save((err, data) => {
                if (err) return done(err)
                return done(null, data)
            })
        } else if (err) {
            return done(err)
        } else {
            return done(null, "taken")
        }
    })
}

exports.addExercise = (userId, exerciseData, done) => {

    personExercise.findOne({ shortId: userId }, (err, data) => {
        if (data == null) {
            return done(err, 'notfound');
        } else {
            data.exercise = data.exercise.concat(exerciseData);
        }

        data.save((err, data) => {
            if (err) {
                return done(err, null)
            } else {
                return done(null, data)
            }
        })
    })
}