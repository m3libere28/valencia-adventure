from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

# MongoDB setup
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    print("No MongoDB URI found!", file=sys.stderr)
    raise Exception("MongoDB URI not configured")

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

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        print(f"Received form data: {data}")
        
        # Insert the data into MongoDB
        result = entries_collection.insert_one(data)
        print(f"Successfully saved entry with ID: {result.inserted_id}")
        
        return jsonify({
            "success": True, 
            "message": "Entry saved successfully",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        print(f"Error saving form data: {str(e)}", file=sys.stderr)
        return jsonify({
            "success": False, 
            "message": f"Failed to save entry: {str(e)}"
        }), 400

@app.route('/api/submit-form', methods=['GET'])
def get_entries():
    try:
        # Retrieve all entries from MongoDB
        entries = list(entries_collection.find({}, {'_id': 0}))
        print(f"Retrieved {len(entries)} entries")
        return jsonify({
            "success": True, 
            "entries": entries
        })
    except Exception as e:
        print(f"Error retrieving entries: {str(e)}", file=sys.stderr)
        return jsonify({
            "success": False, 
            "message": f"Failed to retrieve entries: {str(e)}"
        }), 400

# For local development
if __name__ == '__main__':
    app.run(port=3000)
else:
    # For Vercel
    app = app
