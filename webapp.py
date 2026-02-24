from flask import Flask, send_from_directory
import os

app = Flask(__name__)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    dist_dir = os.path.join(app.static_folder, 'dist')
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    return send_from_directory(dist_dir, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
