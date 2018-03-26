const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes){
    var Users =  sequelize.define('users', {
    	id: {
    		type: Sequelize.BIGINT,
			autoIncrement: true,
    		primaryKey: true
    	},
  		firstName: { type: Sequelize.STRING, field: 'firstname' },
  		lastName: { type: Sequelize.STRING, field: 'lastname' },
		birthDate: { type: Sequelize.DATEONLY, field: 'birthdate' }, //Pass a string like 02-20-1972
		email: { type: Sequelize.STRING, field: 'email' },
		bio: { type: Sequelize.STRING, field: 'bio' },
		address1: { type: Sequelize.STRING, field: 'address1' },
		address2: { type: Sequelize.STRING, field: 'address2' },
		city: { type: Sequelize.STRING, field: 'city' },
		state: { type: Sequelize.STRING, field: 'state' },
		zip: { type: Sequelize.STRING, field: 'zip' },
		weight: { type: Sequelize.SMALLINT, field: 'weight' },
		hashword: { type: Sequelize.STRING, field: 'hashword' }
	},
	{
		timestamps: false,
	});
  Users.associate = function(models) {
    models.Users.hasMany(models.AuthTokens);
  };
  return Users;
};
