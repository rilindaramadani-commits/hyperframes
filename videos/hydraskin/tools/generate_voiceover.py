"""Generate the HydraSkin voice-over with Google Cloud Text-to-Speech.

Run it on a machine where Google Cloud is authenticated (the same setup that produced the
first hydraskin_voiceover.mp3):

    pip install google-cloud-texttospeech
    gcloud auth application-default login        # or GOOGLE_APPLICATION_CREDENTIALS=key.json
    python3 tools/generate_voiceover.py

Input: tools/voiceover.ssml (the approved script, pauses and pace included).
Output: hydraskin_voiceover.mp3 in videos/hydraskin/ (existing files are never deleted;
an existing output is kept as hydraskin_voiceover.previous-N.mp3).

Chirp 3 HD voices may reject SSML. The script first sends the SSML as is
(texttospeech.SynthesisInput(ssml=ssml)); if the voice refuses it, it sends the same text as
Chirp "markup" — <break> becomes [pause short] / [pause] / [pause long] — and moves the 92 %
pace from <prosody rate> to the audio config's speaking_rate.
"""
import os
import re
import sys

from google.api_core import exceptions
from google.cloud import texttospeech

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
VOICE = "fr-FR-Chirp3-HD-Despina"
SSML_PATH = os.path.join(HERE, "voiceover.ssml")
OUT = os.path.join(PROJECT, "hydraskin_voiceover.mp3")


def ssml_to_markup(ssml):
    """SSML → Chirp 3 HD markup: breaks become pause tags, other tags are dropped."""
    def pause(m):
        ms = int(m.group(1))
        return " [pause short] " if ms <= 500 else (" [pause] " if ms <= 1000 else " [pause long] ")

    text = re.sub(r'<break\s+time="(\d+)ms"\s*/>', pause, ssml)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def rate_from(ssml):
    m = re.search(r'<prosody[^>]*rate="(\d+)%"', ssml)
    return int(m.group(1)) / 100 if m else 1.0


def keep_previous(path):
    if not os.path.exists(path):
        return
    n = 1
    while os.path.exists(path.replace(".mp3", f".previous-{n}.mp3")):
        n += 1
    os.rename(path, path.replace(".mp3", f".previous-{n}.mp3"))


def main():
    ssml = open(SSML_PATH, encoding="utf-8").read()
    client = texttospeech.TextToSpeechClient()
    voice = texttospeech.VoiceSelectionParams(language_code="fr-FR", name=VOICE)

    try:
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(ssml=ssml),
            voice=voice,
            audio_config=texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3),
        )
        mode = "SSML"
    except exceptions.InvalidArgument as err:
        print(f"{VOICE} refuse le SSML ({err.message}). Passage en balisage Chirp (markup).")
        response = client.synthesize_speech(
            input=texttospeech.SynthesisInput(markup=ssml_to_markup(ssml)),
            voice=voice,
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=rate_from(ssml)),
        )
        mode = "markup"

    keep_previous(OUT)
    with open(OUT, "wb") as f:
        f.write(response.audio_content)
    print(f"OK ({mode}) : {OUT}")


if __name__ == "__main__":
    sys.exit(main())
