audio-sample-abtest
===================

A simple Flask and React app for comparing two audio files head to head.
The results will be logged to file for offline analysis.

Screenshot
----------
![screenshot](https://github.com/vocodes/audio-sample-abtest/blob/master/screenshot.png?raw=true)

Installation
------------

**Linux**

```bash
# Create and activate a Python virtual environment
python3 -m venv python/
source python/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Windows PowerShell**

```bash
# Create and activate a Python virtual environment
PS > python3 -m venv python/
PS > Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
PS > .\python\Scripts\Activate.ps1

# Install dependencies
PS > pip install -r requirements.txt
```

Run the server
--------------

There are [several ways to start Flask applications](https://flask.palletsprojects.com/en/1.1.x/quickstart/#a-minimal-application).

**Linux**

```bash
export FLASK_APP=server.py
flask run
```

**Windows command prompt**

```bash
set FLASK_APP=server.py
flask run
```

**Windows PowerShell**

```bash
PS > $env:FLASK_APP = "server.py"
PS > flask run
```


You should read the Flask guide for Windows.

(Optional) Compile the frontend
-------------------------------

The frontend is already compiled in the source tree so you don't have to worry about npm/node,
but if you want to build it, run the following in the frontend directory:

```bash
npm run-script build
```

Or to run interactively with a watcher,

```bash
npm run-script start
```

Results file format
-------------------

Results are put into a CSV file with the following format:

```
source_1/speaker_2/c.wav|source_2/speaker_2/g.wav|DIFFERENT_DATASET|SAME_SPEAKER|SAME_TRANSCRIPT
source_1/speaker_1/b.wav|source_2/speaker_2/h.wav|DIFFERENT_DATASET|DIFFERENT_SPEAKER|DIFFERENT_TRANSCRIPT
source_2/speaker_1/f.wav|source_1/speaker_1/a.wav|DIFFERENT_DATASET|SAME_SPEAKER|SAME_TRANSCRIPT
source_2/speaker_2/g.wav|source_1/speaker_1/a.wav|DIFFERENT_DATASET|DIFFERENT_SPEAKER|DIFFERENT_TRANSCRIPT
source_2/speaker_2/h.wav|source_1/speaker_1/a.wav|DIFFERENT_DATASET|DIFFERENT_SPEAKER|SAME_TRANSCRIPT
```

The columns are as follows:

1. winner
2. loser
3. whether they're from the same dataset (`SAME_DATASET`) or not (`DIFFERENT_DATASET`)
4. whether they're from the same speaker (`SAME_SPEAKER`) or not (`DIFFERENT_SPEAKER`)
5. whether they have the same transcript (`SAME_TRANSCRIPT`) or not (`DIFFERENT_TRANSCRIPT`)

