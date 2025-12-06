// import the gql tagged template function
import { gql } from 'apollo-server-express';

// create our typeDefs
// all type definitions need to specify the type of data that is returning.
const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    createdAt: String
    experience: Int
    classLevel: String
    fullName: String
    institution: String
    contactNumber: String
  }

  type Auth {
    token: ID!
    user: User
  }

  type Question {
    question: String
    options: [String]
    answer: String
  }

  type Lesson {
    _id: ID
    title: String
    questions: [Question]
    createdAt: String
    classLevel: String
  }

  type Subject {
    _id: ID
    subjectId: String
    title: String
    lessons: [Lesson]
    createdAt: String
  }

  type PersonalQuiz {
    _id: ID
    title: String
    questions: [Question]
    createdAt: String
    userId: ID
  }

  type Notification {
    _id: ID
    title: String
    message: String
    type: String
    relatedId: ID
    classLevel: String
    createdAt: String
    read: Boolean
  }

  input QuestionInput {
    question: String!
    options: [String]!
    answer: String!
  }

  type Query {
    me: User
    users: [User]
    user(username: String!): User
    lessons(subjectId: ID): [Lesson]
    lesson(id: ID!): Lesson
    subjects(classLevel: String): [Subject]
    personalQuizzes: [PersonalQuiz]
    personalQuiz(id: ID!): PersonalQuiz
    notifications: [Notification]
  }

  type Mutation {
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!, classLevel: String!, fullName: String!, institution: String!, contactNumber: String!): Auth
    updateExperience(experience: Int!): User
    addLesson(title: String!, questions: [QuestionInput]!, classLevel: String!, subjectId: String!): Lesson
    addSubject(subjectId: String!, title: String!): Subject
    addPersonalQuiz(title: String!, questions: [QuestionInput]!): PersonalQuiz
  }
`;

export default typeDefs;
