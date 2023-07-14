const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "userData.db");

const app = express();
app.use(express.json());

let dataBase = null;

const initializeDBAndServer = async () => {
    try {
        dataBase = await open ({
            filename: dataBasePath,
            driver: sqlite3.Database
        });

        app.listen(3000, () => {
            console.log("Server Running!");
        });
    }
    catch(error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
}
initializeDBAndServer();

app.post("/register",async (request, response) => {
let { username, name, password, gender, location } = request.body;

let hashedPassword =await bcrypt.hash(password, 10);
let dataBaseUser = `
        SELECT *
        FROM user
        WHERE username = '${username}';`;

let userData = await dataBase.get(dataBaseUser);
if (userData === undefined) {
    let postNewUserQuery = `
            INSERT INTO
            user (username,name,password,gender,location)
            VALUES (
                '${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
            );`;
    if (password.length < 5) {
        response.status(400);
        response.send("Password is too short");
        }
    else {
    await db.run(postNewUserQuery);
        response.send("User created successfully");
        }
  }
  else {
    response.status(400);
    response.send("User already exists");
  }
});

app.post("/login", async (request, response) => {
    const {username, password} = request.body;
    const selectUserQuery = `
        SELECT *
        FROM user 
        WHERE username = "${username}";
    `;
    const dataBaseUser = await dataBase.get(selectUserQuery);

    if (dataBaseUser === undefined) {
        response.status(400);
        response.send("Invalid user");
    }
    else {
        const isPasswordMatched = await bcrypt.compare(password, dataBaseUser.password);
        if (isPasswordMatched === true) {
            response.send("Login success!");
        }
        else {
            response.status(400);
            response.send("Invalid password");
        }
    }
});


app.put("/change-password", async (request, response) => {
    const {username, oldPassword, newPassword} = request.body;

    const selectUserQuery = `
        SELECT *
        FROM user
        WHERE username = "${username}";
    `;

    const dataBaseUser = await dataBase.get(selectUserQuery);
    
    const isPasswordMatched = await bcrypt.compare(oldPassword, dataBaseUser.password);
    if (isPasswordMatched === true) {
        if (newPassword.length < 5) {
            response.status(400);
            response.send("Password is too short");
        }
        else {
            const encryptPassword = await bcrypt.hash(newPassword, 10);
            const updatePasswordQuery = `
            UPDATE user 
            SET password = "${encryptPassword}"
            WHERE username = "${username}";
            `;
            await dataBase.run(updatePasswordQuery);
            response.send("Password updated");
        }
    }
    else {
        response.status(400);
        response.send("Invalid current password");
    }
    
});

module.exports = app;