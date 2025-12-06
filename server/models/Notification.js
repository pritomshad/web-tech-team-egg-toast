import { Schema, model } from 'mongoose';

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['lesson', 'subject', 'general'],
        default: 'general',
    },
    relatedId: {
        type: Schema.Types.ObjectId,
        refPath: 'type',
    },
    classLevel: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
});

const Notification = model('Notification', notificationSchema);

export default Notification;
