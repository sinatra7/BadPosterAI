# Posture Vision AI

## Description

Posture Vision is an AI-powered, full-stack web application designed to help you improve your posture. Using your device's webcam, the application provides real-time analysis and personalized feedback to help you correct common posture issues, whether you're working at your desk, exercising, or just want to be more mindful of your body mechanics.

## Demo
![Untitled Project](https://github.com/user-attachments/assets/e8454544-1d8b-44be-a863-137b9371b646)

## Features

*   **Live Webcam Analysis:** Get instant feedback on your posture through a live video stream.
*   **AI-Powered Detection:** Utilizes a powerful AI model to accurately identify common posture issues such as slouching, hunched back, and forward neck tilt.
*   **AI Coach:** Receives personalized, actionable recommendations from an AI coach to help you correct detected issues.
*   **Video Upload:** Upload a pre-recorded video file for a detailed posture analysis.
*   **Modern & Responsive UI:** A clean, intuitive interface built with modern web technologies for a seamless experience on any device.

## Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **AI/Generative:** [Google Gemini (via Genkit)](https://firebase.google.com/docs/genkit)
*   **Hosting:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or newer recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/posture-vision.git
    cd posture-vision
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your Google AI API key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## How It Works

The application captures a frame from the user's webcam or uploaded video and sends it to a Genkit flow powered by the Gemini AI model. The model analyzes the image to detect predefined posture issues. The results are then displayed to the user, and a second AI flow generates a concise, helpful tip to address the specific problems found.

## Troubleshooting

### Inaccurate Analysis Results

*   **Issue:** Initially, the posture analysis feature returned random or incorrect results.
*   **Resolution:** The initial placeholder logic was replaced with a dedicated Genkit AI flow (`detect-posture-issues.ts`). This flow now captures a frame from the video stream and sends it to the Gemini model for a genuine, accurate analysis of posture, resolving the issue of incorrect detections.

## License

Distributed under the MIT License. See `LICENSE` for more information.
