let jwt = require('jsonwebtoken');
const config = require('./config.js');

//method to check token
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
    checkToken: checkToken
}