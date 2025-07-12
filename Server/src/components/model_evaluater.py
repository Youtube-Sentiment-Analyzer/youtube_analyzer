import numpy as np
import pandas as pd
from gradio_client import Client  # type: ignore
from data_ingestion import DataIngestion
from data_transformation import DataTransformation

class ModelEvaluator:
    def __init__(self):
        """
        Initializes the ModelEvaluator with a pre-trained sentiment analysis model
        hosted on a Hugging Face Gradio Space.
        """
        self.client = Client("Basavians/Sentiment_Analyzer")

    def get_sentiments(self, comment_texts):
        results = []
        for text in comment_texts:
            try:
                api_output = self.client.predict(
                    text=text,
                    api_name="/predict"
                )

                # The output is a tuple: (summary_output, detailed_output)
                detailed_output = api_output[1]  # Use index 1 for detailed confidences
                label = detailed_output.get('label')
                confidences = detailed_output.get('confidences', [])

                # Create a dictionary to store the confidence scores by label
                confidence_dict = {
                    item['label']: item['confidence'] for item in confidences
                }

                results.append({
                    'sentiment': label,
                    'neutral_score': confidence_dict.get('neutral', None),
                    'positive_score': confidence_dict.get('positive', None),
                    'negative_score': confidence_dict.get('negative', None)
                })

            except Exception as e:
                print(f"Error processing comment: {text} -> {e}")
                results.append({
                    'sentiment': 'unknown',
                    'neutral_score': None,
                    'positive_score': None,
                    'negative_score': None
                })

        return results


if __name__ == '__main__':
    # Fetch comments
    ingestor = DataIngestion()
    df = ingestor.get_video_comments('OmtjAb0Dwsk', max_comments=10)

    # Clean the comments directly in df
    transformer = DataTransformation()
    df['cleaned_text'] = df['CommentText'].apply(transformer.clean_comment)

    # Predict sentiments
    evaluator = ModelEvaluator()
    sentiments = evaluator.get_sentiments(df['cleaned_text'].tolist())

    # Merge sentiment predictions into the original df
    sentiment_df = pd.DataFrame(sentiments)
    df = pd.concat([df.reset_index(drop=True), sentiment_df], axis=1)

    # Print the final DataFrame with all useful columns
    print(df[['CommentID', 'CommentText', 'cleaned_text', 'PublishedAt', 'LikeCount',
              'sentiment', 'neutral_score', 'positive_score', 'negative_score']])
    # # Optionally save it
    # df.to_csv("comments_with_sentiment.csv", index=False)
