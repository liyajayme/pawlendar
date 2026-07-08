const jwt = require('jsonwebtoken');

const JWT_SECRET =
  process.env.JWT_SECRET || 'your_secret_key';

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '1d'
    }
  );
}

module.exports = {
  generateToken
};