var mongoose = require('mongoose');
var reqSchema = new mongoose.Schema({
    Req_id: String,
    Screen: String,
    Battery: String,
    Processor: String,
    Camera: String,
    Memory: String,
    Inner_Body: String,
    Vibrator: String,
    Speaker: String,
    Motherboard: String,
    Button: String
})

var req = mongoose.model('req',reqSchema,'Requirement');
module.exports = req;