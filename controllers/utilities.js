const crypto = require('crypto');

// crypto ships with node - we're leveraging it to create a random, secure token
const createToken = () => {
	return new Promise((resolve, reject) => {
	  crypto.randomBytes(32, (err, data) => {
		err ? 
			reject(err) : 
			resolve(data.toString('base64').replace(/\//g,'_').replace(/\+/g,'-')); //Replacing / & + to make tokens url safe
	  })
	})
  }

module.exports = {
	createToken: createToken
}