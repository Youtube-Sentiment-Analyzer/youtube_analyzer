from gradio_client import Client

# Initialize the Hugging Face Gradio Space client
client = Client("Basavians/Sentiment_Analyzer")

# Call the /predict endpoint
result = client.predict(
    text="When is next video coming",  # replace with your test comment
    api_name="/predict"
)

# Output the results
print("Predicted Sentiment:", result[0])
print("Confidence Scores:", result[1])