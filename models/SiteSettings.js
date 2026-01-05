const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'main_settings' },
    general: {
        siteName: { type: String, default: 'AuraBit' },
        metaTitle: { type: String, default: '' },
        metaDescription: { type: String, default: '' },
    },
    contact: {
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
    },
    livePerformance: {
        totalProfitPaid: { type: String, default: '$0.00' }
    },
    diversificationItems: [{
        id: String,
        title: String,
        description: String,
        icon: String,
        features: [String]
    }],
    // Store other sections as mixed for flexibility or define them strictly
    socials: mongoose.Schema.Types.Mixed,
    footer: mongoose.Schema.Types.Mixed,
    hero: mongoose.Schema.Types.Mixed,
    section_headers: mongoose.Schema.Types.Mixed,
    faqs: Array,
    howItWorks: Array,
    whyChooseUs: Array,
    reviews: Array,
    banners: [String],
    notice: String,
    about: {
        title: { type: String, default: 'About Us' },
        description: { type: String, default: '' },
        image: { type: String, default: '' }
    },

}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
