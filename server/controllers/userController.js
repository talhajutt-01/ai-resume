// userController.js

const User = require('../models/User');

// Controller function to get user tokens by email
const getUserTokensByEmail = async (req, res) => {
  const email = req.params.email;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ tokens: user.tokens });
  } catch (error) {
    console.error("Error fetching user tokens:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getUserTokensByEmail,
};
