import { Schema, model } from 'mongoose';

import { lessonSchema } from './Lesson.js';

const subjectSchema = new Schema({
    subjectId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    lessons: [lessonSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Subject = model('Subject', subjectSchema);

export default Subject;
