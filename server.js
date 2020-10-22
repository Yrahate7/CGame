const express = require('express');
const bodyParser = require("body-parser");
var cors = require('cors');
var dbClient = require('mongodb').MongoClient;
const app = express();


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const namePattern = /^[a-zA-Z]+$/;
const emailPattern = /\S+@\S+\.\S+/;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;
const emptyString = /([^\s]*)/;
const isMale = /^Male$/;
const isFemale = /^Female$/;

//Database URL
const DBUrl = "mongodb://localhost:27017/CGame";



// app.get("/fetchusers", function (req, res) {
//     // find all users and send them back to the client
//     Users.find({})
//         .then(function (dbResult) {
//             res.json(dbResult);
//         })
//         .catch(function (err) {
//             res.json(err);
//         })
// });

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

            dbClient.connect(DBUrl, function (err, db) {
                if (err) throw err;

                var dbo = db.db("CGame");
                db.close();
                phone = user.phoneNumber;
                dbo.collection("users").find({ phoneNumber: phone }).toArray(function (err, result) {
                    // if cannot find user collection
                    if (err) {
                        db.close();
                        res.json({ status: "Cannot find the collection named users" });
                    }
                    else {
                        // if no error
                        if (result) {
                            dbo.collection("users").insertOne(user, function (err, res) {
                                if (err) {
                                    res.json({ status: "Failed to create user" });
                                }
                                else {
                                    res.json({ status: "Success" })
                                }
                                console.log("Doc created");
                                db.close();
                            });
                        } else {
                            res.json({ status: "User already exists" });
                        }
                        db.close();
                    }
                });

            });
        } catch (error) {

            res.json({ status: "Error" })
        }
    } else {

        res.json(errorLog);
    }

});


const port = 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`)
})