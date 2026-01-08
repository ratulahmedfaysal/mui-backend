module.exports = function (req, res, next) {
    if (req.role !== 'admin') {
        return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    next();
};
