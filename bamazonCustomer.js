var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Uhs!10265",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
});

//start it up
var start = function () {
  connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  var table = [];
    for(var i = 0; i < res.length; i++) {
        var row = [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price,res[i].stock_quantity];
        table.push(row);
    }
    console.table(["ID","Item", "Department", "Price", "Stock"],table);
  });
  buyItem();
};

var buyItem = function() {
  // query the database & products table
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // user selects item_id
    inquirer.prompt([
      {
        name: "idSelected",
        type: "input",
        message: "Choose the ID of the item you would like to buy!"
      },
    // quantity of item
      {
        name: "quantitySelected",
        type: "input",
        message: "How many would you like to buy?"
      }
    ]).then(function(answer) {
      var chosenItem;
      for (var i = 0; i < results.length; i++) {
        if (results[i].item_id == answer.idSelected) {
            chosenItem = results[i];
            //check if quantity is available
            if (answer.quantitySelected < results[i].stock_quantity) {
                console.log("It's yours--");
                var newQuantity = results[i].stock_quantity - answer.quantitySelected;
                connection.query("UPDATE products SET ? WHERE ?", [{
                stock_quantity: newQuantity
                }, {
                item_id: answer.choice
                }], function(error) {
                if (error) throw err;
                console.log("------------------------------");
                console.log("Item purchased.");
                console.log("------------------------------");
                });
            }
        
            else {
                // not enough items in stock tell customer insufficient quantity
                console.log("------------------------------");
                console.log("Insufficient quantity!");
                console.log("------------------------------");
                start();
            }
        }
      }
    });
  });
};

