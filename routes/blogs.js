const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/blogs
// @desc    Get all blogs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json(blog);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Blog not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/blogs
// @desc    Create a blog
// @access  Admin
router.post('/', [auth, admin], async (req, res) => {
    const { title, excerpt, content, image, category } = req.body;

    try {
        const newBlog = new Blog({
            title,
            excerpt,
            content,
            image,
            category
        });

        const blog = await newBlog.save();
        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Admin
router.put('/:id', [auth, admin], async (req, res) => {
    const { title, excerpt, content, image, category } = req.body;

    // Build blog object
    const blogFields = {};
    if (title) blogFields.title = title;
    if (excerpt) blogFields.excerpt = excerpt;
    if (content) blogFields.content = content;
    if (image) blogFields.image = image;
    if (category) blogFields.category = category;

    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) return res.status(404).json({ msg: 'Blog not found' });

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { $set: blogFields },
            { new: true }
        );

        res.json(blog);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Admin
router.delete('/:id', [auth, admin], async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ msg: 'Blog not found' });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Blog removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
