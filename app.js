const express = require("express");
const app = express();
require("dotenv").config();

const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);


const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const flash = require("connect-flash");
const bodyParser = require("body-parser");

// Middleware
const auth = require("./middleware/auth");
const storeLocals = require("./middleware/storeLocals");

// Routes
const secretWordRouter = require("./routes/secretWord");
const jobsRouter = require("./routes/jobs");
const sessionRouter = require("./routes/sessionRoutes");

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Sessions 
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});
store.on("error", console.log);

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  sessionParms.cookie.secure = true;
}

app.use(session(sessionParms));

const csrf = require("csurf");
app.use(csrf());


// Passport
require("./passport/passportInit")();
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// add CSRF token to all views
app.use((req, res, next) => {
  if (req.csrfToken) {
    res.locals._csrf = req.csrfToken();
  }
  next();
});


// storeLocals (after flash)
app.use(storeLocals);

// View engine
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => res.render("index"));
app.use("/sessions", sessionRouter);
app.use("/jobs", auth, jobsRouter);
app.use("/secretWord", auth, secretWordRouter);

// Errors
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});
app.use((err, req, res, next) => {
  //res.status(500).send(err.message);
  //console.log(err);
    console.error("❌ Error stack:", err);
  res.status(500).send("Internal Server Error");
});

// database connection and starting the server
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
