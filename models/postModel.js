import { model, Schema } from "mongoose";

const commentSchema = new Schema({
    content: {
        type: String,
        required: [true, "Comment content is required"],
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const postSchema = new Schema(
    {
        title: { 
            type: String, 
            required: [true, "Post title is required"],
            trim: true,
            maxLength: [100, "Title cannot be more than 100 characters"]
        },
        content: { 
            type: String, 
            required: [true, "Post content is required"]
        },
        category: { 
            type: String, 
            required: true,
            enum: ["question", "announcement", "discussion", "resource"]
        },
        image: { 
            type: String,
            required: false
        },
        author: { 
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        upvotedBy: [{ 
            type: Schema.Types.ObjectId, 
            ref: "User"
        }],
        upvoteCount: {
            type: Number,
            default: 0
        },
        comments: [commentSchema]
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Middleware to update upvote count when upvotedBy array changes
postSchema.pre('save', function(next) {
    if (this.isModified('upvotedBy')) {
        this.upvoteCount = this.upvotedBy.length;
    }
    next();
});

export const Post = model("Post", postSchema);
