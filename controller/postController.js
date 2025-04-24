import { Post } from "../models/postModel.js";
import ApiError from "../utils/ApiError.js";
import { handleAsync } from "../utils/handleAsync.js";

const createPost = handleAsync(async (req, res) => {
    const { title, content, category, image } = req.body;
    
    if (!title || !content || !category) {
        throw new ApiError(400, "Please provide all required fields");
    }

    const post = new Post({
        title,
        content,
        category,
        image,
        author: req.user._id
    });

    await post.save();
    
    res.status(201).json({
        success: true,
        message: "Post created successfully",
        data: post
    });
});

const getPosts = handleAsync(async (req, res) => {
    const { search, myPosts, category, page = 1, limit = 10 } = req.query;
    const filter = {};
    
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" }},
            { content: { $regex: search, $options: "i" }}
        ];
    }
    if (myPosts) {
        filter.author = req.user._id;
    }
    if (category) {
        filter.category = category;
    }

    const skip = (page - 1) * limit;

    const posts = await Post.find(filter)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);

    res.status(200).json({
        success: true,
        message: "Posts retrieved successfully",
        data: {
            posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        }
    });
});

const updatePost = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { title, content, category, image } = req.body;
    
    const post = await Post.findById(id);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Only author or admin can update post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this post");
    }

    Object.assign(post, {
        title: title || post.title,
        content: content || post.content,
        category: category || post.category,
        image: image || post.image
    });

    await post.save();

    res.status(200).json({
        success: true,
        message: "Post updated successfully",
        data: post
    });
});

const deletePost = handleAsync(async (req, res) => {
    const { id } = req.params;
    
    const post = await Post.findById(id);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    // Only author or admin can delete post
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this post");
    }

    await post.deleteOne();

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    });
});

const toggleUpvote = handleAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const upvoteIndex = post.upvotedBy.indexOf(userId);
    
    if (upvoteIndex === -1) {
        // Add upvote
        post.upvotedBy.push(userId);
    } else {
        // Remove upvote
        post.upvotedBy.splice(upvoteIndex, 1);
    }

    await post.save();

    res.status(200).json({
        success: true,
        message: upvoteIndex === -1 ? "Post upvoted successfully" : "Post un-upvoted successfully",
        data: {
            upvoteCount: post.upvoteCount,
            hasUserUpvoted: upvoteIndex === -1
        }
    });
});

const addComment = handleAsync(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await Post.findById(id);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    post.comments.push({
        content,
        author: req.user._id
    });

    await post.save();

    const updatedPost = await Post.findById(id)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar');

    res.status(200).json({
        success: true,
        message: "Comment added successfully",
        data: updatedPost
    });
});

const deleteComment = handleAsync(async (req, res) => {
    const { postId, commentId } = req.params;
    
    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Only comment author or admin can delete comment
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    comment.remove();
    await post.save();

    res.status(200).json({
        success: true,
        message: "Comment deleted successfully"
    });
});
const updateComment = handleAsync(async (req, res) => {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    
    if (!content) {
        throw new ApiError(400, "Comment content is required");
    }

    const post = await Post.findById(postId);
    
    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Only comment author or admin can update comment
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content;
    await post.save();

    const updatedPost = await Post.findById(postId)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar');

    res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedPost
    });
});
export const postController = {
    createPost,
    getPosts,
    deletePost,
    updatePost,
    toggleUpvote,
    addComment,
    deleteComment,
	updateComment
};
