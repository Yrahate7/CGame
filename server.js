const express = require('express');
var mongoose = require("mongoose");
const Users = require("./UserSchema.js");
const app = express();
var cors = require('cors');
app.use(cors());

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Database URL
const DBUrl = "mongodb://localhost:27017/CGame";

// connect to db
mongoose.connect(DBUrl, { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/fetchusers", function (req, res) {
    // find all users and send them back to the client
    Users.find({})
        .then(function (dbResult) {
            res.json(dbResult);
        })
        .catch(function (err) {
            res.json(err);
        })
});

// Route for creating a new User
app.post("/adduser", function (req, res) {
    Users.create(req.body)
        .then(function (dbResult) {
            // If we were able to successfully create a User, send it back to the client
            res.json(dbResult);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


const port = 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`)
})