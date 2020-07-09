var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
const passport      = require('passport');
const pe            = require('parse-error');
const cors          = require('cors');
var app = express();

const fileUpload = require('./lib/index');

app.use(fileUpload());


var snacksUserRouter = require('./routes/snacks_users');
var snacksItemRouter = require('./routes/snacks_items');
var indexRouter = require('./routes/index');
var snacksfileRouter = require('./routes/snacks_file');
var snackschatRouter = require('./routes/snacks_chats');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/snackspop/api/users' , snacksUserRouter);
app.use('/snackspop/api/items' , snacksItemRouter);
app.use('/snackspop/api/files' , snacksfileRouter);
app.use('/snackspop/api/chats' , snackschatRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


process.on('unhandledRejection', error => {
    console.error('Uncaught Error', pe(error));
});

module.exports = app;
