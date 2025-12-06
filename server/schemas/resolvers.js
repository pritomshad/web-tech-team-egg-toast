import { User, Lesson, PersonalQuiz, Subject, Notification } from '../models/index.js';
import { AuthenticationError } from 'apollo-server-express';
import { signToken } from '../utils/auth.js';

const resolvers = {
  Query: {
    // get logged in user
    me: async (parent, args, context) => {
      // check if context.user exists, if not, throw authentication error
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');

        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },

    // get all users
    users: async () => {
      return (
        User.find()
          // omit mongoose-specific __v property and user's password information
          .select('-__v -password')
      );
    },

    // get a user by username
    user: async (parent, { username }) => {
      return User.findOne({ username }).select('-__v -password');
    },

    // get all subjects filtered by class level (checking lessons inside)
    subjects: async (parent, { classLevel }, context) => {
      if (context.user) {
        const level = classLevel || (await User.findById(context.user._id)).classLevel;
        // Find subjects that have at least one lesson of this class level
        // OR just return all subjects and let frontend filter?
        // Better to filter here if possible.
        // If we want to return ONLY the lessons of that level, we might need aggregation.
        // But for simplicity, let's return Subjects that contain such lessons.
        // Actually, if we just return the subject, the `lessons` field will contain ALL lessons.
        // If the UI expects only relevant lessons, we might need a custom resolver for `lessons` field on Subject.
        // For now, let's just return subjects that have ANY lesson of this level.
        return Subject.find({ "lessons.classLevel": level }).sort({ createdAt: -1 });
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // get all lessons filtered by subjectId (from embedded)
    lessons: async (parent, { subjectId }, context) => {
      if (context.user) {
        if (subjectId) {
          const subject = await Subject.findOne({ subjectId });
          return subject ? subject.lessons : [];
        }
        return [];
      }
      throw new AuthenticationError('You need to be logged in to see lessons!');
    },

    // get single lesson (search through all subjects)
    lesson: async (parent, { id }) => {
      // This is inefficient but works for embedded documents without knowing parent
      const subject = await Subject.findOne({ "lessons._id": id });
      if (subject) {
        return subject.lessons.id(id);
      }
      return null;
    },

    // get user's personal quizzes
    personalQuizzes: async (parent, args, context) => {
      if (context.user) {
        return PersonalQuiz.find({ userId: context.user._id }).sort({ createdAt: -1 });
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // get single personal quiz
    personalQuiz: async (parent, { id }, context) => {
      if (context.user) {
        const quiz = await PersonalQuiz.findById(id);
        if (quiz.userId.toString() !== context.user._id) {
          throw new AuthenticationError('Not authorized to view this quiz');
        }
        return quiz;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // get notifications for user's class level
    notifications: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id);
        return Notification.find({ classLevel: user.classLevel }).sort({ createdAt: -1 });
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
  Mutation: {
    // add a user to the database
    addUser: async (parent, args) => {
      const user = await User.create(args); // create a new user from args
      const token = signToken(user); // sign a token for the new user
      return { token, user }; // return the token and the user
    },

    // login a user
    login: async (parent, { email, password }) => {
      // find a user by email
      const user = await User.findOne({ email });

      // if user doesn't exist, display error message
      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // check if password is correct
      const correctPw = await user.isCorrectPassword(password);

      // if password is incorrect, display error message
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // create token
      const token = signToken(user);
      // return token and user
      return { token, user };
    },

    // update a user's experience
    updateExperience: async (parent, { experience }, context) => {
      // check if context.user exists, if not, throw authentication error
      if (context.user) {
        // find user by id and update experience
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $set: { experience } },
          { new: true }
        );

        // return updated user
        return updatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // add a new subject (teacher/admin)
    addSubject: async (parent, { subjectId, title }, context) => {
      if (context.user) {
        const subject = await Subject.create({ subjectId, title });
        return subject;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // add a new lesson (teacher/admin)
    addLesson: async (parent, { title, questions, classLevel, subjectId }, context) => {
      if (context.user) {
        // Find subject by custom subjectId
        const subject = await Subject.findOne({ subjectId });
        if (!subject) {
          throw new Error('Subject not found');
        }

        // Create new lesson object
        const newLesson = { title, questions, classLevel };

        // Push to lessons array
        subject.lessons.push(newLesson);
        await subject.save();

        // Get the added lesson (it will be the last one)
        const lesson = subject.lessons[subject.lessons.length - 1];

        // Create notification for this class level
        await Notification.create({
          title: 'New Lesson Added',
          message: `A new lesson "${title}" has been added to ${subject.title}`,
          type: 'lesson',
          relatedId: lesson._id,
          classLevel: classLevel,
        });

        return lesson;
      }
      throw new AuthenticationError('You need to be logged in!');
    },

    // add a personal quiz (student AI generation)
    addPersonalQuiz: async (parent, { title, questions }, context) => {
      if (context.user) {
        const quiz = await PersonalQuiz.create({ title, questions, userId: context.user._id });
        return quiz;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

export default resolvers;
