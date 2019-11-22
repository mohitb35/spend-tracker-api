const utilities = require('./utilities');

const handleRegister = (req, res, db, bcrypt, saltRounds) => {
	// Get the details from the body
	let user = req.body;
	// Check if the user already exists
	db.select('user_id').from('users')
		.where('email', '=', user.email)
		// If user exists already, return error, otherwise move ahead with creation
		.then(data => {
			if(data.length !== 0) {
				if(data[0].user_id) {
					res.status(500).json("There is already an existing user with this email address");
				} else {
					res.status(400).json("Something went wrong");
				}
			} else {
				// Hash the plain text password using bcrypt
				bcrypt.hash(user.password, saltRounds)
				.then((hash) => {
					delete user.password;
					// set user's hash to encrypted pw
					user.hash = hash; 
				})
				// Create token to be sent back to the client to create a session
				.then(() => utilities.createToken())
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
		})
		.catch((err) => {
			console.log("This was the error:", err);
			res.status(400).json("Something went wrong");
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
					created_at: new Date(),
					last_login: new Date()
				});
		})
		.then(trx.commit)
		.catch((err) => {
			trx.rollback();
			throw err;
		})
	})
	.then((data) => {
		return data[0];
	})
	.catch((err) => {
		throw Error(err);
	});
}

module.exports = {
	handleRegister: handleRegister
};