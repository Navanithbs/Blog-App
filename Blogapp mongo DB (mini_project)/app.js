var express = require("express");
var bodyParser = require("body-parser"); // used to convert elements recieved from HTML forms to JSON and process it as a variable values

var app = express();
app.set("view engine", "ejs");//lets the express know all files rendered here are ejs files
app.use(bodyParser.urlencoded({extended: true})); //specifing Express to use body-parser

var methodoverride = require("method-override");
var mongoose = require("mongoose"); // MongoDB modeling for Node JS
var passport = require("passport"); //authentication 
var LocalStrategy = require("passport-local");
var blogSchema = new mongoose.Schema({
    name: String,
    image: String,	
    desc: String,
    created:{type : Date, default : Date.now},
    comments: [
      {
         text: String,
         author: String
      }
   ]
});

app.use(express.static("public"))
app.use(methodoverride("_method"))

var Blogs= mongoose.model("blog",blogSchema)

mongoose.connect("mongodb://localhost/blog_site",{ useNewUrlParser: true , useUnifiedTopology: true, useFindAndModify :false }); 

var comments = require("./models/comments");
var users = require("./models/users");
app.use(express.static(__dirname + "/public"));

//passport configuration:
app.use(require("express-session")({
        secret: "This is the Salting string",
        resave: false,
        saveUninitialized:false
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
});

passport.use(new LocalStrategy(users.authenticate()));
passport.serializeUser(users.serializeUser());
passport.deserializeUser(users.deserializeUser());

app.get("/", function(req,res){
   res.render("landing");
});

//new user register
app.get("/register", function(req,res){
       res.render("register");
});

app.post("/register", function(req,res){
       var usrName = new users({username: req.body.username});
       users.register(usrName,req.body.password,function(err, user){
          if(err){
          console.log("ERROR!" + err);
          }
          else{
              passport.authenticate("local")(req,res,function()
               {
                  res.redirect("/blogs");
       	});
              }
        
       });
});


// LOGIN ROUTES
//render login form
app.get("/login", function(req, res){
   res.render("login"); 
});
//login logic
//middleware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",//if credentials are vaild
    failureRedirect: "/login"
}) ,function(req, res){
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}

app.get("/blogs",isLoggedIn, function(req,res){
Blogs.find({}, function(err,allblog){
        if(err){console.log("ERROR:"+ err);}
        else{
            res.render("blogs",{ EJSblogs: allblog});
        }
    });
  
});

app.post("/blogs", function(req,res){
       var name = req.body.name;
       var image = req.body.image;
       var desc = req.body.desc;
       var newBlog = {name: name, image: image ,desc: desc};//creating a json object frm entered details
        Blogs.create( newBlog, function(err,blog){
            if(err){console.log("ERROR:"+ err);}
            else{
                console.log("Succcess:" + blog);
            }
        });
    res.redirect("/blogs");
});

app.get("/blogs/new",isLoggedIn, function(req,res){
       res.render("new");
});

app.get("/blogs/:id",isLoggedIn, function(req,res){
    Blogs.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
        } else {
            res.render("info", {blog: foundBlog});
        }
    });
});

app.get("/blogs/:id/comments/new",isLoggedIn, function(req,res){
    Blogs.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
        } else {
            res.render("newComment", {blog: foundBlog});
        }
    });
});


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.post("/blogs/:id/comments", function(req,res){
    Blogs.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            comments.create(req.body.comment, function(err,addedComment){
                if(err)
                {
                console.log(err);
                }
                else{
                    foundBlog.comments.push(addedComment);
                    foundBlog.save();
                    res.redirect("/blogs/"+req.params.id );
                }
            });
        }
    });
});

app.get("/blogs/:id/edit",isLoggedIn,function(req,res){
    Blogs.findById(req.params.id,function(err,blog){
        if(err){res.render("/blogs/:id")}
        else{
            res.render("edit",{blog:blog})
        }
    })
})

app.put("/blogs/:id",isLoggedIn,function(req,res){
    Blogs.findByIdAndUpdate(req.params.id,req.body.blog,function(err){
        if(err)
        {console.log("Error")}
        else{
            res.redirect("/blogs/"+req.params.id)
        }
    });
 });

app.delete("/blogs/:id",isLoggedIn, function(req, res){
    Blogs.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
 });

app.listen(2000,"localhost",function(){
    console.log("Blog_site server started...!!!!!!!")
            });
