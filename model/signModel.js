const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({  //  Capital 'S' in Schema
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    diseases: [{
        problem: { type: String },
        createdAt: { type: Date, default: Date.now }  //  No parentheses
    }]
});

module.exports = mongoose.model('Signup', signupSchema);  // Model name as a string
