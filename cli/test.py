# import webbrowser
# import requests
#
# req = requests.get('https://accounts.google.com/o/oauth2/v2/auth', params= {
#     'client_id': '142263870589-cq184u7n7ufuni4mpiavfol8m20acd80.apps.googleusercontent.com',
#     'redirect_uri': 'https://[::1]:8080/api/login/google',
#     'response_type': 'code',
#     'scope': 'openid',
# })
#
# # print(req.text)
# print(req.url)
#
# webbrowser.open(req.url)
#
#
import webbrowser
import urllib.parse
import secrets
import base64
import hashlib

# OAuth 2.0 configuration
authorization_endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
client_id = "142263870589-cq184u7n7ufuni4mpiavfol8m20acd80.apps.googleusercontent.com"
redirect_uri = "https://localhost:8080/cli/close"
scope = "openid profile"

# Generate state parameter for CSRF protection
state = secrets.token_urlsafe(16)

# Generate code verifier and challenge for PKCE
code_verifier = secrets.token_urlsafe(64)
code_verifier_bytes = code_verifier.encode('ascii')
code_challenge = base64.urlsafe_b64encode(hashlib.sha256(code_verifier_bytes).digest()).decode('ascii')
code_challenge = code_challenge.rstrip('=')  # Remove padding
code_challenge_method = "S256"

# Build the authorization request URL
params = {
    "response_type": "code",
    "scope": scope,
    "redirect_uri": redirect_uri,
    "client_id": client_id,
    "state": state,
    "code_challenge": code_challenge,
    "code_challenge_method": code_challenge_method
}

authorization_request = f"{authorization_endpoint}?{urllib.parse.urlencode(params)}"

# Open the authorization URL in the default browser
webbrowser.open(authorization_request)

# Store code_verifier, state for later use in token exchange
print(f"Code Verifier: {code_verifier}")
print(f"State: {state}")
