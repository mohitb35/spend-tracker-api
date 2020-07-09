const listCategories = (req, res, db) => {
	db.select("*").from('category')
		.then(data => {
			if(data.length > 0) {
				res.status(200).json(data);
			} else {
				res.status(200).json("No categories found");
			}
		})
		.catch(err => {
			res.status(400).json("Something went wrong");
		});
}

const listSubCategories = (req, res, db) => {
	let categoryId = req.params.id;

	db.select("*").from('sub_category')
		.where('category_id', '=', categoryId)
		.then(data => {
			if(data.length > 0) {
				res.status(200).json(data);
			} else {
				res.status(200).json("No subcategories found");
			}
		})
		.catch(err => {
			res.status(400).json("Something went wrong");
		});
}

const getDateRange = (req, res, db) => {
	db.select('user_id').from('users')
		.where('token', '=', req.params.token)
		.then(user => {
			// Check if token is valid, and user exists
			if(user.length === 0) {
				res.status(400).json("Invalid token. Please log out of the app and sign in again.")
			} else {
				if(user.length === 1) {
					let userId = user[0]['user_id'];
					// Get min, max date from db and return to user
					db('spend_items').min('purchase_date').max('purchase_date')
						.where('user_id', '=', userId)
						.first()
						.then(range => {
							if(range.min === null) {
								res.status(200).json("No spends found");
							} else {
								res.status(200).json(range);
							}
						})
				} else {
					// Error thrown if duplicate tokens exist in DB, for any reason.
					throw Error("Something went wrong. More than one user IDs were returned.")
				}
			}
		})
		.catch(err => {
			console.log(err);
			res.status(400).json("Something went wrong. Please log out and log in again.");
		})
}

// Combine general info needed
const getConfig = (req, res, db) => {

}

const addSpend = async (req, res, db) => {
	// Get data from body
	let spend = {
		name: req.body.name,
		amount: req.body.amount,
		category_id: req.body.categoryId,
		sub_category_id: req.body.subCategoryId,
		purchase_date: req.body.purchaseDate,
		user_id: req.body.userId
	}

	if (!req.body.token) {
		return res.status(401).json("1. Authentication failed. Please log out and log in again.");
	}

	if (!spend.name || !spend.amount || !spend.category_id || !spend.sub_category_id || !spend.purchase_date || !spend.user_id ){
		return res.status(400).json("2. Missing request parameters.");
	}
	
	// Validate token + userId
	let userData;
	try {
		userData = await db.select('user_id').from('users').where('token', '=', req.body.token);
	} catch {
		return res.status(500).json("3. Error retrieving data. Something went wrong.");
	}
	
	if (userData.length){
		if (spend['user_id'] === userData[0]['user_id']){
			let data;
			// If token and userId are valid, add spend to database
			try {
				data = await db('spend_items').returning('*').insert(spend);
				let insertedSpend = data[0]; 
				return res.status(201).json(insertedSpend);
			} catch {
				return res.status(500).json("5. Error updating data. Something went wrong.")
			}

		} else {
			return res.status(401).json("6. Authentication failed. Please log out and log in again.");
		}
	} else {
		return res.status(401).json("4. Authentication failed. Please log out and log in again.");
	}
}

const editSpend = (req, res, db) => {
	let spend = {
		name: req.body.name,
		amount: req.body.amount,
		category_id: req.body.categoryId,
		sub_category_id: req.body.subCategoryId,
		purchase_date: req.body.purchaseDate,
	}

	// Validate token
	db.select('user_id').from('users')
		.where('token', '=', req.body.token)
		.then(data => {
			if(data.length){
				let userId = Number(data[0]["user_id"]);
				// spend["user_id"] = Number(data[0]["user_id"]);
				//Check is the user editing the spend has created it
				db.select('user_id').from('spend_items')
					.where('id', '=', req.params.id)
					.then((data) => {
						if(data.length && userId == data[0]["user_id"]) {
							// enter spend into database 
							db('spend_items')
								.where("id", "=", req.params.id)
								.returning('*')
								.update(spend)
								.then(data => {
									let updatedSpend = data[0];
									res.status(200).json(updatedSpend);
								})
								.catch(err => {
									console.log(err);
									res.status(400).json("Update failed");
								})
						} else {
							res.status(400).json("You do not have permission to edit this spend, or the spend item does not exist");
						}
					})
					.catch(err => {
						res.status(400).json("Something went wrong");
					});		
			} else {
				res.status(400).json("Invalid token. Please log out of the app and sign in again.");
			}
		})
}

const deleteSpend = (req, res, db) => {
	db.select('user_id').from('users')
		.where('token', '=', req.body.token)
		.then(data => {
			if(data.length){
				let userId = Number(data[0]["user_id"]);
				// spend["user_id"] = Number(data[0]["user_id"]);
				//Check is the user editing the spend has created it
				db.select('user_id').from('spend_items')
					.where('id', '=', req.params.id)
					.then((data) => {
						if(data.length && userId == data[0]["user_id"]) {
							// enter spend into database 
							db('spend_items')
								.where("id", "=", req.params.id)
								.del()
								.then(data => {
									console.log(data);
									res.status(200).json("Delete successful");
								})
								.catch(err => {
									console.log(err);
									res.status(400).json("Update failed");
								})
						} else {
							res.status(400).json("You do not have permission to delete this spend, or the spend item does not exist");
						}
					})
					.catch(err => {
						res.status(400).json("Something went wrong");
					});		
			} else {
				res.status(400).json("Invalid token. Please log out of the app and sign in again.");
			}
		})
}

const listSpends = (req, res, db) => {
	// Get user id from token
	db.select('user_id').from('users')
		.where('token', '=', req.body.token)
		.then(data => {
			if(!req.body.minDate || !req.body.maxDate){
				req.body.minDate = new Date();
				req.body.maxDate = new Date();
			}
			// If user exists, get spends for user between specified date range, with category and sub category names as well 
			if(data.length){
				let userId = data[0]['user_id'];
				return db('spend_items as spends')
					.join('category as cat', 'spends.category_id', 'cat.id')
					.join('sub_category as subcat', 'spends.sub_category_id', 'subcat.id')
					.select(
						'spends.id',
						'spends.purchase_date',
						'spends.name',
						'spends.amount',
						'spends.category_id',
						'cat.name as category_name',
						'spends.sub_category_id',
						'subcat.name as sub_category_name',
						'spends.user_id'
					)
					.where('spends.user_id', '=', userId)
					.whereBetween('spends.purchase_date', [req.body.minDate, req.body.maxDate])
					.orderBy('spends.purchase_date', 'asc');
			} else {
				throw Error("Invalid token. Please log out of the app and sign in again.");
			}
		})
		.then(spends => {
			// Return spends if available
			if(spends.length){
				res.status(200).json(spends);
			} else {
				res.status(200).json("No spends found");
			}
		})
		.catch(err => {
			res.status(400).json(err.message);
		})
}

module.exports = {
	listCategories: listCategories,
	listSubCategories: listSubCategories,
	getDateRange: getDateRange,
	addSpend: addSpend,
	editSpend: editSpend,
	deleteSpend: deleteSpend,
	getConfig: getConfig,
	listSpends: listSpends
};	