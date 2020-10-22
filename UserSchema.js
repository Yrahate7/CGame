var mongoose = require("mongoose");

// Get the Schema constructor
const Schema = mongoose.Schema;

// Using Schema constructor, create a UserSchema
var UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: false
    },
    gender: {
        // 1 for female, 0 for male
        type: Boolean,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        required: false
    },
}, { versionKey: false });

// Create model from the schema
var User = mongoose.model("users", UserSchema, "users");

// Export model
module.exports = User;

// Some letter should be caps
// more than 6 character 
// 1 num, 1 Special 
// 