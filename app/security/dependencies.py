from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.security.jwt import decode_access_token

bearer = HTTPBearer()

def get_current_user_id(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> str:
    try:
        payload = decode_access_token(creds.credentials)
        return payload["sub"]
    except ValueError as e:
        msg = str(e)
        if msg == "TOKEN_EXPIRED":
            raise HTTPException(status_code=401, detail="Token expired")
        raise HTTPException(status_code=401, detail="Invalid token")