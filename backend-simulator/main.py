import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from engine import run_simulation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="DDEAR Sandbox Simulation Engine")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Asset(BaseModel):
    id: str
    type: str # "solar", "ess", "wind", "dr"
    capacity_kw: float
    capacity_kwh: Optional[float] = None
    efficiency: Optional[float] = 1.0

class SimulationRequest(BaseModel):
    baseline_id: str
    assets: List[Asset]
    custom_baseline: Optional[List[float]] = None

@app.get("/")
def read_root():
    return {"status": "Simulation Engine is running"}

@app.post("/simulate")
def simulate(req: SimulationRequest):
    logger.info(f"Received simulation request. Assets: {len(req.assets)}. Custom baseline provided: {req.custom_baseline is not None}")
    try:
        results = run_simulation(req.assets, req.custom_baseline)
        return {"status": "success", "data": results}
    except Exception as e:
        logger.error(f"Simulation error: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
