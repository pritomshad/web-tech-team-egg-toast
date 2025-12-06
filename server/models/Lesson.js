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

const lessonSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    questions: [questionSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    classLevel: {
        type: String,
        required: true,
    },
});

const Lesson = model('Lesson', lessonSchema);

export { lessonSchema };
export default Lesson;
