var mongoose = require('mongoose');
var projSchema = new mongoose.Schema({
    Project_id:String,
    Status:String,
    Production : "",
    IT_Dept : "",
    Testing_Dept : "",
    Mass_Dept : "",
    Ship_Dept : "",
    Quality_Dept : "",
    Ins_start : "",
    Ins_end : "",
    Soft_start: "",
    Soft_end: "",
    mass_start: "",
    mass_end: "",
    testing_start: "",
    testing_end: "",
    quality_start: "",
    quality_end: "",
    ship_start: "",
    ship_end: "",
    Deadline: Date,
    Project_title:String,
    Pros_id:String,
    Req_id:String,
    Product_id: String,
    Quantity: String,
    Dealer : String

})

var proj = mongoose.model('proj', projSchema, 'Project');
module.exports = proj;
