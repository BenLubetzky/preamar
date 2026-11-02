# The FastAPI app: creates it and plugs in each feature's routes.
# Run with uvicorn app.main:app --reload (from the backend folder)

import uuid
from fastapi import FastAPI, Depends
from app.core.auth import get_current_user_id

from app.features.tasks.router import router as tasks_router

app = FastAPI(title="Preamar")

app.include_router(tasks_router)

@app.get("/health")
def health():
    return {"status" : "ok"}

@app.get("/me")
def me(user_id:uuid.UUID = Depends(get_current_user_id)):
    return {"user_id": user_id}