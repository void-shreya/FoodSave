const jwt = require('jsonwebtoken');
const config = require('../config/env');

const signToken = (payload) => {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      email: payload.email
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = {
  signToken,
  verifyToken
};
