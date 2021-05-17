var mongoose = require("mongoose");
var comments = require("./comments");
//JSON scheme in which data will be processed
var blogSchema = new mongoose.Schema({
    name: String,
    image: String,
    desc: String,
    comments: [
      {
         text: String,
         author: String
      }
   ]
});

//add MongoDB processing methods and sends back " mongoose.model("blog",blogSchema);" when ./models/blogs is called in app.js
module.exports = mongoose.model("blog",blogSchema);

