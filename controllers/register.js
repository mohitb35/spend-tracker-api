const crypto = require('crypto');

const handleRegister = (req, res, db, bcrypt, saltRounds) => {
	// Get the details from the body
	let user = req.body;
	// Hash the plain text password using bcrypt
	bcrypt.hash(user.password, saltRounds)
		.then((hash) => {
			delete user.password;
			// set user's hash to encrypted pw
			user.hash = hash; 
		})
		// Create token to be sent back to the client to create a session
		.then(() => createToken())
		// Set user's token to created token
		.then((token)=> {
			user.token = token;
		})
		// Save hashed password to db for the user and save user data to db with created token
		.then(() => createUser(user, db))
		// Return info of created user
		.then((insertedUser) => {
			delete user.hash;
			res.status(201).json(insertedUser);
		})
		.catch((err) => {
			console.log("This was the error:", err);
			res.status(400).json("Something went wrong");
		});
}
			

// crypto ships with node - we're leveraging it to create a random, secure token
const createToken = () => {
	return new Promise((resolve, reject) => {
	  crypto.randomBytes(16, (err, data) => {
		err ? reject(err) : resolve(data.toString('base64'));
	  })
	})
  }

// creating a user in the database
const createUser = (user, db) => {
	return db.transaction((trx) => {
		trx.insert({
			hash: user.hash
		})
		.into('user_credentials')
		.returning('id')
		.then((userId) => {
			return trx('users')
				.returning('*')
				.insert({
					user_id: userId[0],
					email: user.email,
					name: user.name,
					token: user.token,
					created_at: new Date()
				});
		})
		.then(trx.commit)
		.catch((err) => {
			trx.rollback();
			throw err;
		})
	})
	.then((data) => {
		return data;
	})
	.catch((err) => {
		throw Error(err);
	});
}

module.exports = {
	handleRegister: handleRegister
};