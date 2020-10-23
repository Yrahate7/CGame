const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors');
var dbClient = require('mongodb').MongoClient;
let jwt = require('jsonwebtoken');
let config = require('./config');
let middleware = require('./middleware');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const namePattern = /^[a-zA-Z]+$/;
const emailPattern = /\S+@\S+\.\S+/;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;
const emptyString = /([^\s]*)/;
const isMale = /^Male$/;
const isFemale = /^Female$/;

//Database URL
const DBUrl = "mongodb://localhost:27017/CGame";

app.post("/login", (req, res) => {
    let user = req.body;
    try {

        dbClient.connect(DBUrl, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("CGame");

            try {
                let phoneFromReq = user.phoneNumber;
                let passFromReq = user.password;

                dbo.collection("users").find({ phoneNumber: phoneFromReq }).toArray(function (err, result) {
                    // if cannot find user collection
                    if (err) {
                        // db.close();
                        console.log(err);
                        res.json({
                            status: "Failed",
                            message: "Cannot find the collection named users"
                        });
                        db.close();
                    }
                    else {
                        // double checking
                        if (result.length != 0) {
                            // only check result if we can find an entry in database 
                            if (result[0].phoneNumber === phoneFromReq) {
                                let dbPassword = result[0].password;
                                if (passFromReq === dbPassword) {
                                    // Generate jwt and send it back
                                    let token = jwt.sign({ phoneNumber: phoneFromReq },
                                        config.secret,
                                        {
                                            expiresIn: '24h' // expires in 24 hours
                                        }
                                    );

                                    res.json({
                                        status: "Success",
                                        message: 'Authentication successful!',
                                        token: token
                                    });
                                    db.close();
                                }
                                else {
                                    // forbidden , Wrong password
                                    res.sendStatus(403);
                                    db.close();
                                }
                            }
                        }
                        else {
                            res.json({
                                status: "Failed",
                                message: "Invalid UserName"
                            });
                            db.close();
                        }
                    }
                });
            } catch (error) {
                // Check auth request
                res.sendStatus(400);
                db.close();
            }

        });
    } catch (error) {
        res.json({ status: "Error in connecting to db" });
    }
});

app.get("/", middleware.checkToken, (req, res) => {
    res.json({ status: "Success" });
});

// Route for creating a new User
app.post("/adduser", function (req, res) {

    // array to hold error logs
    var errorLog = [];

    var sendData = true;

    // Request body already comes in raw json. no need to parse it
    user = req.body;

    // if name pattern doesnt match firstname
    if (!namePattern.test(user.firstName)) {
        errorLog.push({ firstName: "failed" });
        sendData = false;
    }

    // if name pattern doesnt match lastName
    if (!namePattern.test(user.lastName)) {
        sendData = false;
        errorLog.push({ lastName: "failed" });
    }

    // if emailpattern doesnt match email
    if (!emailPattern.test(user.email)) {
        errorLog.push({ email: "failed" });
    }

    // if password pattern doesnt match Password
    if (!passwordPattern.test(user.password)) {
        sendData = false;
        errorLog.push({ password: "failed" });
    }

    // if emptyString pattern doesnt match City
    if (!emptyString.test(user.city)) {
        sendData = false;
        errorLog.push({ city: "failed" });
    }

    // if emptyString pattern doesnt match Country
    if (!emptyString.test(user.country)) {
        sendData = false;
        errorLog.push({ country: "failed" });
    }

    // if not male or female 
    if (!isMale.test(user.gender) && !isFemale.test(user.gender)) {
        sendData = false;
        errorLog.push({ gender: "failed" });
    }

    // if phoneNumber pattern doesnt match phoneNumber
    if (user.phoneNumber.length < 4) {
        sendData = false;
        errorLog.push({ phoneNumber: "failed" });
    }

    if (sendData) {
        try {

            dbClient.connect(DBUrl, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, db) {
                if (err) throw err;

                var dbo = db.db("CGame");
                phone = user.phoneNumber;
                dbo.collection("users").find({ phoneNumber: phone }).toArray(function (err, result) {
                    // if cannot find user collection
                    if (err) {
                        // db.close();
                        console.log(err);
                        res.json({
                            status: "Failed",
                            message: "Cannot find the collection named users"
                        });
                        db.close();
                    }
                    else {
                        // if no error
                        if (result.length == 0) {

                            dbo.collection("users").insertOne(user, function (err, response) {
                                // for uncertain errors 
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        status: "Failed",
                                        message: err
                                    });
                                    db.close();
                                }
                                else {
                                    res.json({ status: "Success" });
                                    db.close();
                                }
                            });
                        } else {
                            res.json({
                                status: "Failed",
                                message: "User already exists"
                            });
                            db.close();
                        }

                    }
                });


            });
        } catch (error) {
            res.json({
                status: "Failed",
                message: "Error in connecting to db"
            });
        }
    } else {
        res.json({
            status: "Failed",
            message: "Check Error log",
            errorLog: errorLog
        });
    }

});


const port = 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`)
})