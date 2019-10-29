var mongoose = require('mongoose');
var devSchema = new mongoose.Schema({
    Device_Id: String,
    Manufacture: String,
    Status: String,
    Product_name: String,
    Serial_number: String
})

var dev = mongoose.model('dev', devSchema, 'Device');
module.exports = dev;
