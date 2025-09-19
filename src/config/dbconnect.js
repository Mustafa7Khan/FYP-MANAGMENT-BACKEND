const mongoose = require('mongoose');
const dbconnect = async () => {
    const mongoURL = 'mongodb+srv://csawkumfyp:izvP6m63uW6QXVTI@cluster0.y6onbzx.mongodb.net/mydatabase';
    try {
        await mongoose.connect(mongoURL);
        console.log('Database connected successfully');
    } catch (error) { 
        console.error('Database connection failed:', error); }
};

module.exports = dbconnect;
