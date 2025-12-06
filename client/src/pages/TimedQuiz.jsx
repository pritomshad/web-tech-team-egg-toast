import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAudio } from 'react-use';
import Auth from '../utils/auth';
import { HiX, HiChevronLeft } from 'react-icons/hi';
import { AiOutlineLoading } from 'react-icons/ai';

import { FeedbackMessage, Button } from '../components';
import CompleteScreen from './CompleteScreen';

import { useQuery, useMutation } from '@apollo/client';
import { UPDATE_EXPERIENCE } from '../utils/mutations';
import { QUERY_ME, QUERY_PERSONAL_QUIZZES, QUERY_SUBJECTS, QUERY_LESSONS } from '../utils/queries';

import correctSound from '../assets/correct.wav';
import incorrectSound from '../assets/incorrect.wav';

import { UniqueQuiz } from '../utils/quizGenerator';

const TimedQuiz = () => {
    if (!Auth.loggedIn()) return <Navigate to="/login" />;

    const [mode, setMode] = useState(null); // 'subjects' or 'ai'
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [quiz, setQuiz] = useState(null);

    // Fetch AI Quizzes
    const { data: aiData, loading: aiLoading } = useQuery(QUERY_PERSONAL_QUIZZES);
    const aiQuizzes = aiData?.personalQuizzes || [];

    // Fetch Subjects
    const { data: subjectsData, loading: subjectsLoading } = useQuery(QUERY_SUBJECTS);
    const subjects = subjectsData?.subjects || [];

    // Fetch Lessons for selected subject
    const { data: lessonsData, loading: lessonsLoading } = useQuery(QUERY_LESSONS, {
        variables: { subjectId: selectedSubject?.subjectId },
        skip: !selectedSubject,
    });
    const lessons = lessonsData?.lessons || [];

    const handleStartQuiz = (questions) => {
        const newQuiz = new UniqueQuiz(questions);
        setQuiz(newQuiz);
    };

    if (quiz) {
        return (
            <TimedQuizRunner
                quiz={quiz}
                onExit={() => {
                    setQuiz(null);
                }}
            />
        );
    }

    // Selection UI
    return (
        <div className="w-full min-h-screen p-4 flex flex-col items-center gap-6">
            <div className="w-full max-w-4xl flex items-center relative justify-center">
                {mode && (
                    <button onClick={() => {
                        if (selectedSubject) setSelectedSubject(null);
                        else setMode(null);
                    }} className="absolute left-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                        <HiChevronLeft className="w-6 h-6" />
                    </button>
                )}
                <h1 className="text-3xl font-bold text-center">
                    {!mode ? 'Timed Quiz Challenge' :
                        mode === 'ai' ? 'Select AI Quiz' :
                            selectedSubject ? `${selectedSubject.title} Lessons` : 'Select Subject'}
                </h1>
            </div>

            {!mode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
                    <Button
                        type="button"
                        btnStyle="bg-primary text-white p-8 rounded-xl text-2xl hover:bg-primary-tint shadow-lg flex flex-col items-center gap-2"
                        onClick={() => setMode('subjects')}
                        title="Subject Quizzes"
                    />
                    <Button
                        type="button"
                        btnStyle="bg-purple-600 text-white p-8 rounded-xl text-2xl hover:bg-purple-500 shadow-lg flex flex-col items-center gap-2"
                        onClick={() => setMode('ai')}
                        title="My AI Quizzes"
                    />
                </div>
            )}

            {mode === 'subjects' && !selectedSubject && (
                subjectsLoading ? <AiOutlineLoading className="animate-spin h-10 w-10" /> :
                    subjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                            {subjects.map(subject => (
                                <button
                                    key={subject._id}
                                    onClick={() => setSelectedSubject(subject)}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md border border-transparent hover:border-primary text-left flex flex-col gap-2 transition-all"
                                >
                                    <h3 className="font-bold text-xl">{subject.title}</h3>
                                    <span className="text-sm text-gray-500">Class {subject.classLevel}</span>
                                </button>
                            ))}
                        </div>
                    ) : <p>No subjects found.</p>
            )}

            {mode === 'subjects' && selectedSubject && (
                lessonsLoading ? <AiOutlineLoading className="animate-spin h-10 w-10" /> :
                    lessons.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                            {lessons.map(lesson => (
                                <button
                                    key={lesson._id}
                                    onClick={() => handleStartQuiz(lesson.questions)}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md border border-transparent hover:border-primary text-left flex flex-col gap-2 transition-all"
                                >
                                    <h3 className="font-bold text-xl">{lesson.title}</h3>
                                    <span className="text-sm text-gray-500">{lesson.questions.length} Questions</span>
                                </button>
                            ))}
                        </div>
                    ) : <p>No lessons found for this subject.</p>
            )}

            {mode === 'ai' && (
                aiLoading ? <AiOutlineLoading className="animate-spin h-10 w-10" /> :
                    aiQuizzes.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
                            {aiQuizzes.map(q => (
                                <button
                                    key={q._id}
                                    onClick={() => handleStartQuiz(q.questions)}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-md border border-transparent hover:border-primary text-left flex flex-col gap-2 transition-all"
                                >
                                    <h3 className="font-bold text-xl">{q.title}</h3>
                                    <span className="text-sm text-gray-500">{q.questions.length} Questions</span>
                                    <span className="text-xs text-gray-400">Created: {new Date(parseInt(q.createdAt)).toLocaleDateString()}</span>
                                </button>
                            ))}
                        </div>
                    ) : <p>No AI quizzes found.</p>
            )}
        </div>
    );
};

