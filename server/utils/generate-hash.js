const bcrypt = require("bcryptjs");

async function generateHash(password) {
  const hash = await bcrypt.hash(password, 10);
  console.log("Password:", password);
  console.log("Hash:", hash);
}

// Change this to your desired password
generateHash("hashedpassword123");
