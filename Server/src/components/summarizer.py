import google.generativeai as genai
import os 
from dotenv import load_dotenv
load_dotenv()
# STEP 1: Configure Gemini
def configure_gemini(api_key: str):
    genai.configure(api_key=api_key)

# STEP 2: Build Prompt (only comment text is used)
def build_prompt_from_comments(comments_data, max_comments=30):
    comments = sorted(comments_data, key=lambda x: x['like_count'], reverse=True)[:max_comments]
    comment_texts = [f"- {c['text'].strip().replace('\n', ' ')[:300]}" for c in comments]

    prompt = (
        "You are a helpful assistant that summarizes YouTube comment sections.\n"
        "From the comments below:\n"
        "- Write a 4-line summary of the viewer sentiment and feedback.\n"
        "- Then give exactly 3 relevant keywords that reflect the overall comment themes.\n\n"
        "Format:\n"
        "Summary:\n"
        "[line 1]\n[line 2]\n[line 3]\n[line 4]\n\n"
        "Keywords: [keyword1], [keyword2], [keyword3]\n\n"
        "Comments:\n"
        + "\n".join(comment_texts)
    )

    return prompt

# STEP 3: Generate and parse output
def summarize_and_extract_keywords(comments_data):
    model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
    prompt = build_prompt_from_comments(comments_data)
    response = model.generate_content(prompt)

    # Parse the response text
    text = response.text.strip()
    
    # Basic parsing logic
    summary = ""
    keywords = []
    if "Summary:" in text and "Keywords:" in text:
        parts = text.split("Keywords:")
        summary_part = parts[0].replace("Summary:", "").strip()
        keywords_part = parts[1].strip()
        summary = summary_part
        keywords = [k.strip() for k in keywords_part.split(",")][:3]
    else:
        summary = text  # fallback if format deviates

    return summary, keywords

if __name__ == "__main__":
    # Step 1: Configure Gemini
    configure_gemini(os.getenv("GOOGLE_API_KEY"))
    
    # 2. Get summary and keywords
    summary, keywords = summarize_and_extract_keywords(comments_data)

    # 3. Display results
    print("Summary:\n", summary)
    print("Keywords:", keywords)
