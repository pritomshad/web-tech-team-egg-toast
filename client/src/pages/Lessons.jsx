import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_SUBJECTS, QUERY_LESSONS } from '../utils/queries';
import { AiOutlineLoading, AiOutlineArrowLeft } from 'react-icons/ai';
import QuizPage from './QuizPage';
import { AiQuiz } from '../utils/quizGenerator';
import Auth from '../utils/auth';
import { Navigate } from 'react-router-dom';

const Lessons = () => {
  if (!Auth.loggedIn()) return <Navigate to="/login" />;

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Fetch subjects
  const { data: subjectsData, loading: subjectsLoading } = useQuery(QUERY_SUBJECTS);

  // Fetch lessons when a subject is selected
  const { data: lessonsData, loading: lessonsLoading } = useQuery(QUERY_LESSONS, {
    variables: { subjectId: selectedSubject?.subjectId },
    skip: !selectedSubject,
  });

  const subjects = subjectsData?.subjects || [];
  const lessons = lessonsData?.lessons || [];

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
  };

  const handleLessonClick = (lesson) => {
    const quiz = new AiQuiz(lesson.questions);
    setSelectedLesson(quiz);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedLesson(null);
  };

  if (selectedLesson) {
    return <QuizPage quiz={selectedLesson} />;
  }

  if (subjectsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <AiOutlineLoading className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <section className="w-full min-h-screen p-4 md:p-8">
      {selectedSubject ? (
        <>
          <button
            onClick={handleBackToSubjects}
            className="flex items-center gap-2 mb-6 text-gray-600 hover:text-primary transition-colors"
          >
            <AiOutlineArrowLeft /> Back to Subjects
          </button>
          <h1 className="h1-style mb-8">{selectedSubject.title} Lessons</h1>

          {lessonsLoading ? (
            <div className="flex justify-center py-12">
              <AiOutlineLoading className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : lessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson._id}
                  onClick={() => handleLessonClick(lesson)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border border-transparent hover:border-primary"
                >
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                    {lesson.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {lesson.questions.length} Questions
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">No lessons found for this subject.</p>
          )}
        </>
      ) : (
        <>
          <h1 className="h1-style mb-8">Select a Subject</h1>
          {subjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  onClick={() => handleSubjectClick(subject)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-8 flex flex-col items-center justify-center gap-4 border-2 border-transparent hover:border-primary"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                    {subject.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">
                    {subject.title}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500 mb-4">No subjects found for your class level.</p>
              <p className="text-gray-400">Please contact your administrator to add subjects.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Lessons;
