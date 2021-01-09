audio-sample-abtest
===================

A simple Flask and React app for comparing two audio files head to head.
The results will be logged to file for offline analysis.

Installation
------------

```bash
# Create and activate a Python virtual environment
python3 -m venv python/
source python/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Run the server
--------------

There are [several ways to start Flask applications](https://flask.palletsprojects.com/en/1.1.x/quickstart/#a-minimal-application).

On Linux,

```bash
export FLASK_APP=server.py
flask run
```

On Windows command prompt,

```bash
st FLASK_APP=server.py
flask run
```

You should read the Flask guide for Windows.


