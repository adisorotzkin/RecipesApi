const indexR = require("./index");
const usersR = require("./users");
const recipeR = require("./recipes");

exports.routesInit = (app) => 
{
    app.use("/",indexR);
    app.use("/users",usersR);
    app.use("/recipes",recipeR);
}