#!/usr/bin/env python3

"""
The format of the relative directory tree is as follows:

- dataset
    - speaker_name_1
        - audio_1.wav
        - audio_1.txt
        - audio_2.wav
        - audio_2.txt
    - speaker_name_2
        - audio_1.wav
        - audio_1.txt
        - audio_2.wav
        - audio_2.txt
- tt_dataset
    - speaker_name_1
        - audio_1.wav
        - audio_1.txt
        - audio_2.wav
        - audio_2.txt
    - speaker_name_2
        - audio_1.wav
        - audio_1.txt
        - audio_2.wav
        - audio_2.txt
"""

import os
import random
import csv

from flask import Flask, request, send_from_directory, json
from flask_cors import CORS

app = Flask(__name__, static_url_path='')
CORS(app) # NB: Allow-all domains on all paths

FILENAME = 'results.csv'
WAV_DIRECTORY = 'testdata/wavs'

def get_all_wav_files(directory):
    print('Fetching all wav files. (This is only done once!)')
    all_wav_files = []
    for (dirpath, dirnames, filenames) in os.walk(directory):
        relpath = os.path.relpath(dirpath, directory)
        for filename in filenames:
            if not filename.endswith('.wav'):
                continue
            wav_file = os.path.join(relpath, filename)
            all_wav_files.append(wav_file)
    print('Wav files fetched.')
    return all_wav_files

# Cache this list once since it's probably extensive.
ALL_WAVS = get_all_wav_files(WAV_DIRECTORY)

def get_speaker_name(wav_path):
    try:
        parts = wav_path.split('/')
        return parts[1]
    except Exception as e:
        raise e # Optionally do not raise

def get_dataset_name(wav_path):
    try:
        parts = wav_path.split('/')
        return parts[0]
    except Exception as e:
        raise e # Optionally do not raise

def get_transcript(wav_path):
    try:
        transcript_path = wav_path.replace('.wav', '.txt')
        transcript_path = os.path.join(WAV_DIRECTORY, transcript_path)
        contents = open(transcript_path, 'r', encoding='utf8').read().strip()
        print(contents)
        return contents
    except Exception as e:
        raise e # Optionally do not raise

def determine_if_same_speaker(wav_path_a, wav_path_b): 
    speaker_a = get_speaker_name(wav_path_a)
    speaker_b = get_speaker_name(wav_path_b)
    return speaker_a == speaker_b

def determine_if_same_dataset(wav_path_a, wav_path_b): 
    dataset_a = get_dataset_name(wav_path_a)
    dataset_b = get_dataset_name(wav_path_b)
    return dataset_a == dataset_b

def determine_if_same_transcript(wav_path_a, wav_path_b): 
    transcript_a = get_transcript(wav_path_a)
    transcript_b = get_transcript(wav_path_b)
    return transcript_a == transcript_b
    
@app.route('/')
def index():
    return send_from_directory('frontend/build', 'index.html')

@app.route('/static/<path:path>')
def frontend(path):
    print(path)
    return send_from_directory('frontend/build/static', path)

@app.route('/wav/<path:path>')
def serve_wav(path):
    return send_from_directory(WAV_DIRECTORY, path)

@app.route('/vote', methods=['POST'])
def vote():
    response = request.get_json()

    winner = response['winner']
    loser = response['loser']

    same_dataset = determine_if_same_dataset(winner, loser)
    same_dataset = 'SAME_DATASET' if same_dataset else 'DIFFERENT_DATASET'
    same_speaker = determine_if_same_speaker(winner, loser)
    same_speaker = 'SAME_SPEAKER' if same_speaker else 'DIFFERENT_SPEAKER'
    same_transcript = determine_if_same_transcript(winner, loser)
    same_transcript = 'SAME_TRANSCRIPT' if same_transcript else 'DIFFERENT_TRANSCRIPT'

    # NB: This is not threadsafe!
    with open(FILENAME, 'a') as f:
        writer = csv.writer(f, delimiter='|')
        writer.writerow([
            winner,
            loser,
            same_dataset,
            same_speaker,
            same_transcript,
        ])
    return 'Voted'

@app.route('/experiment')
def random_experiment():
    file_a = None
    file_b = None
    i = 0
    while True:
        if i > 3:
            break
        file_a = random.choice(ALL_WAVS)
        file_b = random.choice(ALL_WAVS)
    
        # Remove this check if you want to compare within the same dataset
        same_dataset = determine_if_same_dataset(file_a, file_b)

        if file_a != file_b and not same_dataset:
            break

        i += 1

    response = {
        'file_a': {
            'name': file_a,
            'relative_path': file_a,
        },
        'file_b': {
            'name': file_b,
            'relative_path': file_b,
        }
    }
    return app.response_class(
        response=json.dumps(response),
        status=200,
        mimetype='application/json',
    )

@app.route('/stats')
def stats():
    count = 0
    try:
        with open(FILENAME, 'r') as f:
            count = len(f.readlines())
    except Exception as e:
        print('Exception', e)

    response = {
        'trial_count': count,
    }

    return app.response_class(
        response=json.dumps(response),
        status=200,
        mimetype='application/json',
    )
