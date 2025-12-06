import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import countryLogo from '../assets/JapanCountryLogo.png';
import Auth from '../utils/auth';

const Home = () => {
  if (Auth.loggedIn()) return <Navigate to="/lessons" />;

  const subjects = ['Mathematics', 'English', 'Bangla', 'Physics'];
  const [currentSubject, setCurrentSubject] = useState('');
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typingSpeed = isDeleting ? 50 : 100;
    const pauseTime = 2000;

    const timer = setTimeout(() => {
      const currentWord = subjects[subjectIndex];

      if (!isDeleting && charIndex < currentWord.length) {
        // Typing
        setCurrentSubject(currentWord.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        // Deleting
        setCurrentSubject(currentWord.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentWord.length) {
        // Pause before deleting
        setTimeout(() => setIsDeleting(true), pauseTime);
      } else if (isDeleting && charIndex === 0) {
        // Move to next word
        setIsDeleting(false);
        setSubjectIndex((subjectIndex + 1) % subjects.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, subjectIndex, subjects]);

  return (
    // Hero Section with Logo and Call to Action
    <section
      id="hero"
      className="w-full min-h-[calc(100vh-72px)] py-14 hero-bg"
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Call to Action */}
        <div className="flex flex-col items-center lg:items-start font-bold text-center lg:text-left gap-8 order-last lg:order-first">
          <h1 className="text-xl md:text-2xl lg:text-3xl uppercase">
            The Best Way To Practice <br />
            <span className="text-primary text-5xl md:text-6xl lg:text-7xl">
              {currentSubject}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          <p className="max-w-md md:text-xl text-gray-500 dark:text-gray-400">
            Practice Your Subjects with our engaging lessons and quizzes.
          </p>
          <div className="w-72 flex flex-col text-center gap-4">
            {/* Sign Up Button */}
            <Link
              to="/signup"
              className="py-3 px-3 text-white bg-primary hover:bg-primary-shade rounded-xl shadow-xl"
            >
              Start learning
            </Link>
            {/* Login Button */}
            <Link
              to="/login"
              className="py-3 px-3 text-primary dark:text-gray-300 border-2 border-primary dark:border-gray-300 bg-white dark:bg-slate-900 dark:hover:bg-gray-100/10 hover:bg-gray-300 rounded-xl shadow-xl"
            >
              Already have an account?
            </Link>
          </div>
        </div>
        {/* Country Logo */}
        <img
          src={countryLogo}
          alt="Japan Country Logo"
          className="w-48 h-48 md:w-80 md:h-80 lg:w-[480px] lg:h-[480px] transition-all duration-300 ease-in-out"
        />
      </div>
    </section>
  );
};

export default Home;
