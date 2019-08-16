const addSpend = (req, res, db) => {
	// Get data from body
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
				spend["user_id"] = Number(data[0]["user_id"]);
				// enter spend into database 
				db('spend_items')
					.returning('*')
					.insert(spend)
					.then((data) => {
						let insertedSpend = data[0];
						res.status(201).json(insertedSpend);
					})
					.catch(err => {
						console.log(err);
						res.status(400).json("Could not add spend to database");
					})
			} else {
				res.status(400).json("Invalid token. Please log out of the app and sign in again.")
			}
		})

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

module.exports = {
	addSpend: addSpend,
	editSpend: editSpend,
	deleteSpend: deleteSpend
	/* listSpends: listSpends,
	 */
};	