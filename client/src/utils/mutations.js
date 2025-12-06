// This file stores all of the GraphQL mutation requests.
import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!, $classLevel: String!, $fullName: String!, $institution: String!, $contactNumber: String!) {
    addUser(username: $username, email: $email, password: $password, classLevel: $classLevel, fullName: $fullName, institution: $institution, contactNumber: $contactNumber) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const UPDATE_EXPERIENCE = gql`
  mutation updateExperience($experience: Int!) {
    updateExperience(experience: $experience) {
      _id
      username
      experience
    }
  }
`;

export const ADD_LESSON = gql`
  mutation addLesson($title: String!, $questions: [QuestionInput]!, $classLevel: String!, $subjectId: ID!) {
    addLesson(title: $title, questions: $questions, classLevel: $classLevel, subjectId: $subjectId) {
      _id
      title
      questions {
        question
        options
        answer
      }
      classLevel
      subjectId
    }
  }
`;

export const ADD_SUBJECT = gql`
  mutation addSubject($title: String!, $classLevel: String!) {
    addSubject(title: $title, classLevel: $classLevel) {
      _id
      title
      classLevel
    }
  }
`;

export const ADD_PERSONAL_QUIZ = gql`
  mutation addPersonalQuiz($title: String!, $questions: [QuestionInput]!) {
    addPersonalQuiz(title: $title, questions: $questions) {
      _id
      title
      questions {
        question
        options
        answer
      }
    }
  }
`;
