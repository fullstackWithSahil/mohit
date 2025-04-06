# server.py
from flask import Flask, request, jsonify
from youtube import get_video_data  # Ensure this is implemented or imported correctly
from reddit import get_reddit_posts
from facebook import get_facebook_ads
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

@app.route('/api/redditposts', methods=['POST'])
def fetch_reddit_posts():
    """
    Handle Reddit search requests by query and fetch posts with limited comments.
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400

    data = request.get_json()
    query = data.get("query")
    maxResults = int(data.get("maxResults"))
    if not query:
        return jsonify({"error": "Missing 'query' in JSON body"}), 400

    try:
        # Replace `get_reddit_posts` with the actual Reddit data-fetching function
        results = get_reddit_posts(query,maxResults)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/youtubevideos', methods=['POST'])
def youtube():
    """
    Handle YouTube search requests by query and fetch videos with limited comments.
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400
    
    data = request.get_json()
    query = data.get("query")
    maxResults = int(data.get("maxResults", 5))  # Default to 5 if not provided
    
    if not query:
        return jsonify({"error": "Missing 'query' in JSON body"}), 400
    
    try:
        result = get_video_data(query, maxResults)
        return jsonify(result)  # Return just the result, not result,maxResults
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/facebookads', methods=['POST'])
def fetch_youtube_videos():
    """
    Handle YouTube search requests by query and fetch videos with limited comments.
    """
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400

    data = request.get_json()
    query = data.get("query")
    maxResults = int(data.get("maxResults"))
    if not query:
        return jsonify({"error": "Missing 'query' in JSON body"}), 400

    try:
        result = get_facebook_ads(query, maxResults)  # Ensure this function works correctly
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/', methods=['GET'])
def home():
    """
    Simple welcome message for GET requests
    """
    return "Send a POST request to /api/posts with JSON {'query': '<search_query>'}"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
