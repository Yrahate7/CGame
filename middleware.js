let jwt = require('jsonwebtoken');
const config = require('./config.js');

//  method to check token --- Wont check if the logged in person is an administrator or user
//  Will login regardless of type of user
let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    status: "Failed",
                    message: 'Token is not valid'
                });
            } else {
                // if token is valid
                req.decoded = decoded;
                console.log(decoded);
                next();
            }
        });
    } else {
        return res.json({
            status: "Failed",
            message: 'Auth token is not supplied'
        });
    }
};

// Method to check whether the given token is valid or not.
// also verifies if the given token belongs to an admin or a user
let checkAdminToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    status: "Failed",
                    message: 'Token is not valid'
                });
            } else {
                // if token is valid
                req.decoded = decoded;
                console.log(decoded);
                next();
            }
        });
    } else {
        return res.json({
            status: "Failed",
            message: 'Auth token is not supplied'
        });
    }
};

module.exports = {
    checkToken: checkToken,
    checkAdminToken: checkAdminToken
}