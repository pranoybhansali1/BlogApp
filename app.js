var	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	methodOverride = require("method-override"),
	express = require('express'),
	expressSanitizer = require("express-sanitizer"),
	app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
mongoose.connect("mongodb://localhost:27017/BlogApp_Database", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB!"))
  .catch((error) => console.log(error.message));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if (err){
			console.log("Error");
		}
		else {
			res.render("index", {blogs: blogs});
		}
	});
});

app.get("/blogs/new", function(req, res){
	res.render("new");
});

app.post("/blogs", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if (err){
			res.render("new");
		}
		else {
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		}
		else {
			res.render("show", {blog: foundBlog})
		}
	});
});

app.get("/blogs/:id/edit", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if (err){
			res.redirect("/blogs");
		}
		else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if (err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if (err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
});

app.listen(4000, function(req, res){
	console.log("Server has started...");
});

/*Blog.create({
	title: "Rusty",
	image: "data:image/jpeg;base64,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",
	body: "Cute.."
});
*/
