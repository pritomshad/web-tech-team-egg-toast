import axios from 'axios';
import config from '../config';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { ADD_PERSONAL_QUIZ } from '../utils/mutations';
import { AiQuiz } from '../utils/quizGenerator';
import QuizPage from './QuizPage';
import { AiOutlineCloudUpload, AiOutlineLoading } from 'react-icons/ai';

const AiMCQgeneration = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);
    const [generatedQuestions, setGeneratedQuestions] = useState(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');

    const navigate = useNavigate();
    const [addPersonalQuiz, { loading: saving }] = useMutation(ADD_PERSONAL_QUIZ);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a PDF file first.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('pdf', file);

        try {
            const response = await axios.post(`${config.AI_API_URL}/api/upload-pdf`, formData);

            const data = response.data;
            if (data.questions && data.questions.length > 0) {
                setGeneratedQuestions(data.questions);
                // Set default title from filename
                setLessonTitle(file.name.replace('.pdf', ''));
                setShowSaveModal(true);
            } else {
                setError('No questions generated. Please try a different PDF.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while generating the quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLesson = async () => {
        if (!lessonTitle.trim()) {
            setError('Please enter a lesson title.');
            return;
        }

        try {
            const { data } = await addPersonalQuiz({
                variables: {
                    title: lessonTitle,
                    questions: generatedQuestions,
                },
            });

            // Create quiz object and start quiz
            const newQuiz = new AiQuiz(generatedQuestions);
            setQuiz(newQuiz);
            setShowSaveModal(false);
        } catch (err) {
            console.error(err);
            setError('Failed to save lesson. Please try again.');
        }
    };

    if (quiz) {
        return <QuizPage quiz={quiz} />;
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
                    AI Quiz Generator
                </h1>
                <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                    Upload a PDF lecture or document, and we'll generate a quiz for you!
                </p>

                {!showSaveModal ? (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex items-center justify-center w-full">
                            <label
                                htmlFor="dropzone-file"
                                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <AiOutlineCloudUpload className="w-12 h-12 mb-4 text-gray-500 dark:text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF (MAX. 10MB)</p>
                                </div>
                                <input
                                    id="dropzone-file"
                                    type="file"
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        {file && (
                            <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                                Selected: <span className="font-semibold">{file.name}</span>
                            </p>
                        )}

                        {error && (
                            <p className="text-center text-sm text-red-500 font-medium">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-colors flex items-center justify-center gap-2
                  ${loading || !file
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                                } `}
                        >
                            {loading ? (
                                <>
                                    <AiOutlineLoading className="animate-spin w-5 h-5" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Quiz'
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">
                            Save Your Lesson
                        </h2>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="lessonTitle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lesson Title
                            </label>
                            <input
                                type="text"
                                id="lessonTitle"
                                value={lessonTitle}
                                onChange={(e) => setLessonTitle(e.target.value)}
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter a title for this lesson"
                            />
                        </div>

                        {error && (
                            <p className="text-center text-sm text-red-500 font-medium">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleSaveLesson}
                            disabled={saving}
                            className="w-full py-3 px-4 rounded-lg text-white font-semibold bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <AiOutlineLoading className="animate-spin w-5 h-5" />
                                    Saving...
                                </>
                            ) : (
                                'Save & Start Quiz'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiMCQgeneration;
