const utilities = require('./utilities');

const handleRegister = async (req, res, db, bcrypt, saltRounds) => {
	// Get the details from the body
	let user = req.body;

	if (!user.name || !user.email || !user.password){
		return res.status(400).json("1. Missing request parameters");
	}

	// Check if the user already exists
	let userData;
	try {
		userData = await db.select('user_id').from('users').where('email', '=', user.email);
	} catch {
		return res.status(500).json("2. Error retrieving data. Something went wrong.");
	}

	// If user exists already, return error, otherwise move ahead with creation
	if(userData.length !== 0){
		if(userData[0].user_id){
			return res.status(409).json("3. There is already an existing user with this email address");
		} else {
			return res.status(500).json("4. Error retrieving data. Something went wrong");
		}
	} else {
		// Hash the plain text password using bcrypt, and set the user's hash to the encrypted hash
		let hash, token, insertedUser;
		try {
			hash = await bcrypt.hash(user.password, saltRounds);
			delete user.password;
			user.hash = hash;
		} catch(error) {
			console.log(error);
			return res.status(500).json("5. Error creating account. Something went wrong.");
		}

		try {
			token = await utilities.createToken();
			user.token = token;
		} catch {
			return res.status(500).json("6. Error creating account. Something went wrong.");
		}

		try {
			insertedUser = await createUser(user, db);
			delete user.hash;
			return res.status(201).json(insertedUser);
		} catch {
			return res.status(500).json("7. Error creating account. Something went wrong.");
		}
	}
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
					user_id: userId[0].id,
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
			throw Error(err);
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