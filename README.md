# YouTube Sentiment Analyzer

A **Chrome extension** powered by a fine-tuned ensemble BERT model deployed on Hugging Face, designed to analyze the sentiment of YouTube comments in real-time. The system provides sentiment classification (neutral, positive, negative) and a summary of the comment section using advanced NLP techniques and APIs.

## Architecture

<img width="2456" height="1628" alt="Untitled-2025-07-09-1953" src="https://github.com/user-attachments/assets/3f2bb6a5-fc15-49d5-adcf-a57ebaa109ba" />


## Table of Contents

- [Project Overview](#project-overview)
- [Dataset \& Data Preparation](#dataset--data-preparation)
- [Modeling](#modeling)
- [Deployment \& Hugging Face Integration](#deployment--hugging-face-integration)
- [Backend Architecture](#backend-architecture)
- [Frontend \& Chrome Extension](#frontend--chrome-extension)
- [Additional Features](#additional-features)
- [Technologies Used](#technologies-used)
- [How to Use](#how-to-use)


## Project Overview

This project builds a **YouTube Sentiment Analyzer** that works as a Chrome extension. It leverages a fine-tuned ensemble of BERT models deployed on the cloud to analyze the sentiment of YouTube comments. The system fetches comments dynamically from YouTube videos, cleans and processes the data, and returns sentiment results via an API integrated with a user-friendly frontend.

## Dataset \& Data Preparation

- **Dataset Source:** Kaggle dataset containing YouTube comments labeled with sentiments: neutral, positive, negative.
- **Exploratory Data Analysis (EDA):**
    - Checked for null values and data distribution.
    - Analyzed mean values and overall data quality.
- **Data Cleaning:**
    - Removed emojis, extra spaces, adder rates (@ mentions), and special characters.
    - Normalized whitespace and converted text to lowercase.
- **Label Encoding:**
    - Converted sentiment labels (neutral, positive, negative) to numeric values (0, 1, 2).
- **Tools Used:** Python libraries including `re` for regex, `emoji` for emoji removal.


## Modeling

- **Models Used:**
    - Hugging Face BERT
    - BERT Uncased
    - Additional BERT variant (three models in total)
- **Training:**
    - Fine-tuned each model on the cleaned dataset with multiple iterations.
- **Ensemble Technique:**
    - Applied **soft voting** to combine predictions from the three models, improving overall accuracy and robustness.
- **Model Upload:**
    - Zipped and unzipped model files for upload.
    - Uploaded three separate models to Hugging Face community.


## Deployment \& Hugging Face Integration

- **Hugging Face Space:**
    - Created a Gradio app that implements the soft voting ensemble for real-time sentiment analysis.
    - The app accepts comments as input and outputs sentiment predictions.
- **API Availability:**
    - The deployed Hugging Face space exposes an API for external use.
- **Benefits:**
    - Cloud availability enables seamless integration with backend services.


## Backend Architecture

- **Data Ingestion:**
    - Uses Google API Client Discovery and YouTube Data API v3 to fetch:
        - Comment ID
        - Video ID
        - Comment text
        - Author
        - Publish date
        - Like count
- **Data Transformation:**
    - Cleans fetched comments by removing emojis, mentions, URLs, alphanumeric noise, and normalizing whitespace.
- **Model Evaluation:**
    - Uses Gradio Client API to send cleaned data to the Hugging Face model and receive sentiment predictions.
- **API Service:**
    - Flask app (`app.py`) exposes endpoints to the frontend for processing YouTube video IDs and returning sentiment analysis results.


## Frontend \& Chrome Extension

- **Frontend Stack:**
    - HTML, JavaScript (including `script.js`), and CSS for a polished UI.
- **Chrome Extension:**
    - Automatically fetches the YouTube video URL when activated.
    - Sends video ID to backend API on "Analyze Now" button click.
- **User Experience:**
    - Displays sentiment results in an intuitive interface mapped to backend responses.


## Additional Features

- **Comment Section Summarization:**
    - Fetches all comments and sends them to an external API (e.g., OpenAI or DeepSeek) for generating a summary of the comment section.
    - Displays the summary alongside sentiment analysis.

---

## Technologies Used

| Component | Technology/Library |
| :-- | :-- |
| Data Cleaning | Python (`re`, `emoji`) |
| Modeling | Hugging Face Transformers (BERT, BERT Uncased) |
| Ensemble | Soft Voting |
| Deployment | Hugging Face Spaces, Gradio |
| Backend API | Flask, Google API Client, YouTube API v3 |
| Frontend | HTML, JavaScript, CSS |
| Chrome Extension | JavaScript, Chrome APIs |

## How to Use

1. **Install Chrome Extension:** Add the YouTube Sentiment Analyzer extension to your Chrome browser.
2. **Navigate to a YouTube Video:** The extension automatically detects the video URL.
3. **Click "Analyze Now":** Sends the video ID to the backend API.
4. **View Results:** Sentiment analysis of comments (neutral, positive, negative) is displayed.
5. **Optional Summary:** View the summarized comment section generated by an external API.

This project effectively combines NLP modeling, cloud deployment, API integration, and frontend development to deliver a seamless YouTube sentiment analysis experience.
