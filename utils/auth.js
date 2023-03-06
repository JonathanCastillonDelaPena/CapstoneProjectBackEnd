const bcrypt = require("bcrypt");

const securePassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 	salt);
    return hashedPassword;
};

const checkPassword = async(password,storedpass) => {
    const isPass = await bcrypt.compare(password, storedpass);
    return isPass;
};

module.exports = {securePassword,checkPassword};