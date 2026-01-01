const mongoose = require('mongoose');
require('dotenv').config();
const Withdrawal = require('./models/Withdrawal');

async function fixWithdrawal() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const res = await Withdrawal.findByIdAndUpdate(
            '69564590ad958b2eef52b98e',
            { payment_method_id: '69562f1091155403a4043864' },
            { new: true }
        );

        console.log('Updated Withdrawal:', res);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixWithdrawal();
