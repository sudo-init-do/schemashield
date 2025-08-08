from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI(title="Sample API")

PETS = [
    {"id": 1, "name": "Milo", "type": "dog"},
    {"id": 2, "name": "Luna", "type": "cat"},
]

@app.get("/pets")
def list_pets():
    return {"pets": PETS}

@app.get("/pets/{pet_id}")
def get_pet(pet_id: int):
    for p in PETS:
        if p["id"] == pet_id:
            return p
    return JSONResponse({"error": "not found"}, status_code=404)
