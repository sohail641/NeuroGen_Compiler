from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.generate import router as generate_router


app = FastAPI(title="NeuroGen Compiler API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(generate_router)


@app.get("/")
def root():
    return {"message": "NeuroGen Compiler API is running"}