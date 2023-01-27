const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash")
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/todoDB')
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = mongoose.Schema({
  name:String
});
const routeSchema = mongoose.Schema({
  name:String,
  theItems:[itemSchema]
})
const Item = mongoose.model("Item", itemSchema);
const Route = mongoose.model("Route", routeSchema)
const item1 = new Item({
  name:"Welcome to to-do list"
});
const item2 = new Item({
  name:"Type  new items"
});
const item3 = new Item({
  name:"Hit the + button to add new items"
});

const allItems = [item1,item2,item3]
app.get("/", function(req, res) {
  Item.find({}, function (error, result) {
    if (result.length == 0) {
      Item.insertMany(allItems, function (error) {
        if (error) {
          console.log("error occured")
        }
      })
      res.redirect("/");
    } else {
      const day = date.getDate();
      res.render("list", {listTitle: "Welcome", newListItems: result});
    }
  })




});

app.post("/", function(req, res){
  const select = req.body.list
  const item = req.body.newItem;
  const item4 = new Item({
    name:item
  })
  if (select === "Welcome") {
    item4.save();
    res.redirect("/")
  } else {
    Route.findOne({name:select}, function (error, result) {
      if (error) {
        console.log("error occured");
      } else {
        result.theItems.push(item4);
        result.save();
        res.redirect("/"+ select)
      }
    })
  }
  
  
});
app.post("/delete", function (req, res) {
  const click = req.body.check;
  const where = req.body.hide;
  if (where === "Welcome") {
    Item.deleteOne({name:click}, function (err) {
      if (err) {
        console.log("error occured");
      } else {
        res.redirect("/")
      }
    })
  } else {
    Route.findOneAndUpdate({name:where},{$pull:{theItems:{name:click}}}, function (err, result) {
      if (err) {
        console.log("error occured")
      } else {
        res.redirect("/" + where)
      }
    })
  }
  
})

app.get("/:this", function(req,res){
  const place = _.capitalize(req.params.this)
  console.log(place)
  const route = new Route({
    name : place,
    theItems:allItems
  })
  Route.findOne({name:place}, function (error, result) {
    if (!result) {
      route.save();
      res.redirect("/" + place)
    } else{
      res.render("list", {listTitle:place, newListItems: result.theItems});
    }
  })
  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started Successfully");
});

