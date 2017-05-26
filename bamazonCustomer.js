var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Uhs!10265",
  database: "Bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
});

function showCatalog(greeting) {
    console.log("----------------------------");
    console.log("Bro-mazon");
    console.log("----------------------------");
    console.log("Check out our stuff:");

    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products;", function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            console.table(res);
        }
    });
    connection.query("SELECT * FROM products WHERE stock_quantity > 0;", function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            JSON.stringify(res);
            var itemsAvailable = [];
            for (var i = 0; i < res.length; i++) {
                itemsAvailable.push(res[i].item_id);
            }
            greeting(itemsAvailable);
        }
    })
}

function prompt(items) {
    inquirer.prompt([
        {
            type: "list",
            name: "item",
            message: "Which item would you like to purchase?",
            choices: items
        },
        {
            type: "input",
            name: "quantity",
            message: "How many of these would you like?"
        }]).then(function (a) {

        connection.query("SELECT * FROM products WHERE stock_quantity > ? AND id = ?;", [a.quantity, a.item], function (err, res) {
            if (err) {
                console.log(err);
            }
            else {
                if (res.length > 0) {
                    console.log("You got it");
                    sellItem(a.item, a.quantity);
                }
                else {
                    console.log("Insufficient quantity, bro!");
                    startOver();
                }
            }
        });
    });
}

function sellItem(itemID, qty) {
    connection.query("SELECT price FROM products WHERE id = ?", itemID, function (err, res) {
        if (err) {
            console.log(err);
        }
        else {
            var totalPrice = parseFloat(res[0].price) * parseFloat(qty);
            console.log("Your total is $", totalPrice);
            // bmc: confirm purchase?
            inquirer.prompt({
                type: "confirm",
                message: "Would you like to complete this order?",
                name: "confirmOrder",
                default: "yes"
            }).then(function (a) {
                if (a.confirmOrder === false) {
                    console.log("Your order has been cancelled.");
                }
                else {
                    console.log("Thank you for your order!");
                    connection.query("SELECT quantity FROM products WHERE id=?", itemID, function (err, res) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            var newQuantity = parseInt(res[0].stock_quantity) - parseInt(qty);
                            connection.query("UPDATE products SET quantity=? WHERE id=?", [newQuantity, itemID], function (err, res) {
                                if (err) {
                                    console.log(err);
                                }
                            })
                        }
                    })
                }
                startOver();
            });
        }

    })
}
function startOver() {
    inquirer.prompt({
        type: "list",
        message: "Order something else or quit?",
        name: "action",
        choices: ["Order", "Quit"]
    }).then(function (a) {
        if (a.action === "Order") {
            showCatalog(prompt);
        }
        else if (a.action === "Quit") {
            process.exit();
        }
    })
}

showCatalog(prompt);