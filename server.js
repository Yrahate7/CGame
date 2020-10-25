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


///// Regex for matching /////
const namePattern = /^[a-zA-Z]+$/;
const emailPattern = /\S+@\S+\.\S+/;
const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/;
const emptyString = /([^\s]*)/;
const isMale = /^Male$/;
const isFemale = /^Female$/;

//Database URL
const DBUrl = "mongodb://localhost:27017/CGame";

//// Method for validation
validate = (user) => {
    // array to hold error logs
    var errorLog = [];

    // flag variable to determine whether to send data or not
    var sendData = true;

    // if name pattern doesnt match firstname
    if ((!namePattern.test(user.firstName)) || (typeof user.firstName !== "string")) {
        errorLog.push({ firstName: "failed" });
        sendData = false;
    }

    // if name pattern doesnt match lastName
    if ((!namePattern.test(user.lastName)) || (typeof user.lastName !== "string")) {
        sendData = false;
        errorLog.push({ lastName: "failed" });
    }

    // if emailpattern doesnt match email
    if ((!emailPattern.test(user.email)) || (typeof user.email !== "string")) {
        errorLog.push({ email: "failed" });
    }

    // if password pattern doesnt match Password
    if ((!passwordPattern.test(user.password)) || (typeof user.password !== "string")) {
        sendData = false;
        errorLog.push({ password: "failed" });
    }

    // if emptyString pattern doesnt match City
    if ((!emptyString.test(user.city)) || (typeof user.city !== "string")) {
        sendData = false;
        errorLog.push({ city: "failed" });
    }

    // if emptyString pattern doesnt match Country
    if ((!emptyString.test(user.country)) || (typeof user.country !== "string")) {
        sendData = false;
        errorLog.push({ country: "failed" });
    }

    // if not male or female 
    if (((!isMale.test(user.gender)) && (!isFemale.test(user.gender))) || (typeof user.gender !== "string")) {
        sendData = false;
        errorLog.push({ gender: "failed" });
    }

    // Phone Number must be passed as string, otherwise we are failing test conditions
    if ((user.phoneNumber.length < 4) || (typeof user.phoneNumber !== "string")) {
        sendData = false;
        errorLog.push({ phoneNumber: "failed" });
    }

    validationResult = { sendData: sendData, errorLog: errorLog };

    return validationResult;

}

/// Route for getting jwt token for user
app.post("/login", (req, res) => {
    let user = req.body;

    // check empty body
    if (Object.keys(user).length === 0 && user.constructor === Object) {
        res.json({
            status: "Failed",
            message: "Empty Request body"
        });
    }
    else {
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
                                        let token = jwt.sign({ phoneNumber: phoneFromReq, role: result[0].role },
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
    }
});


/// Route for getting jwt token for Admin
app.post("/adminlogin", (req, res) => {
    let user = req.body;

    // check empty body
    if (Object.keys(user).length === 0 && user.constructor === Object) {
        res.json({
            status: "Failed",
            message: "Empty Request body"
        });
    }
    else {

        try {

            dbClient.connect(DBUrl, { useUnifiedTopology: true, useNewUrlParser: true }, function (err, db) {
                if (err) throw err;
                var dbo = db.db("CGame");

                try {
                    let phoneFromReq = user.phoneNumber;
                    let passFromReq = user.password;

                    dbo.collection("users").find({ phoneNumber: phoneFromReq, role: "Admin" }).toArray(function (err, result) {
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
                                        let token = jwt.sign({ phoneNumber: phoneFromReq, role: result[0].role },
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
    }
});



app.get("/", middleware.checkToken, (req, res) => {
    res.json({ status: "Success" });
});

app.get("/admin", middleware.checkAdminToken, (req, res) => {
    res.json({ status: "Success" });
});

// Route for creating a new User
app.post("/adduser", function (req, res) {

    // Request body already comes in raw json. no need to parse it
    user = req.body;

    // check empty body
    if (Object.keys(user).length === 0 && user.constructor === Object) {
        res.json({
            status: "Failed",
            message: "Empty Response body"
        });
    }
    else {

        // Call method called validate which will validate user
        // use result of this method to determine actions to be taken
        validationResult = validate(this.user);

        if (validationResult.sendData === true) {
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
                                user["role"] = "User";
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
                errorLog: validationResult.errorLog
            });
        }
    }

});


app.post("/addAdmin", function (req, res) {

    // Request body already comes in raw json. no need to parse it
    user = req.body;

    // check empty body
    if (Object.keys(user).length === 0 && user.constructor === Object) {
        res.json({
            status: "Failed",
            message: "Empty Response body"
        });
    }

    else {
        // Call method called validate which will validate user 
        // use result of this method to determine actions to be taken
        validationResult = validate(this.user);

        if (validationResult.sendData === true) {
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
                                user["role"] = "Admin";
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
                errorLog: validationResult.errorLog
            });
        }
    }

});

const port = 3000
app.listen(port, '0.0.0.0', () => {
    console.log(`Listening at http://localhost:${port}`)
})