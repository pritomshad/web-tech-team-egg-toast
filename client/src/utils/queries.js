// This file stores all of the GraphQL query requests.
import { gql } from '@apollo/client';

// Because we aren't passing any variables to it, we can simply name the query, and GraphQL will handle the rest.
export const QUERY_ME = gql`
  {
    me {
      _id
      username
      email
      createdAt
      experience
      classLevel
      fullName
      institution
      contactNumber
    }
  }
`;

export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
      createdAt
      experience
      classLevel
      fullName
      institution
      contactNumber
    }
  }
`;

export const QUERY_USERS = gql`
  {
    users {
      _id
      username
      email
      createdAt
      experience
    }
  }
`;

export const QUERY_SUBJECTS = gql`
  query subjects($classLevel: String) {
    subjects(classLevel: $classLevel) {
      _id
      subjectId
      title
    }
  }
`;

export const QUERY_LESSONS = gql`
  query lessons($subjectId: ID) {
    lessons(subjectId: $subjectId) {
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

export const QUERY_PERSONAL_QUIZZES = gql`
  {
    personalQuizzes {
      _id
      title
      questions {
        question
        options
        answer
      }
      createdAt
    }
  }
`;

export const QUERY_NOTIFICATIONS = gql`
  {
    notifications {
      _id
      title
      message
      type
      relatedId
      classLevel
      createdAt
      read
    }
  }
`;
