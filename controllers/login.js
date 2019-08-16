const utilities = require('./utilities');

const handleLogin = (req, res, db, bcrypt) => {
	// Get the details from the body
	let { email, password } = req.body;

	// Check if email exists in the database, and get corresponding user ID
	db.select('user_id').from('users')
		.where('email', '=', email)
		// For user ID returned, check if the user hash matches with password using bcrypt.compare
		.then(data => {
			let userId = data[0].user_id;
			if(data.length) {
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
												'token': token
											})
											.then(data => {
												let user = data[0];
												res.json(user);
											})
											.catch((err) => {
												res.status(400).json("Error retrieving your data. Something went wrong.");
											})
									})
									.catch((err) => {
										res.status(400).json("Error retrieving your data. Something went wrong");
									})	
								} else {
									res.status(400).json("Invalid credentials. Check your email and password.");
								}
							})
							.catch((err) => {
								res.status(400).json("Error verifying credentials. Something went wrong");
							})
					})
					.catch((err) => {
						res.status(400).json("Error verifying your credentials. Something went wrong.")
					})
			} else {
				res.status(400).json("Invalid credentials. Check your email and password.");
			}
		})
		.catch((err) => {
			res.status(400).json("Invalid credentials. Check your email and password.");
		})
	
}

module.exports = {
	handleLogin: handleLogin
};