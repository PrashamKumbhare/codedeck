from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os

app = Flask(__name__)
CORS(app)


@app.route("/run", methods=["POST"])
def run_code():
    data = request.json

    language = data.get("language")
    code = data.get("code")

    if not language or not code:
        return jsonify({"output": "Error: No code or language provided"}), 400


    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            if language == "python":
                file_path = os.path.join(temp_dir, "main.py")

                with open(file_path, "w") as f:
                    f.write(code)

                result = subprocess.run(
                    ["py", file_path],
                    capture_output=True,
                    text=True,
                    timeout=5
                )


            elif language == "javascript":
                file_path = os.path.join(temp_dir, "main.js")

                with open(file_path, "w") as f:
                    f.write(code)

                result = subprocess.run(
                    ["node", file_path],
                    capture_output=True,
                    text=True,
                    timeout=5
                )


            else:
                return jsonify({
                    "output": "This language is not supported yet."
                })


            output = result.stdout + result.stderr

            if output.strip() == "":
                output = "No output"


            return jsonify({"output": output})


    except subprocess.TimeoutExpired:
        return jsonify({"output": "Error: Code took too long to run (timeout)"})


    except Exception as e:
        return jsonify({"output": f"Server Error: {str(e)}"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)