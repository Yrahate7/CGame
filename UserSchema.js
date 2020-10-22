const { match } = require("assert");
var mongoose = require("mongoose");

// Get the Schema constructor
const Schema = mongoose.Schema;

// Using Schema constructor, create a UserSchema
var UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        validate: /[a-z]/
    },
    lastName: {
        type: String,
        required: true,
        match: /[a-z]/
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: false,
        match: /\S+@\S+\.\S+/
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
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
        required: true,
        minlength: 6,
        match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/

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
