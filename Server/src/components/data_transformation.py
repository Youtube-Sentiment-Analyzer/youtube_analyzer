import re
import emoji
import pandas as pd
from data_ingestion import DataIngestion
class DataTransformation:
    def __init__(self):
        pass

    def clean_comment(self, text):
        if not isinstance(text, str):
            return ""

        # Remove emojis
        text = emoji.replace_emoji(text, replace='')

        # Remove @mentions
        text = re.sub(r'@\w+', '', text)

        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)

        # Remove all non-alphanumeric characters
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)

        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        # Convert to lowercase
        return text.lower()


# Apply transformation
if(__name__ == '__main__'):
    # Fetch comments
    ingestor = DataIngestion()
    df = ingestor.get_video_comments('OmtjAb0Dwsk', max_comments=10)  # Replace with actual video ID
    df_cleaned = df[['CommentText']].copy()
    transformer = DataTransformation()
    df_cleaned['cleaned_text'] = df_cleaned['CommentText'].apply(transformer.clean_comment)
    print(df_cleaned.head())


