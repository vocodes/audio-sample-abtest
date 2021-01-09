#!/usr/bin/env python3

from flask import Flask, request, send_from_directory

app = Flask(__name__, static_url_path='')

@app.route('/')
def index():
    return 'Hello, World!'

@app.route('/wav/<path:path>')
def serve_wav(path):
    return send_from_directory('testdata/wavs', path)

