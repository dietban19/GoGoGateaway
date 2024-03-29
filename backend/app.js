var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var citiesRouter = require("./routes/cities");
var hotelsRouter = require("./routes/hotels");
var restaurantsRouter = require("./routes/restaurants");
var itinerariesRouter = require("./routes/itineraries");
var cloudinaryUploadRouter = require("./routes/cloudinaryUpload");
var app = express();
const port = 8080 || 3000; // Use the PORT environment variable or default to 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(cors({ origin: true, credentials: true }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cities", citiesRouter);
app.use("/hotels", hotelsRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/itineraries", itinerariesRouter);
app.use("/cloudinaryUpload", cloudinaryUploadRouter);
const db = admin.firestore();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
