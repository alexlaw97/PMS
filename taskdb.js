var mongoose = require('mongoose');
var taskSchema = new mongoose.Schema({
    Task_id: String,
    Total_tasks: String,
    Complete_tasks: String,
    Progression: String
})

var task = mongoose.model('task',taskSchema,'Tasks');
module.exports = task;