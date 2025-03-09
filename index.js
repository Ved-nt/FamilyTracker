import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "myDatabase",
  password: "Ved@nt11",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );//to setup one to many relationship between users and visited_countries table
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;

  // Check if currentUserId is still valid
  let currentUser = users.find((user) => user.id == currentUserId);

  if (!currentUser) {
    console.warn("Current user not found. Resetting to first available user.");
    currentUserId = users.length > 0 ? users[0].id : null; // Reset to first user if available
    currentUser = users[0] || null;
  }

  return currentUser;
}


app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();
  console.log("Visited countries:", countries);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,//to represent all the users
    color: currentUser.color,//it represents colour of different user
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const currentUser = await getCurrentUser();

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    if (!data) {
      console.log("No country found with the provided name:", input);
      return res.redirect("/");
    }
    const countryCode = data.country_code;
    try {
      await db.query(//it will add the country_code and user_id in the visited_countries table(ye batayega ki kis user ne country enter kari hai)
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/delete", async (req, res) => {
  const userId = req.body.userId;
  if (!userId) {
    console.log("No user selected for deletion.");
    return res.redirect("/");
  }

  try {
    // Step 1: Delete user's visited countries first
    await db.query("DELETE FROM visited_countries WHERE user_id = $1;", [userId]);

    // Step 2: Delete the user
    await db.query("DELETE FROM users WHERE id = $1;", [userId]);

    // Step 3: Reset currentUserId to first available user
    const remainingUsers = await db.query("SELECT * FROM users;");
    currentUserId = remainingUsers.rows.length > 0 ? remainingUsers.rows[0].id : null;

    console.log(`User with ID ${userId} deleted.`);
  } catch (err) {
    console.error("Error deleting user:", err);
  }

  res.redirect("/");
});


app.post("/user", async (req, res) => {
  if(req.body.add === "new"){//we are targetting line 21 in index.ejs
    res.render("new.ejs");
  } else{
    currentUserId = req.body.user;//currentUserId will be selected according to the tab user clicked
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const name = req.body.name.trim();
  const color = req.body.color;

  console.log("Selected Color:", color); // Debugging log

  if (!name || !color) {
    console.log("Name or color missing.");
    return res.redirect("/new");
  }

  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;",
      [name, color]
    );

    console.log("Saved Color in DB:", result.rows[0].color); // Log what gets saved
    currentUserId = result.rows[0].id;
  } catch (err) {
    console.error("Error adding new user:", err);
  }

  res.redirect("/");
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
