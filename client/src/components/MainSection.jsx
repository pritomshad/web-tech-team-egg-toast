// This contains the routes for the app and additional styling for the app depending on logged in state and path
import { useEffect } from 'react';
import { Header, Footer, Sidebar, MobileMenu } from '.';
import { Route, Routes, useLocation } from 'react-router-dom';

import {
  Home, Login, Signup, NoMatch, Lessons, Notifications, Leaderboards, Profile, QuizPage,
  AiMCQgeneration,
  PersonalQuizzes,
  TimedQuiz,
} from '../pages';

import Auth from '../utils/auth';

const MainSection = () => {
  const loggedIn = Auth.loggedIn();
  // returns true if locations includes /quiz
  const quizLocation = useLocation().pathname.includes('/quiz');

  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to the top of the page on route change
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {loggedIn && !quizLocation && <Sidebar />}
      <div
        className={`overflow-x-hidden overflow-y-auto flex flex-col ${loggedIn ? (quizLocation ? '' : 'mb-20 sm:mb-0 sm:ms-[88px] xl:ms-[300px]') : ''
          } `}
      >
        {!loggedIn && <Header />}
        <main>
          <Routes>
            <Route
              path="/"
              element={<Home />}
            />
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="/signup"
              element={<Signup />}
            />
            <Route
              path="/lessons"
              element={<Lessons />}
            />
            <Route
              path="/notifications"
              element={<Notifications />}
            />
            <Route
              path="/ai-quiz"
              element={<AiMCQgeneration />}
            />
            <Route
              path="/personal-quizzes"
              element={<PersonalQuizzes />}
            />
            <Route
              path="/timed-quiz"
              element={<TimedQuiz />}
            />
            <Route
              path="/leaderboards"
              element={<Leaderboards />}
            />
            <Route
              path="/profile"
              element={<Profile />}
            />
            <Route
              path="*"
              element={<NoMatch />}
            />
          </Routes>
        </main>
        {!quizLocation && <Footer />}
      </div>
      {loggedIn && !quizLocation && <MobileMenu />}
    </>
  );
};

export default MainSection;
