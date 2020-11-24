const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const methodOverride = require('method-override')
const exphbs = require("express-handlebars");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const connectDB = require("./config/db.js");

//load config
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport.js")(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
)

// loading
if ((process.env.NODE_ENV = "development")) {
  app.use(morgan("dev"));
}

const { formatDate, truncate, stripTags, editIcon, select } = require("./helpers/hbs");

//handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, truncate, stripTags, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

//session
app.use(
  session({
    secret: "99999999999999999999999fff",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//passport midll
app.use(passport.initialize());
app.use(passport.session());

//Global
app.use(function(req, res, next){
    res.locals.user = req.user
    next()
})

//static
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    `server is running in ${process.env.NODE_ENV} on port ${process.env.PORT} ...`
  );
});
