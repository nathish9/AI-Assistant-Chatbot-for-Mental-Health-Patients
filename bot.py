from flask import Flask, request, jsonify, render_template
import requests
import json
import re

app = Flask(__name__)

# Set your API key here
API_KEY = "AIzaSyCxEJSKDS4GZOQ2HTe7AazWbXpN8cEBwVc"  # Replace with your actual API key

# Function to count words in text
def count_words(text):
    return len(re.findall(r'\w+', text))

# Function to generate a response from the Google Gemini API
def generate_response(user_input):
    greetings = ["hi", "hello there", "howdy", "hey there", "hey", "hii", "howdy"]
    normalized_input = user_input.lower()
    
    if any(greeting in normalized_input for greeting in greetings):
        return "MHBot here! Hope you are doing well! How may I help you?"
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + API_KEY
    headers = {'Content-Type': 'application/json'}
    
    # Add limit instruction to prompt and configure maximum tokens
    data = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_input + " (Please limit your response to 75 words or less)"}]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 120  # Approximately 75 words
        }
    }
    
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
        response.raise_for_status()
        
        response_data = response.json()
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            generated_text = response_data['candidates'][0]['content']['parts'][0]['text']
            
            # Ensure the response is exactly 75 words or less
            words = re.findall(r'\w+', generated_text)
            if len(words) > 75:
                truncated_text = ' '.join(words[:75]) + "..."
                return format_response(truncated_text)
            
            formatted_text = format_response(generated_text)
            return formatted_text
        else:
            return "Error: Unexpected response format."
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error generating response: {e}")
        return f"Error: {e}"
    except Exception as e:
        app.logger.error(f"Unexpected error: {e}")
        return "Error: An unexpected error occurred."

# Function to format the response text for better readability
def format_response(text):
    lines = text.split('\n')
    formatted_lines = []
    for line in lines:
        line = line.strip()
        if line.startswith("*") or line.startswith("1.") or line.startswith("2.") or line.startswith("3.") or line.startswith("4.") or line.startswith("5."):
            formatted_lines.append("\n" + line)
        else:
            formatted_lines.append(line)
    return '\n'.join(formatted_lines)

@app.route('/')
def index():
    return render_template('botUI.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    response = generate_response(user_input)
    word_count = count_words(response)
    return jsonify({"response": response, "wordCount": word_count})

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
