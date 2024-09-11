const userHandler = require('./handler');
const bcrypt = require('bcrypt');

exports.createUser = async (req, res, next) => {
    try {
        var email = req.body.email;
        var nickname =  req.body.nickname;
        const salt = await bcrypt.genSalt(10);
        var password = await bcrypt.hash( req.body.password, salt);
        var result = await userHandler.createUser(email, password, nickname)
        return res.status(201).json({ userId: result.id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }

};

