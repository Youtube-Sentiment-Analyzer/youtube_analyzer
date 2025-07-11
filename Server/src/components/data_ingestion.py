import os
import pandas as pd
from googleapiclient.discovery import build
from dotenv import load_dotenv

class DataIngestion:
    def __init__(self, api_key=None):
        # Load from .env if not passed explicitly
        load_dotenv()
        self.api_key = api_key or os.getenv('YOUTUBE_API_KEY')
        self.api_service_name = 'youtube'
        self.api_version = 'v3'
        
        if not self.api_key:
            raise ValueError("API key is missing. Set YOUTUBE_API_KEY in .env or pass to constructor.")
        
        self.youtube = build(
            self.api_service_name,
            self.api_version,
            developerKey=self.api_key,
            static_discovery=False
        )

    def get_video_comments(self, video_id: str, max_comments: int = 100) -> pd.DataFrame:
        comments = []
        next_page_token = None

        while len(comments) < max_comments:
            request = self.youtube.commentThreads().list(
                part='snippet',
                videoId=video_id,
                maxResults=100,
                textFormat='plainText',
                pageToken=next_page_token
            )
            response = request.execute()

            for item in response.get('items', []):
                snippet = item['snippet']['topLevelComment']['snippet']
                comments.append({
                    'CommentID': item['id'],
                    'VideoID': video_id,
                    'CommentText': snippet['textDisplay'],
                    'Author': snippet.get('authorDisplayName'),
                    'PublishedAt': snippet['publishedAt'],
                    'LikeCount': snippet['likeCount']
                })

                if len(comments) >= max_comments:
                    break

            next_page_token = response.get('nextPageToken')
            if not next_page_token:
                break

        return pd.DataFrame(comments)


# ▶️ Example usage
if __name__ == '__main__':
    video_id = 'OmtjAb0Dwsk'  # Replace with your actual video ID

    ingestor = DataIngestion()
    df = ingestor.get_video_comments(video_id, max_comments=500)
    print(df.head())
