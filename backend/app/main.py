# The FastAPI app: creates it and plugs in each feature's routes.
# Run with uvicorn app.main:app --reload (from the backend folder)

from fastapi import FastAPI

app = FastAPI(title="Preamar")

@app.get("/health")
def health():
    return {"status" : "ok"}