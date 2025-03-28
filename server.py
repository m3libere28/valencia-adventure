from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
import sys
import json
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:8000",
            "https://personal-website-taupe-pi-67.vercel.app"
        ],
        "methods": ["GET", "POST", "OPTIONS", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    print("No MongoDB URI found!", file=sys.stderr)
    raise Exception("MongoDB URI not configured")

print(f"Connecting to MongoDB with URI: {MONGODB_URI[:20]}...")  # Print first 20 chars for safety

try:
    client = MongoClient(MONGODB_URI)
    db = client.valencia_adventure
    entries_collection = db.entries
    # Test the connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"MongoDB connection error: {str(e)}", file=sys.stderr)
    raise e

def get_data_file(filename):
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    return os.path.join(data_dir, filename)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/submit-form', methods=['POST'])
def submit_form():
    try:
        print("Received POST request to /api/submit-form")
        data = request.get_json()
        print(f"Received data: {json.dumps(data, indent=2)}")
        
        if not data:
            raise ValueError("No data received")
        
        # Validate required fields
        required_fields = ['title', 'date', 'notes']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {', '.join(missing_fields)}")
        
        # Insert the data into MongoDB
        result = entries_collection.insert_one(data)
        print(f"Successfully saved entry with ID: {result.inserted_id}")
        
        return jsonify({
            "success": True, 
            "message": "Entry saved successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        error_msg = str(e)
        print(f"Error saving form data: {error_msg}", file=sys.stderr)
        return jsonify({
            "success": False, 
            "message": f"Failed to save entry: {error_msg}"
        }), 400

@app.route('/api/submit-form', methods=['GET'])
def get_entries():
    try:
        print("Received GET request to /api/submit-form")
        # Retrieve all entries from MongoDB
        entries = list(entries_collection.find({}, {'_id': 0}))
        print(f"Retrieved {len(entries)} entries")
        return jsonify({
            "success": True, 
            "entries": entries
        })
    except Exception as e:
        error_msg = str(e)
        print(f"Error retrieving entries: {error_msg}", file=sys.stderr)
        return jsonify({
            "success": False, 
            "message": f"Failed to retrieve entries: {error_msg}"
        }), 400

@app.route('/api/journal/entries', methods=['GET'])
def get_journal_entries():
    try:
        with open(get_data_file('journal.json'), 'r') as f:
            return jsonify({"success": True, "entries": json.load(f)})
    except FileNotFoundError:
        return jsonify({"success": True, "entries": []})

@app.route('/api/journal/entries', methods=['POST'])
def add_journal_entry():
    entry = request.json
    try:
        entries = []
        try:
            with open(get_data_file('journal.json'), 'r') as f:
                entries = json.load(f)
        except FileNotFoundError:
            pass
        
        entries.append(entry)
        
        with open(get_data_file('journal.json'), 'w') as f:
            json.dump(entries, f)
        
        return jsonify({"success": True, "message": "Journal entry added successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route('/api/journal/entries/<int:entry_id>', methods=['DELETE'])
def delete_journal_entry(entry_id):
    try:
        entries = []
        try:
            with open(get_data_file('journal.json'), 'r') as f:
                entries = json.load(f)
        except FileNotFoundError:
            return jsonify({"success": False, "message": "No entries found"})
        
        entries = [entry for entry in entries if entry['id'] != entry_id]
        
        with open(get_data_file('journal.json'), 'w') as f:
            json.dump(entries, f)
        
        return jsonify({"success": True, "message": "Journal entry deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

# For local development
if __name__ == '__main__':
    app.run(port=8000)
else:
    # For Vercel
    app = app
