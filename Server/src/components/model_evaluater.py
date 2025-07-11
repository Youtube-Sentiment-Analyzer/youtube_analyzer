from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import classification_report, confusion_matrix
import torch
import numpy as np
from data_ingestion import DataIngestion
from data_transformation import DataTransformation

class ModelEvaluator:
    def __init__(self, model_paths, label_names=['negative', 'neutral', 'positive']):
        """
        model_paths: list of Hugging Face subfolder paths
                     (e.g., 'dhruv123/repo/results/checkpoint-1036', ...)
        label_names: ordered list of class names used in the model
        """
        self.label_names = label_names
        self.models = []
        self.tokenizers = []

        for path in model_paths:
            tokenizer = AutoTokenizer.from_pretrained(path)
            model = AutoModelForSequenceClassification.from_pretrained(path)
            model.eval()
            self.models.append(model)
            self.tokenizers.append(tokenizer)

    def predict(self, texts):
        predictions = []

        for tokenizer, model in zip(self.tokenizers, self.models):
            inputs = tokenizer(texts, return_tensors="pt", padding=True, truncation=True)
            with torch.no_grad():
                logits = model(**inputs).logits
                preds = torch.argmax(logits, dim=1).cpu().numpy()
                predictions.append(preds)

        predictions = np.array(predictions)  # Shape: (n_models, n_samples)
        final_preds = []

        for i in range(predictions.shape[1]):
            votes = predictions[:, i]
            final = np.bincount(votes).argmax()
            final_preds.append(final)

        return np.array(final_preds)

    def evaluate(self, df, text_column='cleaned_text', label_column='label'):
        label_map = {label: idx for idx, label in enumerate(self.label_names)}
        y_true = df[label_column].map(label_map).values
        y_pred = self.predict(df[text_column].tolist())

        print("📊 Classification Report:")
        print(classification_report(y_true, y_pred, target_names=self.label_names))

        print("\n🧩 Confusion Matrix:")
        print(confusion_matrix(y_true, y_pred))

        return y_true, y_pred

if(__name__ == '__main__'):
    # Fetch comments
    ingestor = DataIngestion()
    df = ingestor.get_video_comments('OmtjAb0Dwsk', max_comments=10)  # Replace with actual video ID
    df_cleaned = df[['CommentText']].copy()
    transformer = DataTransformation()
    df_cleaned['cleaned_text'] = df_cleaned['CommentText'].apply(transformer.clean_comment)
    print(df_cleaned.head())

    model_paths = [
        "Basavians/youtube-comment-sentiment-1",
        "Basavians/youtube-comment-sentiment-2",
        "Basavians/youtube-comment-sentiment-3"
    ]
    

    evaluator = ModelEvaluator(model_paths)
    evaluator.evaluate(df_cleaned)
