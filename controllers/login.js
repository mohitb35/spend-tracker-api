const utilities = require('./utilities');

const handleLogin = (req, res, db, bcrypt) => {
	// Get the details from the body
	let { email, password } = req.body;

	// Check if email exists in the database, and get corresponding user ID
	db.select('user_id').from('users')
		.where('email', '=', email)
		// For user ID returned, check if the user hash matches with password using bcrypt.compare
		.then(data => {
			if(data.length) {
				let userId = data[0].user_id;
				db.select('hash').from('user_credentials')
					.where('id','=',userId)
					.then(data => {
						let { hash } = data[0];
						bcrypt.compare(password, hash)
							.then((result) => {
								// If hash matches, generate a new token, insert for new user and then return user details
								if(result){
									utilities.createToken()
									.then((token) => {
										db('users')
											.where('user_id', '=', userId)
											.returning('*')
											.update({
												'token': token,
												'last_login': new Date()
											})
											.then(data => {
												let user = data[0];
												res.status(200).json(user);
											})
											.catch((err) => {
												res.status(400).json("4. Error retrieving your data. Something went wrong.");
											})
									})
									.catch((err) => {
										res.status(400).json("5. Error retrieving your data. Something went wrong");
									})	
								} else {
									res.status(400).json("3. Invalid credentials. Check your email and password.");
								}
							})
							.catch((err) => {
								res.status(400).json("7. Error verifying credentials. Something went wrong");
							})
					})
					.catch((err) => {
						res.status(400).json("6. Error verifying your credentials. Something went wrong.")
					})
			} else {
				res.status(400).json("2. Invalid credentials. Check your email and password.");
			}
		})
		.catch((err) => {
			res.status(400).json("1. Error retrieving your data. Something went wrong.");
		})
	
}

// Validates user ID and clears token if validation successful
const handleLogout = (req, res, db) => {
	let { userId,token } = req.body;

	db.select('user_id').from('users')
		.where('token', '=', token)
		.then(data => {
			if(data.length){
				let fetchedUserId = data[0]['user_id'];
				if(fetchedUserId === userId){
					db('users')
						.where('user_id', '=', userId)
						.returning('*')
						.update({
							'token': ''
						})
						.then(data => {
							console.log("Cleared token for the following user:");
							console.log("User ID:", data[0]['user_id']);
							console.log("Email:", data[0]['email']);
						})
						.catch((err) => {
							console.log(err);
							res.status(400).json("Error retrieving your data. Something went wrong.");
						})
				} else {
					res.status(400).json("No permission for this action");
				}
			}
		})
}

module.exports = {
	handleLogin: handleLogin,
	handleLogout: handleLogout
};