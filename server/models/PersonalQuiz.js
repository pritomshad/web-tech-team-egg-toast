import { Schema, model } from 'mongoose';

const questionSchema = new Schema({
    question: {
        type: String,
        required: true,
    },
    options: [
        {
            type: String,
            required: true,
        },
    ],
    answer: {
        type: String,
        required: true,
    },
});

const personalQuizSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    questions: [questionSchema],
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const PersonalQuiz = model('PersonalQuiz', personalQuizSchema);

export default PersonalQuiz;
