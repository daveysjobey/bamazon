var mysql = require("mysql");
var inquirer = require("inquirer")

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  console.log("connected")
  start();
});

function start() {
  inquirer
    .prompt({
      name: "purchase",
      type: "rawlist",
      message: "Welcome to Bamazon would you like to buy something?",
      choices: ["Yes", "No"]
    })
    .then(function (answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.purchase.toUpperCase() === "YES") {
        buySomething();
      } else {
        start();
      }
    });
}

function buySomething() {
  // query the database for all items being auctioned
  connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // once you have the items, prompt the user for which they'd like to bid on
        var choiceArray = [];
        for (var i = 0; i < results.length; i++) {
          choiceArray.push(results[i].id + ") " + results[i].product_name + " $" + results[i].price + " each");
        }
        console.log(choiceArray)
        inquirer
          .prompt([{
              name: "choice",
              type: "input",
              message: "What would you like to buy?"
            },
            {
              name: "quantity",
              type: "input",
              message: "How many would you like to buy?"
            }
          ])
          .then(function (answer) {
             
              
              connection.query("SELECT * FROM products", function (err, results) {
                if (err) throw err;
                for (var i = 0; i < results.length; i++) {
                  if (results[i].id == answer.choice) {
                    if ((results[i].stock_quantity) > parseInt(answer.quantity)) {
                      payment = results[i].price*answer.quantity
                      // bid was high enough, so update db, let the user know, and start over
                      var newStock = (results[i].stock_quantity - parseInt(answer.quantity));
                      console.log(newStock);
                      connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [{
                            stock_quantity: newStock
                          },
                          {
                            id: results[i].id
                          }
                        ],
                        function (error) {
                          if (error) throw err;
                          console.log("Order placed for $"+payment)
                          start();
                        }
                      );
                    } else {
                      // bid wasn't high enough, so apologize and start over
                      console.log("Sorry we don't have enough to complete your order");
                      start();
                    }
                  };
                }
              });
            });
          });
        }