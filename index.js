const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "user_info",
  password: "Kritika_1122",
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.username(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

//HOME ROUTE
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("some error occured.");
  }
});

//SHOW ROUTE
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user ORDER BY created_at DESC`;
  try {
    connection.query(q, (err, user) => {
      if (err) throw err;
      console.log(
        user.map((u) => ({
          username: u.username,
          created_at: u.created_at,
        })),
      );
      res.render("show.ejs", { user: user });
    });
  } catch (err) {
    console.log(err);
    res.send("error occured");
  }
});

//EDIT ROUTE
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("error occurred");
  }
});

//UPDATE ROUTE
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password: formPass, username: newUsername } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (formPass != user.password) {
        return res.send("wrong password");
      } else {
        let q2 = `UPDATE user SET username = '${newUsername}' WHERE  id = '${id}'`;
        connection.query(q2, (err, result) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("error occurred");
  }
});

//NEW USER
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

//CREATE USER
app.post("/user", (req, res) => {
  let {
    username: formUser,
    email: formEmail,
    password: formPassword,
  } = req.body;
  let id = faker.string.uuid();
  let q = `INSERT INTO user(id, username, email, password) VALUES (?,?,?,?)`;
  try {
    connection.query(
      q,
      [id, formUser, formEmail, formPassword],
      (err, result) => {
        if (err) throw err;
        return res.redirect("/user");
      },
    );
  } catch (err) {
    console.log(err);
    res.send("error in creating new user");
  }
});

//DELETE
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `"SELECT * FROM user WHERE id = '${id}'`;
  try {
    if (err) throw err;
    let user = result[0];
    res.render("delete.ejs", { user: user });
  } catch (err) {
    console.log(err);
    res.send("error in deleting");
  }
});

//DELETE USER
app.delete("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let { email, password } = req.body;
  let q = "SELECT * FROM user WHERE id = ?";
  try {
    connection.query(q, [id], (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (email != user.email && password != user.password) {
        res.send("error");
      } else {
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        connection.query(q2, [id], (err, result) => {
          console.log("deleted");
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("error in deleting");
  }
});

app.listen("8080", (req, res) => {
  console.log("server is listening on port 8080");
});

// let data = [];
// for(let i = 0; i <= 100; i++){
//     data.push(getRandomUser());
// };

// console.log(data);

// let q = "INSERT INTO user (id, username, email, password) VALUES ?";

// connection.query(q, [data], (err, result) => {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log(result);
// });

// connection.end();
