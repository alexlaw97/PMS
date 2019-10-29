var mongoose = require('mongoose');
var deaSchema = new mongoose.Schema({
    Name: String,
    Address: String,
    Phone: String
})

var dea = mongoose.model('dea', deaSchema, 'Dealer');
module.exports = dea;
