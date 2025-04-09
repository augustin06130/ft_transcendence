import webbrowser
import urllib.parse
import secrets
import base64
import hashlib
import os

client_id = "142263870589-cq184u7n7ufuni4mpiavfol8m20acd80.apps.googleusercontent.com"
code_verifier = secrets.token_urlsafe(128)
code_verifier_bytes = code_verifier.encode('ascii')
code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier_bytes).digest()).decode('ascii')
code_challenge = code_challenge.rstrip('=')

params = {
    "client_id": client_id,
    "redirect_uri": "https://localhost:8080/cli/close",
    "response_type": "code",
    "scope": "openid profile",
    "state": hashlib.sha256(os.urandom(1024)).hexdigest(),
    "code_challenge": code_challenge,
    "code_challenge_method": "S256"
}

authorization_request = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"

webbrowser.open(authorization_request)
