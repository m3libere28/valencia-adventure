from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from functools import wraps
import os
import sys
import json
from dotenv import load_dotenv
from datetime import datetime
import jwt
from urllib.request import urlopen

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:8000",
            "https://personal-website-taupe-pi-67.vercel.app",
            "https://m3libere28.github.io"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Auth0 configuration
AUTH0_DOMAIN = 'dev-mjqed8dmtwvb4k7g.us.auth0.com'
AUTH0_AUDIENCE = 'https://dev-mjqed8dmtwvb4k7g.us.auth0.com/api/v2/'
ALGORITHMS = ["RS256"]

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

# Auth0 token validation
def get_token_auth_header():
    auth = request.headers.get("Authorization", None)
    if not auth:
        raise Exception({"code": "authorization_header_missing",
                        "description": "Authorization header is expected"})

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise Exception({"code": "invalid_header",
                        "description": "Authorization header must start with Bearer"})
    elif len(parts) == 1:
        raise Exception({"code": "invalid_header",
                        "description": "Token not found"})
    elif len(parts) > 2:
        raise Exception({"code": "invalid_header",
                        "description": "Authorization header must be Bearer token"})

    token = parts[1]
    return token

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            token = get_token_auth_header()
            jsonurl = urlopen(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json")
            jwks = json.loads(jsonurl.read())
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks["keys"]:
                if key["kid"] == unverified_header["kid"]:
                    rsa_key = {
                        "kty": key["kty"],
                        "kid": key["kid"],
                        "n": key["n"],
                        "e": key["e"]
                    }
            if rsa_key:
                try:
                    payload = jwt.decode(
                        token,
                        rsa_key,
                        algorithms=ALGORITHMS,
                        audience=AUTH0_AUDIENCE,
                        issuer=f"https://{AUTH0_DOMAIN}/"
                    )
                except jwt.ExpiredSignatureError:
                    raise Exception({"code": "token_expired",
                                "description": "token is expired"})
                except jwt.JWTClaimsError:
                    raise Exception({"code": "invalid_claims",
                                "description": "incorrect claims, please check the audience and issuer"})
                except Exception:
                    raise Exception({"code": "invalid_header",
                                "description": "Unable to parse authentication token."})

                return f(*args, **kwargs)
            raise Exception({"code": "invalid_header",
                           "description": "Unable to find appropriate key"})
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 401
    return decorated

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/journal/entries', methods=['GET'])
@requires_auth
def get_journal_entries():
    try:
        entries = list(entries_collection.find({}, {'_id': 0}))
        return jsonify({"success": True, "entries": entries})
    except Exception as e:
        print(f"Error getting entries: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/journal/entries', methods=['POST'])
@requires_auth
def add_journal_entry():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['date', 'title', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "error": f"Missing required field: {field}"
                }), 400

        # Add timestamp
        data['timestamp'] = datetime.utcnow().isoformat()

        # Insert into MongoDB
        result = entries_collection.insert_one(data)
        
        # Return the created entry
        return jsonify({
            "success": True,
            "entry": data
        })
    except Exception as e:
        print(f"Error adding entry: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/journal/entries/<entry_id>', methods=['DELETE'])
@requires_auth
def delete_journal_entry(entry_id):
    try:
        result = entries_collection.delete_one({"_id": entry_id})
        
        if result.deleted_count == 0:
            return jsonify({
                "success": False,
                "error": "Entry not found"
            }), 404
            
        return jsonify({
            "success": True,
            "message": "Entry deleted successfully"
        })
    except Exception as e:
        print(f"Error deleting entry: {str(e)}", file=sys.stderr)
        return jsonify({"success": False, "error": str(e)}), 500

# For local development
if __name__ == '__main__':
    app.run(port=8000)
else:
    # For Vercel deployment
    app = app
