// Made by Pritom (https://github.com/pritomshad)
/**
 * Represents a quiz generator with progress tracking and timing functionality.
 *
 * @class
 * @param {...Array} arrays - Arrays containing data for quiz generation.
 */
class QuizGenerator {
    constructor(...arrays) {
        this.selectedDataArray = this.combineAndFilterArrays(...arrays);
        this.progress = 0;
        this.numCorrect = 0;
        this.numIncorrect = 0;
        this.complete = false;
        this.startTime = new Date();
        this.endTime = null;
        this.elapsedTime = null;
    }

    /**
     * Retrieves the current progress of the quiz.
     *
     * @returns {number} - The current progress as an number from 0 to 100 with decimals.
     */
    getProgress() {
        return this.progress;
    }

    /**
     * Ends the quiz, setting completion status and calculating elapsed time.
     */
    endQuiz() {
        this.complete = true;
        this.endTime = new Date();
        // calculate elapsed time
        this.elapsedTime = (this.endTime - this.startTime) / 1000;
    }

    // combine selected data into one array and filter empty strings
    combineAndFilterArrays(...arrays) {
        const combinedArray = arrays.flat();
        // Filter logic might need adjustment if data structure changes, but for now generic check
        return combinedArray.filter((item) => item && item.question !== '');
    }

    /**
     * Generates an array of answer options for a quiz question.
     * The options include the correct answer and three additional random choices.
     *
     * @param {string} correctAnswer - The correct answer for the question.
     * @param {string} answerType - The type of answer.
     * @returns {Array} - A shuffled array containing the correct answer and three random choices.
     */
    generateAnswerOptions(correctAnswer, answerType) {
        // This method was heavily tied to Japanese data structure (romaji, readings, etc.)
        // For generic quizzes, we usually have options provided in the data.
        // If we need to generate options dynamically, we need a pool of wrong answers.
        // For now, I'll keep a simplified version or rely on data providing options.

        // add correct answer to array
        const choices = [correctAnswer];

        // while loop to generate 3 random choices, must not include the correct answer, duplicate choices, or null values
        while (choices.length < 4) {
            // choose random item from selected data array
            const randomItem = this.selectedDataArray[Math.floor(Math.random() * this.selectedDataArray.length)];
            let randomChoice = randomItem.answer; // Assuming 'answer' property exists

            // add choice to array if it is not null and not already in array
            if (randomChoice && !choices.includes(randomChoice)) {
                choices.push(randomChoice);
            }
        }

        // shuffle choices
        for (let i = choices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        return choices;
    }

    // increment progress and check if complete
    incrementProgress() {
        this.progress += 6.25; // 16 questions? Or should be dynamic based on total questions
        if (this.progress >= 100) {
            this.progress = 100;
            this.endQuiz();
        }
    }

    // decrement progress
    decrementProgress() {
        this.progress -= 3;
        if (this.progress < 0) {
            this.progress = 0;
        }
    }

    // increment numCorrect
    incrementNumCorrect() {
        this.numCorrect += 1;
    }

    // increment numIncorrect
    incrementNumIncorrect() {
        this.numIncorrect += 1;
    }

    /**
     * Calculates the quiz score and XP based on the number of correct and incorrect answers.
     *
     * @returns {Object} - An object containing the calculated score and XP.
     */
    getScoreAndXP() {
        const totalQuestions = this.numCorrect + this.numIncorrect;
        const percentage = totalQuestions === 0 ? 0 : Math.round((this.numCorrect / totalQuestions) * 100);

        let score = percentage;
        let xp = Math.round((percentage / 100) * 15);

        if (score === 100) {
            xp = 15;
        }

        return { score, xp };
    }

    /**
     * Formats the elapsed time into a string representation of minutes and seconds.
     *
     * @returns {string} - A formatted string representing the elapsed time as mm:ss (e.g., "01:23").
     */
    getTime() {
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = Math.floor(this.elapsedTime % 60);
        return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Represents a quiz generator for AI generated questions.
 *
 * @class
 * @extends QuizGenerator
 * @param {Array} questions - Array of questions generated by AI.
 */
class AiQuiz extends QuizGenerator {
    constructor(questions) {
        super([]);
        this.questions = questions;
        // Adjust progress increment based on number of questions
        this.progressIncrement = questions.length > 0 ? 100 / questions.length : 10;
    }

    incrementProgress() {
        this.progress += this.progressIncrement;
        if (this.progress >= 100 - 0.1) { // Tolerance for float errors
            this.progress = 100;
            this.endQuiz();
        }
    }

    generateQuestion() {
        const randomQuestion = this.questions[Math.floor(Math.random() * this.questions.length)];
        return {
            questionDirection: 'Select the correct answer for',
            questionSubject: randomQuestion.question,
            answer: randomQuestion.answer,
            choices: randomQuestion.options
        };
    }
}

/**
 * Represents a quiz generator that ensures unique questions (no repeats).
 *
 * @class
 * @extends QuizGenerator
 * @param {Array} questions - Array of questions.
 */
class UniqueQuiz extends QuizGenerator {
    constructor(questions) {
        super([]);
        this.questions = this.shuffleArray([...questions]); // Shuffle copy of questions
        this.currentIndex = 0;
        this.totalQuestions = this.questions.length;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    incrementProgress() {
        this.currentIndex++;
        this.progress = (this.currentIndex / this.totalQuestions) * 100;

        if (this.currentIndex >= this.totalQuestions) {
            this.progress = 100;
            this.endQuiz();
        }
    }

    decrementProgress() {
        // In unique quiz, we don't decrement progress on wrong answer, 
        // we just move to next question (or stay? usually move next in timed/unique flow).
        // But if we want to penalize, we can. 
        // However, the user asked for "progress bar should be how many questions left".
        // So progress should strictly track questions answered.
        // So we do NOTHING here or maybe just update stats.
        // But `checkAnswer` in TimedQuiz calls `decrementProgress` on incorrect.
        // We should override it to do nothing or handle it.
        // Actually, let's just make it do nothing to avoid moving bar backwards.
    }

    generateQuestion() {
        if (this.currentIndex >= this.totalQuestions) {
            return null; // Should be handled by endQuiz check
        }
        const currentQuestion = this.questions[this.currentIndex];
        return {
            questionDirection: 'Select the correct answer for',
            questionSubject: currentQuestion.question,
            answer: currentQuestion.answer,
            choices: currentQuestion.options
        };
    }
}

export { AiQuiz, UniqueQuiz };
