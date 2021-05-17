var mongoose = require("mongoose");

//JSON scheme in which data will be processed
var commentSchema = new mongoose.Schema({
    text: String,
    author: String
    });

//add MongoDB processing methods and sends back " mongoose.model("comment",commentSchema);" when ./models/comments is called in app.js
module.exports = mongoose.model("Comment",commentSchema);

