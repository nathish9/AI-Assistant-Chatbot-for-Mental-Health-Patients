from flask import Flask, request, jsonify, render_template
import requests
import json

app = Flask(__name__)

# Set your API key here
API_KEY = "AIzaSyB8EhidgXUOdi9jLhkEV1LbSo6bA2fRQ_s"  # Replace with your actual API key

# Function to generate a response from the Google Gemini API
def generate_response(user_input):
    greetings = ["hi", "hello there", "howdy", "hey there", "hey", "hii", "howdy"]
    normalized_input = user_input.lower()

    if any(greeting in normalized_input for greeting in greetings):
        return "MHBot here! Hope you are doing well! How may I help you?"

    url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + API_KEY
    headers = {'Content-Type': 'application/json'}

    data = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_input}]
            }
        ]
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)  # Set a timeout to avoid hanging
        response.raise_for_status()  # Raise an exception for non-2xx status codes

        response_data = response.json()
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            generated_text = response_data['candidates'][0]['content']['parts'][0]['text']
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
        if line.startswith("*" or "1." or "2." or "3." or "4." or "5."):
            print("\n")
            print("\t")
            formatted_lines.append("\n" + line)
        else:
            print("\n")
            print("\t")
            formatted_lines.append(line)
        formatted_lines.append("\n\n\n")  # Add an extra newline for better spacing
    return '\n\n\n'.join(formatted_lines)

@app.route('/')
def index():
    return render_template('botUI.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    response = generate_response(user_input)
    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
