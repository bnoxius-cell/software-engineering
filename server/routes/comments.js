const express = require('express');
const router = express.Router();
const Artwork = require('../models/Artwork');
const { protect } = require('../middleware/auth');

const serializeComment = (comment) => {
    const plainComment = comment.toObject ? comment.toObject() : comment;
    return {
        ...plainComment,
        id: plainComment._id?.toString(),
        artworkId: plainComment.artworkId?.toString(),
        likedBy: (plainComment.likedBy || []).map((id) => id.toString())
    };
};

const isSameId = (left, right) => left?.toString() === right?.toString();

// GET comments for an artwork
router.get('/artworks/:artworkId/comments', async (req, res) => {
    try {
        const artwork = await Artwork.findById(req.params.artworkId)
            .populate('comments.user', 'name username avatar');
        if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
        if (artwork.status !== 'published') {
            return res.status(404).json({ message: 'Artwork not found' });
        }
        
        // Sort comments by newest first
        const sortedComments = [...artwork.comments]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((comment) => serializeComment({
                ...comment.toObject(),
                artworkId: artwork._id
            }));
        res.json(sortedComments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
});

// POST new comment
router.post('/artworks/:artworkId/comments', protect, async (req, res) => {
    try {
        const { content } = req.body;
        const trimmedContent = content?.trim();
        if (!trimmedContent) return res.status(400).json({ message: 'Content is required' });

        const artwork = await Artwork.findById(req.params.artworkId);
        if (!artwork) return res.status(404).json({ message: 'Artwork not found' });
        if (artwork.status !== 'published') {
            return res.status(400).json({ message: 'Comments can only be added to published artwork' });
        }

        const newComment = {
            user: req.user._id || req.user.id,
            content: trimmedContent
        };

        artwork.comments.push(newComment);
        await artwork.save();

        // Fetch the newly added comment and populate user data to return back to frontend
        const updatedArtwork = await Artwork.findById(req.params.artworkId)
            .populate('comments.user', 'name username avatar');
        
        // The newly added comment will be the last one in the array
        const addedComment = updatedArtwork.comments[updatedArtwork.comments.length - 1];

        res.status(201).json(serializeComment({
            ...addedComment.toObject(),
            artworkId: updatedArtwork._id
        }));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error posting comment' });
    }
});

// GET user's liked comments
router.get('/comments/likes', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const artworks = await Artwork.find({ 'comments.likedBy': userId });
        
        const likedCommentIds = [];
        artworks.forEach(art => {
            art.comments.forEach(comment => {
                if ((comment.likedBy || []).some((id) => isSameId(id, userId))) {
                    likedCommentIds.push(comment._id.toString());
                }
            });
        });
        
        res.json(likedCommentIds);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching liked comments' });
    }
});

// POST toggle like on a comment
router.post('/comments/:commentId/like', protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { commentId } = req.params;

        const artwork = await Artwork.findOne({ 'comments._id': commentId });
        if (!artwork) return res.status(404).json({ message: 'Comment not found' });
        if (artwork.status !== 'published') {
            return res.status(400).json({ message: 'Comments can only be liked on published artwork' });
        }

        const comment = artwork.comments.id(commentId);
        
        const isLiked = (comment.likedBy || []).some((id) => isSameId(id, userId));
        if (isLiked) {
            comment.likedBy.pull(userId);
            comment.likes = Math.max(0, comment.likes - 1);
        } else {
            comment.likedBy.push(userId);
            comment.likes += 1;
        }

        await artwork.save();
        res.json({ liked: !isLiked, likes: comment.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error liking comment' });
    }
});

module.exports = router;
