import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { QUERY_PERSONAL_QUIZZES } from '../utils/queries';
import { AiOutlineLoading, AiOutlineArrowLeft } from 'react-icons/ai';
import QuizPage from './QuizPage';
import { AiQuiz } from '../utils/quizGenerator';
import Auth from '../utils/auth';
import { Navigate } from 'react-router-dom';

const PersonalQuizzes = () => {
    if (!Auth.loggedIn()) return <Navigate to="/login" />;

    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const { data, loading } = useQuery(QUERY_PERSONAL_QUIZZES);
    const quizzes = data?.personalQuizzes || [];

    const handleQuizClick = (quizData) => {
        const quiz = new AiQuiz(quizData.questions);
        setSelectedQuiz(quiz);
    };

    const handleBack = () => {
        setSelectedQuiz(null);
    };

    if (selectedQuiz) {
        return <QuizPage quiz={selectedQuiz} />;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <AiOutlineLoading className="animate-spin h-12 w-12 text-primary" />
            </div>
        );
    }

    return (
        <section className="w-full min-h-screen p-4 md:p-8">
            <h1 className="h1-style mb-8">My AI Quizzes</h1>

            {quizzes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div
                            key={quiz._id}
                            onClick={() => handleQuizClick(quiz)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border border-transparent hover:border-primary flex flex-col justify-between min-h-[150px]"
                        >
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                                    {quiz.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {quiz.questions.length} Questions
                                </p>
                            </div>
                            <div className="mt-4 text-xs text-gray-400">
                                Created: {new Date(parseInt(quiz.createdAt)).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-500 mb-4">You haven't generated any quizzes yet.</p>
                    <p className="text-gray-400">Go to "AI Quiz" to generate one from a PDF!</p>
                </div>
            )}
        </section>
    );
};

export default PersonalQuizzes;
