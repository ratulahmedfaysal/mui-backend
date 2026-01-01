const mongoose = require('mongoose');
require('dotenv').config();
const Withdrawal = require('./models/Withdrawal');
const PaymentMethod = require('./models/PaymentMethod');

async function checkWithdrawals() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const withdrawals = await Withdrawal.find().populate('payment_method_id');

        console.log(`Found ${withdrawals.length} withdrawals.`);

        withdrawals.forEach((w, i) => {
            console.log(`[${i}] ID: ${w._id}`);
            console.log(`    User ID: ${w.user_id}`);
            console.log(`    PaymentMethod ID (Ref): ${w.payment_method_id?._id || 'NULL'}`);
            console.log(`    PaymentMethod Name: ${w.payment_method_id?.method_name || 'UNDEFINED'}`);
            if (!w.payment_method_id) {
                console.log(`    Raw PaymentMethod stored:`, w.payment_method_id);
            }
        });

        // Check raw collection data
        const rawWithdrawals = await mongoose.connection.db.collection('withdrawals').find({}).toArray();
        console.log('\n--- RAW COLLECTION DATA ---');
        rawWithdrawals.forEach((w, i) => {
            console.log(`[${i}] Fields:`, Object.keys(w));
            console.log(`    payment_method_id:`, w.payment_method_id);
        });

        const methods = await PaymentMethod.find();
        console.log(`\nTotal Payment Methods in DB: ${methods.length}`);
        methods.forEach(m => console.log(` - ${m.method_name} (${m._id})`));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkWithdrawals();
