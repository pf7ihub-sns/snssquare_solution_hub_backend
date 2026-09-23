const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: 'test2222@example.com' });
  console.log("Is Password hashed?", user.password.startsWith('$2a$'));
  console.log("Password hash prefix:", user.password.substring(0, 10));
  process.exit(0);
}
check();
