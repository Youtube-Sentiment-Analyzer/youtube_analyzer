from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
import sys
import json
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
load_dotenv()

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'components'))

from data_ingestion import DataIngestion
from data_transformation import DataTransformation
from model_evaluater import ModelEvaluator
from summarizer import configure_gemini, summarize_and_extract_keywords, build_prompt_from_comments

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize components
try:
    data_ingestor = DataIngestion()
    data_transformer = DataTransformation()
    model_evaluator = ModelEvaluator()
except Exception as e:
    print(f"Warning: Could not initialize components: {e}")
    data_ingestor = None
    data_transformer = None
    model_evaluator = None



@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    """Analyze YouTube video comments for sentiment"""
    try:
        data = request.get_json()
        video_id = data.get('video_id')
        max_comments = 30
        
        if not video_id:
            return jsonify({'error': 'Video ID is required'}), 400
        
        # Step 1: Fetch comments
        print(f"Fetching comments for video: {video_id}")
        df = data_ingestor.get_video_comments(video_id, max_comments)
        
        if df.empty:
            return jsonify({'error': 'No comments found for this video'}), 404
        
        # Step 2: Clean comments
        print("Cleaning comments...")
        df['cleaned_text'] = df['CommentText'].apply(data_transformer.clean_comment)
        
        # Step 3: Analyze sentiments
        print("Analyzing sentiments...")
        sentiments = model_evaluator.get_sentiments(df['cleaned_text'].tolist())
        sentiment_df = pd.DataFrame(sentiments)
        
        # Step 4: Combine results
        df = pd.concat([df.reset_index(drop=True), sentiment_df], axis=1)
        
        # Step 5: Calculate statistics
        total_comments = len(df)
        sentiment_counts = df['sentiment'].value_counts().to_dict()
        
        # Calculate percentages
        sentiment_percentages = {}
        for sentiment, count in sentiment_counts.items():
            sentiment_percentages[sentiment] = round((count / total_comments) * 100, 1)
        
        # Prepare response data
        comments_data = []
        for _, row in df.iterrows():
            comments_data.append({
                'id': row['CommentID'],
                'text': row['CommentText'],
                'sentiment': row['sentiment'],
                'author': row['Author'],
                'published_at': row['PublishedAt'],
                'like_count': row['LikeCount'],
                'positive_score': row['positive_score'] if pd.notna(row['positive_score']) else None,
                'negative_score': row['negative_score'] if pd.notna(row['negative_score']) else None,
                'neutral_score': row['neutral_score'] if pd.notna(row['neutral_score']) else None
            })
        
        response_data = {
            'video_id': video_id,
            'total_comments': total_comments,
            'sentiment_counts': sentiment_counts,
            'sentiment_percentages': sentiment_percentages,
            'comments': comments_data,
            'analyzed_at': datetime.now().isoformat()
        }
        
        # Step 1: Configure Gemini
        configure_gemini(os.getenv("GOOGLE_API_KEY"))
        
        # 2. Get summary and keywords
        summary, keywords = summarize_and_extract_keywords(comments_data)
        
        # Add summary and keywords to response data
        response_data['summary'] = summary
        response_data['keywords'] = keywords
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error analyzing video: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'components': {
            'data_ingestion': data_ingestor is not None,
            'data_transformation': data_transformer is not None,
            'model_evaluator': model_evaluator is not None
        },
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/sample-data', methods=['GET'])
def get_sample_data():
    """Return sample data for testing the frontend"""
    sample_data = {
        'video_id': 'sample_video',
        'total_comments': 247,
        'sentiment_counts': {
            'positive': 156,
            'negative': 67,
            'neutral': 24
        },
        'sentiment_percentages': {
            'positive': 63.2,
            'negative': 27.1,
            'neutral': 9.7
        },
        'comments': [
            {
                'id': '1',
                'text': 'This is absolutely amazing! Love the content 🔥',
                'sentiment': 'positive',
                'author': 'User1',
                'published_at': '2024-01-15T10:30:00Z',
                'like_count': 15,
                'positive_score': 0.85,
                'negative_score': 0.05,
                'neutral_score': 0.10
            },
            {
                'id': '2',
                'text': 'Terrible video, waste of my time',
                'sentiment': 'negative',
                'author': 'User2',
                'published_at': '2024-01-15T10:25:00Z',
                'like_count': 2,
                'positive_score': 0.10,
                'negative_score': 0.80,
                'neutral_score': 0.10
            }
        ],
        'analyzed_at': datetime.now().isoformat()
    }
    return jsonify(sample_data)

if __name__ == '__main__':
    print("Starting YouTube Sentiment Analyzer API server...")
    print("Backend API available at: http://localhost:5000")
    print("API endpoints:")
    print("  - POST /api/analyze - Analyze video comments")
    print("  - GET /api/health - Health check")
    print("  - GET /api/sample-data - Get sample data")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
