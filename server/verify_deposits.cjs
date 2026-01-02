const mongoose = require('mongoose');
require('dotenv').config();
const Deposit = require('./models/Deposit');
const PaymentMethod = require('./models/PaymentMethod');

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
            if (!d.payment_method_id) {
                console.log(`    Raw PaymentMethod stored:`, d.payment_method_id); // might be ID or null
                // To check what is actually in DB without populate
                // We'd need to re-fetch without populate or look at raw object
            }
        });

        const rawDeposits = await mongoose.connection.db.collection('deposits').find({}).toArray();
        console.log('\n--- RAW COLLECTION DATA ---');
        rawDeposits.forEach((d, i) => {
            console.log(`[${i}] Fields:`, Object.keys(d));
            console.log(`    payment_method_id:`, d.payment_method_id);
            console.log(`    payment_method:`, d.payment_method);
            console.log(`    method_name (embedded?):`, d.method_name);
        });

        // Check raw unpopulated for the first one if failed
        if (deposits.length > 0 && !deposits[0].payment_method_id) {
            const raw = await Deposit.findById(deposits[0]._id);
            console.log('Raw first deposit payment_method_id:', raw.payment_method_id);
        }

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
