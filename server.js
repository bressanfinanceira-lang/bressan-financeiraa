require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const siteRoutes = require('./routes/site');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'bressanFinanceiraSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', siteRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
