# Tik-Tik Quiz App

![Tik-Tik Logo](/client/public/SakuraStudyLogo.png 'Tik-Tik Logo')

## Description

Tik-Tik is a modern, generic quiz application built with the MERN stack (MongoDB, Express.js, React, Node.js) and enhanced with Python-based AI capabilities. Ir has been transformed into a dynamic platform where users can take quizzes on various subjects or generate their own quizzes from PDF documents using AI.

Key features include a timed quiz mode with unique questions, a practice mode for lessons, and an AI-powered quiz generator that creates multiple-choice questions from uploaded lecture notes or textbooks.

Teachers can also add questions from the teacher portal, assign lessons, and view student metrics.

## Links to Tik-Tik
**Student Portal: https://tik-tik-quiz.netlify.app/lessons** <<======================================


<img width="1905" height="957" alt="image" src="https://github.com/user-attachments/assets/175acb6e-c29c-47f9-adde-40488186b184" />

**Teacher Portal: https://teacher-launch.vercel.app/**  <<======================================


<img width="1919" height="947" alt="image" src="https://github.com/user-attachments/assets/bb3d62d7-ef2b-482c-aebb-132aaebcc6c7" />


## Table of Contents

- [Installation](#installation)
- [Docker Deployment](#docker-deployment)
- [Features](#features)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Manual Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/pritomshad/web-tech-team-egg-toast.git
    cd web-tech-team-egg-toast
    ```

2.  **Install Dependencies:**
    *   **Server (Node.js):**
        ```bash
        cd server
        npm install
        ```
    *   **Client (React):**
        ```bash
        cd ../client
        npm install
        ```
    *   **AI Server (Python):**
        ```bash
        cd ../ai-api-server
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        ```

3.  **Environment Variables:**
    Create a `.env` file in the `server` directory with the following:
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_google_gemini_api_key
    PERPLEXITY_API_KEY=your_perplexity_api_key
    ```

4.  **Run the Application:**
    *   **Server:** `cd server && npm start` (Runs on port 3001)
    *   **AI Server:** `cd ai-api-server && uvicorn main:app --reload` (Runs on port 8000)
    *   **Client:** `cd client && npm run dev` (Runs on port 5173)

## Docker Deployment

The application is fully dockerized for easy deployment.

1.  **Build the Image:**
    ```bash
    make build
    ```
    Or manually: `docker compose build`

2.  **Run the Container:**
    ```bash
    make up
    ```
    Or manually: `docker compose up`

    The application will be accessible at `http://localhost:3001`.

3.  **Push to Docker Hub:**
    ```bash
    make push
    ```
    *Note: Ensure you are logged in with `docker login` first.*

## Features

-   **AI Quiz Generation**: Upload a PDF document, and our AI (powered by Perplexity and Gemini) will generate a 10-question multiple-choice quiz for you.
-   **Timed Quizzes**: Challenge yourself with timed quizzes where questions are unique and do not repeat.
-   **Subject & Lesson Management**: Organized structure for subjects and lessons, fetched dynamically from the database.
-   **Leaderboards**: Compete with other users and track your progress.
-   **Dark Mode**: Sleek UI with built-in dark mode support.
-   **Responsive Design**: Works seamlessly on desktops, tablets, and mobile devices.

## Usage

1.  **Sign Up/Login**: Create an account to track your progress.
2.  **Take a Quiz**:
    *   Go to **Timed Quiz** to test your knowledge under pressure.
    *   Go to **Lessons** to practice specific topics at your own pace.
3.  **Generate AI Quiz**:
    *   Navigate to **AI Quiz**.
    *   Upload a PDF file (e.g., lecture slides, textbook chapter).
    *   Wait for the AI to generate questions.
    *   Save the quiz and start practicing!

## Technologies Used

### Frontend
-   [React](https://react.dev/)
-   [Vite](https://vitejs.dev/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Redux Toolkit](https://redux-toolkit.js.org/)
-   [Framer Motion](https://www.framer.com/motion/)

### Backend
-   [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
-   [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)
-   [GraphQL](https://graphql.org/) & [Apollo Server](https://www.apollographql.com/)
-   [FastAPI](https://fastapi.tiangolo.com/) (Python AI Server)

### AI & Tools
-   [Google Gemini API](https://ai.google.dev/)
-   [Perplexity API](https://docs.perplexity.ai/)

### Deployment
-   [Docker](https://www.docker.com/)
-   [Render.com](https://render.com/)
-   [Vercel](https://vercel.com/)
-   [Netlify](https://www.netlify.com/)

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
