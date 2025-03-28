from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/submit-form', methods=['POST'])
def submit_form():
    try:
        data = request.get_json()
        # Here you would typically save the data to a database
        # For now, we'll just print it and return success
        print("Received form data:", data)
        return jsonify({"success": True, "message": "Form submitted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

if __name__ == '__main__':
    app.run(port=3000)
