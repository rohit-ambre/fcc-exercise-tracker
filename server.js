const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true);

app.use(cors({ optionSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))

const personExercise = require('./model');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/exercise/new-user', (req, res) => {
    const name = req.body.username;
    if (!name) {
        res.json({ "response": false, "message": "username is required" });
    } else {
        personExercise.createUser(name, (err, data) => {
            if (err) {
                res.json({ "response": false, "message": "try again later" });
            }
            if (data == "taken") {
                res.json({ response: false, message: "username already exist" });
            } else {
                res.json({ response: true, username: data.username, id: data.shortId })
            }
        })
    }
});


app.post('/api/exercise/add', (req, res) => {
    let exeDate = Date.parse(new Date);

    if (!req.body.userId) {
        res.json({ "response": false, "message": "userId is mandatory" });
    }

    if (req.body.date) {
        exeDate = Date.parse(req.body.date);
    }

    let exerciseData = {
        description: req.body.description,
        duration: req.body.duration,
        date: exeDate,
        created_at: new Date()
    }

    personExercise.addExercise(req.body.userId, exerciseData, (err, data) => {
        if (err) {
            res.json({ response: false, message: "some error while adding" })
        } else if (data == "notfound") {
            res.json({ response: false, message: "user does not exist" });
        } else {
            res.send({ username: data.username, exercise: exerciseData })
        }
    });
})

isValidDate = d => {
    return new Date(d);
}


app.get('/api/exercise/log/', (req, res) => {
    if (!req.query.userId) {
        res.json({ "response": false, "message": "userId is mandatory" })
    }
    let from, to, limit = null;
    const { userId } = req.query;
    if (req.query.from && isValidDate(req.query.from) != null) {
        from = Date.parse(req.query.from);
    }
    if (req.query.to && isValidDate(req.query.to) != null) {
        to = Date.parse(req.query.to);
    }
    if (req.query.limit) {
        limit = req.query.limit;
    }
    personExercise.getLog(userId, from, to, limit, (err, data) => {
        if (err) {
            res.json({ response: false, message: "there's error" });
        } else if (data === "notfound") {
            res.json({ response: false, message: "user does not exist" })
        } else {
            res.json({ data })
        }
    });
});

// Not found middleware
app.use((req, res, next) => {
    return next({ status: 404, message: 'not found' })
})

// Error Handling middleware
app.use((err, req, res, next) => {
    let errCode, errMessage

    if (err.errors) {
        // mongoose validation error
        errCode = 400 // bad request
        const keys = Object.keys(err.errors)
        // report the first validation error
        errMessage = err.errors[keys[0]].message
    } else {
        // generic or custom error
        errCode = err.status || 500
        errMessage = err.message || 'Internal Server Error'
    }
    res.status(errCode).type('txt')
        .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})

module.exports = listener;