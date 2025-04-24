import { model, Schema } from "mongoose";

const quizSubmissionSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        selectedOption: [{
            questionId: {
                type: Schema.Types.ObjectId,
                ref: "Question",
                required: true
            },
            selectedOption: {
                type: String,
                default: ""
            }
        }],
        score: {
            type: Number,
            required: true,
            min: 0
        },
        incorrectAnswers: {
            type: Number,
            required: true,
            min: 0
        },
        stars: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true,
    }
);

export const QuizSubmission = model("QuizSubmission", quizSubmissionSchema);
