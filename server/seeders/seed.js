import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { Subject, Lesson } from '../models/index.js';
import connectDB from '../config/connection.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);

        console.log('Connected to database. Clearing existing data...');
        try {
            await Subject.collection.drop();
        } catch (e) {
            console.log('Subject collection not found, skipping drop...');
        }
        // Lesson collection might not exist as a separate collection anymore if purely embedded,
        // but dropping it just in case.
        try {
            await mongoose.connection.db.dropCollection('lessons');
        } catch (e) {
            console.log('lessons collection not found, skipping drop...');
        }

        const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
        const subjectsList = ['Mathematics', 'Science', 'English', 'History'];

        console.log('Seeding data...');

        for (const subjectTitle of subjectsList) {
            const lessons = [];

            // Generate lessons for each class level for this subject
            for (const classLevel of classes) {
                lessons.push({
                    title: `${subjectTitle} - Class ${classLevel} - Chapter 1: Introduction`,
                    classLevel: classLevel,
                    questions: [
                        {
                            question: `What is the basic concept of ${subjectTitle} Class ${classLevel}?`,
                            options: ['Option A', 'Option B', 'Option C', 'Option D'],
                            answer: 'Option A',
                        },
                        {
                            question: `Another question about ${subjectTitle}?`,
                            options: ['Yes', 'No', 'Maybe', 'So'],
                            answer: 'Yes',
                        },
                    ],
                });
                lessons.push({
                    title: `${subjectTitle} - Class ${classLevel} - Chapter 2: Advanced`,
                    classLevel: classLevel,
                    questions: [
                        {
                            question: `Advanced question for ${subjectTitle} Class ${classLevel}?`,
                            options: ['Hard', 'Easy', 'Medium', 'Impossible'],
                            answer: 'Hard',
                        },
                    ],
                });
            }

            // Create Subject with embedded lessons
            // Generate a simple subjectId
            const subjectId = subjectTitle.toLowerCase();

            await Subject.create({
                subjectId: subjectId,
                title: subjectTitle,
                lessons: lessons,
            });
            console.log(`Created subject: ${subjectTitle} with ${lessons.length} lessons.`);
        }

        console.log('Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();
