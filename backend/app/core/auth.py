# Turns the token the frontend sends into the logged in user's id.
# Tokens are signed by Supabase; we check them with Supabase's public keys.

import os
import uuid

import jwt  # the PyJWT library: reads and verifies JWTs
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

# Supabase signs every token with a private key only it has, and publishes the matching public key at this URL
# A public key can only check a signature, never create one so it's safe for anyone to have it.
# PyJWKClient downloads the list the first time it's needed and caches it, so we don't need to call Supabase on every
# request.
jwks_client = jwt.PyJWKClient(f"{os.environ['SUPABASE_URL']}/auth/v1/.well-known/jwks.json")

# Reads the "Authorization: Bearer <token>" header from the request
bearer = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> uuid.UUID:
    # credentials.credentials is the token string itself without the "Bearer part"
    token = credentials.credentials
    try:
        # A token's header says which of Supabase's key signed it, this picks the matching public key from
        # the downloaded list
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # decode is going to be doing all the checks at once and only returns the payload if all pass
        # - the signature matches the public key
        # - expiration time hasn't passed
        # - the audience is "authenticated", which Supabase puts on logged in users' tokens
        # algorithms=["ES256"] accepts only the ECC algorithm Supabase uses. Without it, a forged token
        # could clain a weaker algorithm in its header and skip the check
        payload = jwt.decode(token, signing_key.key, algorithms=["ES256"], audience="authenticated")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # sub (subject) is the user's id in Supabase. It's the asme id as in auth.users and our users table.
    # It arrives as a string, so we turn it into a UUID to match the type of our columns
    return uuid.UUID(payload["sub"])