const TimedQuizRunner = ({ quiz, onExit }) => {
    const [correctAudio, _c, correctControls] = useAudio({ src: correctSound });
    const [incorrectAudio, _i, incorrectControls] = useAudio({ src: incorrectSound });

    const [selectedOption, setSelectedOption] = useState(null);
    const [questionState, setQuestionState] = useState(null);
    const [question, setQuestion] = useState(quiz.generateQuestion());
    const [quizComplete, setQuizComplete] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !quizComplete) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !quizComplete) {
            quiz.endQuiz();
            setQuizComplete(true);
            setQuestionState(null);
        }
    }, [timeLeft, quizComplete, quiz]);

    // check answer and update progress
    const checkAnswer = (answer) => {
        if (answer === question.answer) {
            correctControls.play();
            setQuestionState('correct');
            quiz.incrementNumCorrect();
            quiz.incrementProgress();
        } else {
            incorrectControls.play();
            setQuestionState('incorrect');
            quiz.incrementNumIncorrect();
            // For UniqueQuiz, decrementProgress does nothing, which is correct for "questions left" logic
            // But we still want to move forward, so we need to call incrementProgress eventually
            // Wait, in UniqueQuiz, incrementProgress moves to next question.
            // So if incorrect, we ALSO need to move to next question?
            // "Each question should only appear once."
            // So yes, right or wrong, we move to next.
            // But `checkAnswer` sets state to 'incorrect', and then user clicks 'Next'.
            // The 'Next' button calls `cycleNextQuestion`.
            // `cycleNextQuestion` calls `quiz.generateQuestion()`.
            // `quiz.generateQuestion` uses `currentIndex`.
            // `incrementProgress` increments `currentIndex`.
            // So we should ONLY call `incrementProgress` when moving to next question?
            // OR does `incrementProgress` just update the bar?
            // In `UniqueQuiz`, `incrementProgress` increments `currentIndex`.
            // So if we call it in `checkAnswer`, we are moving the index BEFORE the user clicks Next.
            // This might mean `generateQuestion` will return the NEXT question when called again?
            // Let's check `cycleNextQuestion`:
            // if (quiz.getProgress() < 100) { setQuestion(quiz.generateQuestion()); ... }

            // If `incrementProgress` is called in `checkAnswer` (correct case):
            // currentIndex increases.
            // Then user clicks Next -> `cycleNextQuestion` -> `generateQuestion` (uses NEW currentIndex).
            // This seems correct for "Correct" answer moving to next.

            // If incorrect:
            // We currently call `decrementProgress`. In `UniqueQuiz` this does nothing.
            // So `currentIndex` stays same.
            // User clicks Next -> `cycleNextQuestion` -> `generateQuestion` (uses SAME currentIndex).
            // This would repeat the question!
            // We want to move to next question even if wrong.
            // So we should call `incrementProgress` for incorrect too?
            // Or `cycleNextQuestion` should handle the index increment?

            // In the original logic:
            // Correct -> incrementProgress (moves bar up)
            // Incorrect -> decrementProgress (moves bar down)
            // Next -> generateQuestion (randomly picks new one)

            // In UniqueQuiz logic:
            // We want linear progression.
            // So `incrementProgress` should probably be called when we actually MOVE to next question?
            // OR `incrementProgress` just updates the "Questions Answered" stat.

            // Let's adjust `UniqueQuiz` to separate "answering" from "moving next"?
            // Or just simply:
            // Correct: incrementNumCorrect.
            // Incorrect: incrementNumIncorrect.
            // BOTH: should eventually trigger "Next Question".

            // If I change `checkAnswer` to NOT call `incrementProgress` for correct, 
            // but instead `cycleNextQuestion` calls it?
            // But `cycleNextQuestion` is called by the Next button.
            // The progress bar usually updates immediately upon answering.

            // If `incrementProgress` updates `currentIndex`, then calling it in `checkAnswer` means we are "done" with current question.
            // So for Incorrect, we SHOULD also call `incrementProgress` if we want to mark it as done.
            quiz.incrementProgress();
        }
    };

    const setChoiceStyle = (selectedOption) => {
        if (questionState && selectedOption === question.answer) {
            return 'correct-choice';
        } else if (questionState === 'incorrect') {
            return 'incorrect-choice';
        }
    };

    const cycleNextQuestion = () => {
        // Check if we are done based on progress (which reflects currentIndex)
        if (quiz.getProgress() < 100) {
            setQuestion(quiz.generateQuestion());
            setSelectedOption(null);
            setQuestionState(null);
        } else {
            const { xp } = quiz.getScoreAndXP();
            updateUserExperience(xp);
        }
    };

    const { data } = useQuery(QUERY_ME);
    const user = data?.me || {};
    const [updateExperience, { loading }] = useMutation(UPDATE_EXPERIENCE);

    const updateUserExperience = async (experience) => {
        let currentExperience = user.experience;
        currentExperience += experience;

        try {
            await updateExperience({
                variables: {
                    experience: currentExperience,
                },
            });
        } catch (error) {
            console.error(error);
        } finally {
            setQuizComplete(true);
            setQuestionState(null);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!questionState && (event.key === '1' || event.key === '2' || event.key === '3' || event.key === '4')) {
                setSelectedOption(question.choices[event.key - 1]);
            } else if (event.key === 'Enter') {
                if (quizComplete) {
                    onExit();
                } else if (!quizComplete && !questionState && selectedOption) {
                    checkAnswer(selectedOption);
                } else if (!quizComplete && questionState) {
                    cycleNextQuestion();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedOption, question, questionState, quizComplete]);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {correctAudio}
            {incorrectAudio}
            <div className="w-full h-screen max-h-screen p-4 py-6 md:p-0 flex flex-col">
                {!quizComplete && (
                    <div className="md:h-20">
                        <div className="w-full h-full max-w-5xl mx-auto md:pt-12 md:px-4 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={onExit}
                                className="hover:opacity-60 mr-4"
                            >
                                <HiX className="w-7 h-7" />
                            </button>

                            {/* Timer Display */}
                            <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-700 dark:text-gray-200'}`}>
                                Time Left: {formatTime(timeLeft)}
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-300 dark:bg-gray-700 h-4 w-1/3 rounded-2xl overflow-x-hidden ml-4">
                                <div
                                    className={`${quiz.getProgress() <= 0 ? 'opacity-0' : ''
                                        } custom-transition h-full px-2 pt-1 bg-gradient-to-b from-primary-tint to-red-800 rounded-2xl`}
                                    style={{ width: `${quiz.getProgress()}%` }}
                                >
                                    <div className="bg-white/30 h-1 rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!quizComplete && (
                    <div className="w-full h-full my-2 flex flex-col md:grid justify-center items-center md:content-center">
                        <div className="w-full max-w-2xl md:w-[600px] h-full md:min-h-[450px] quiz-main-container gap-2 md:gap-6">
                            <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
                                <span>{question.questionDirection}</span> <span>"{question.questionSubject}"</span>
                            </h1>
                            <div className="font-medium text-2xl sm:text-3xl md:text-4xl grid grid-cols-1 gap-2">
                                {question.choices.map((choice, index) => (
                                    <button
                                        key={`id-${choice}`}
                                        id={index + 1}
                                        type="button"
                                        className={`w-full h-full p-2 md:py-3 rounded-xl border-2 ${selectedOption === choice
                                            ? `selected-choice ${setChoiceStyle(selectedOption)}`
                                            : `border-gray-300 dark:border-gray-700 ${!questionState && 'hover:bg-gray-200 dark:hover:bg-slate-800'
                                            } ${questionState === 'incorrect' &&
                                            choice === question.answer &&
                                            'correct-choice dark:border-lime-900'
                                            }`
                                            }`}
                                        onClick={() => setSelectedOption(choice)}
                                        disabled={questionState}
                                    >
                                        <div className="flex flex-col grow w-full">
                                            <span className="inline-flex justify-center items-center grow">{choice}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {quizComplete && <CompleteScreen quiz={quiz} />}

                <div
                    className={`-mx-4 -mb-6 mt-4 max-md:pb-6 md:m-0 md:h-36 md:min-h-[144px] md:border-t-2 ${questionState === 'correct'
                        ? 'border-[#CEFEA8] bg-[#CEFEA8] dark:bg-slate-800 dark:border-gray-700'
                        : questionState === 'incorrect'
                            ? 'border-[#FED6DD] bg-[#FED6DD] dark:bg-slate-800 dark:border-gray-700'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                >
                    <div className="w-full h-full max-w-5xl mx-auto px-4 flex items-center">
                        {!quizComplete && (
                            <div className="w-full flex flex-col md:flex-row justify-between md:items-center">
                                {!questionState ? (
                                    <Button
                                        type="button"
                                        btnStyle="hidden md:flex justify-center items-center gap-2 text-sky-500 border-2 border-sky-500 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-800"
                                        onClick={() => checkAnswer('skip')}
                                        title="Skip"
                                    />
                                ) : (
                                    <FeedbackMessage
                                        questionState={questionState}
                                        answer={question.answer}
                                    />
                                )}

                                {!questionState ? (
                                    <Button
                                        type="button"
                                        btnStyle={`flex justify-center items-center gap-2
                   ${!selectedOption
                                                ? 'text-gray-500 bg-gray-300'
                                                : 'text-white dark:text-slate-800 bg-[#58CC02] dark:bg-lime-500 hover:bg-[#4CAD02] dark:hover:bg-lime-600'
                                            }
                      `}
                                        onClick={() => checkAnswer(selectedOption)}
                                        disabled={!selectedOption}
                                        title="Check"
                                    />
                                ) : (
                                    <Button
                                        type="button"
                                        btnStyle={`flex justify-center items-center gap-2 text-white dark:text-slate-800 ${questionState === 'correct'
                                            ? 'bg-[#58CC02] dark:bg-lime-500 hover:bg-[#4CAD02] dark:hover:bg-lime-600'
                                            : 'bg-red-600 dark:bg-red-400 hover:bg-red-700 dark:hover:bg-red-500'
                                            }`}
                                        onClick={() => cycleNextQuestion()}
                                        title={!loading && 'Next'}
                                        icon={
                                            loading && (
                                                <AiOutlineLoading className="text-white dark:text-slate-800 animate-spin h-6 w-6 mx-auto" />
                                            )
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {quizComplete && (
                            <div className="w-full flex justify-between gap-2">
                                <Button
                                    type="button"
                                    btnStyle="flex justify-center items-center gap-2 text-sky-500 border-2 border-sky-500 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-800"
                                    onClick={() => window.location.reload()}
                                    title="Try Again"
                                />
                                <Button
                                    type="button"
                                    btnStyle="flex justify-center items-center gap-2 text-white dark:text-slate-800 bg-[#58CC02] hover:bg-[#4CAD02]"
                                    onClick={onExit}
                                    title="Back to Selection"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TimedQuiz;
