const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

const Deposit = require('./server/models/Deposit');
const PaymentMethod = require('./server/models/PaymentMethod');
const User = require('./server/models/User');

async function checkDeposits() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const deposits = await Deposit.find().populate('payment_method_id');

        console.log(`Found ${deposits.length} deposits.`);

        deposits.forEach((d, i) => {
            console.log(`[${i}] ID: ${d._id}`);
            console.log(`    User ID: ${d.user_id}`);
            console.log(`    PaymentMethod ID (Ref): ${d.payment_method_id?._id || 'NULL'}`);
            console.log(`    PaymentMethod Name: ${d.payment_method_id?.method_name || 'UNDEFINED'}`);
            console.log(`    Raw PaymentMethod ID stored:`, d.toObject().payment_method_id);
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

checkDeposits();
