const User = require('../../schemas/user.js');
const { default: mongoose } = require('mongoose');

exports.findUserByIDBasic = async (_id) => {
  const user = await User.findOne({_id});

  if (!user) {
    return false;
  }
  return user;
};

exports.createUser = async ( email, password, nickname) => {
 
  const data = new User({
      password:password,
      email: email,
      nickname:nickname,
  });
  const saveResponse = await data.save();
  return saveResponse;
};

exports.updateUser = async (updatedData, errorMessage) => {
  const userId = updatedData.userId;
  const updatedUser = await User.findOneAndUpdate({
    userId
  }, updatedData);
  if (!updatedUser) {
    const error = new Error(errorMessage);
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
}
exports.findBynickname = async (nickname) => {
  const user = await User.findOne({
    nickname: { $regex: nickname.toString(), "$options": "i" }
  });
  if (!user) {
    return false;
  }
  return user;
};

exports.getUsers = async (limit, page) => {
  const options = {
    page: page || 1,
    limit: limit || Consts.DEFAULT_PAGING_ELEMENT_LIMIT,
  };

  const response = await User.paginate({}, options);
  return response;
};
