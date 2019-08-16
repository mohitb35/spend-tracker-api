const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');

const bcrypt = require('bcrypt');
const saltRounds = config.SALT_ROUNDS;

const registerController = require('./controllers/register');
const loginController = require('./controllers/login');
const spendsController = require('./controllers/spendItems');

const db = knex(config.DB_CREDENTIALS);

const app =  express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
	db.select("*").from('spend_items').then(data => {
		res.send(data);
	});
});

app.post('/register', (req, res) => { registerController.handleRegister(req, res, db, bcrypt, saltRounds) });
app.post('/login', (req, res) => { loginController.handleLogin(req, res, db, bcrypt) });
app.post('/spend', (req, res) => { spendsController.addSpend(req, res, db) });
app.put('/spend/:id', (req, res) => { spendsController.editSpend(req, res, db) });

var port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log("Spend Tracking API Server online....");
});