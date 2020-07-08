const utilities = require('./utilities');

const handleLogin = async (req, res, db, bcrypt) => {
	// Get the details from the request body
	let { email, password } = req.body;

	// Check if email exists in the database, and get corresponding user ID
	let userData;
	try {
		userData = await db.select('user_id').from('users').where('email', '=', email);
	} catch {
		return res.status(400).json("1. Error retrieving your data. Something went wrong."); 
	}
	
	// Return error if user does not exist
	if (!userData.length){
		return res.status(400).json("2. Invalid credentials. Check your email and password.");
	} else {
		let userId = userData[0]['user_id'];

		// Fetch hash for the fetched user ID
		let hashData;
		try {
			hashData = await db.select('hash').from('user_credentials').where('id','=', userId);
		} catch {
			return res.status(400).json("3. Error retrieving your data. Something went wrong.");
		}

		if(hashData.length) {
			let { hash } = hashData[0];
			// Verify if hash matches with password using bcrypt.compare
			let pwdVerified;
			try {
				pwdVerified = await bcrypt.compare(password, hash);
			} catch {
				return res.status(400).json("5. Error verifying credentials. Something went wrong.");
			}
			
			// If hash matches (result is true), generate a new token, insert for new user and then return user details
			if (pwdVerified) {
				let token, userInfo;

				try {
					token = await utilities.createToken();
				} catch {
					return res.status(400).json("7. Error verifying credentials. Something went wrong.")
				}
				
				try {
					userInfo = await db('users')
						.where('user_id', '=', userId)
						.returning('*')
						.update({
							'token': token,
							'last_login': new Date()
						});
				} catch {
					return res.status(400).json("8. Error retrieving your data. Something went wrong");
				}
				
				if (userInfo.length) {
					let user = userInfo[0];
					return res.status(200).json(user);
				} else {
					return res.status(400).json("9. Error retrieving your data. Something went wrong.");
				}	
			} else {
				return res.status(400).json("6. Invalid credentials. Check your email and password.");
			}
		} else {
			return res.status(400).json("4. Error retrieving your data. Something went wrong.");
		}
	}
};

		
// Validates user ID and clears token if validation successful
const handleLogout = async (req, res, db) => {
	console.log(req.body);
	// Get the details from the request body
	let { userId,token } = req.body;

	// Get user ID based on token
	let userData;
	try {
		userData = await db.select('user_id').from('users').where('token', '=', token);
	} catch {
		return res.status(400).json("Error retrieving your data. Something went wrong.");
	}

	if(!userData.length){
		return res.status(400).json("Error retrieving your data. Something went wrong.")
	} else {
		let fetchedUserId = userData[0]['user_id'];
		
		// Verifies userId for the user logging out
		if (fetchedUserId === userId) {
			let userInfo;

			try {
				userInfo = await db('users')
					.where('user_id', '=', userId)
					.returning('*')
					.update({
						'token': null
					});
			} catch (err) {
				console.log(err);
				return res.status(400).json("Error updating data. Something went wrong");
			}

			console.log("Cleared token for the following user:");
			console.log("User ID:", userInfo[0]['user_id']);
			console.log("Email:", userInfo[0]['email']);
			return res.status(200).json("Logged out successfully");

		} else {
			return res.status(400).json("No permission for this action");
		}
	}
};

module.exports = {
	handleLogin: handleLogin,
	handleLogout: handleLogout
};