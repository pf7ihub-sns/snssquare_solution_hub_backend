const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'test12345@example.com' });
  console.log("Password hash prefix:", user.password.substring(0, 7));
  process.exit(0);
}
check();
