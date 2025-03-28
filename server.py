from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.valencia_adventure
entries_collection = db.entries

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        # Insert the data into MongoDB
        result = entries_collection.insert_one(data)
        return jsonify({"success": True, "message": "Entry saved successfully", "id": str(result.inserted_id)})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/submit-form', methods=['GET'])
def get_entries():
    try:
        # Retrieve all entries from MongoDB
        entries = list(entries_collection.find({}, {'_id': 0}))  # Exclude MongoDB _id field
        return jsonify({"success": True, "entries": entries})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

if __name__ == '__main__':
    app.run(port=3000)
