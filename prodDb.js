var mongoose = require('mongoose');
var prodSchema = new mongoose.Schema({
    Product_Id:String,
    Product_name:String,
    Req_Id:String
})

var prod = mongoose.model('prod', prodSchema, 'Product');
module.exports = prod;
