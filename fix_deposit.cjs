const mongoose = require('mongoose');
require('dotenv').config();
const Deposit = require('./models/Deposit');

async function fixDeposit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const res = await Deposit.findByIdAndUpdate(
            '69563b7689584b42be848f82',
            { payment_method_id: '69562f1091155403a4043864' },
            { new: true }
        );

        console.log('Updated Deposit:', res);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixDeposit();
