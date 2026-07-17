from fastapi import APIRouter, HTTPException
from app.models.user import UserRegister, UserLogin
from app.database import users_collection
from app.utils.auth_utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(user: UserRegister):
    # Check if email already exists
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password and save to MongoDB
    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password)
    }
    result = await users_collection.insert_one(new_user)

    return {
        "message": "Account created successfully",
        "id": str(result.inserted_id)
    }


@router.post("/login")
async def login(user: UserLogin):
    # Find user by email
    found = await users_collection.find_one({"email": user.email})
    if not found:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(user.password, found["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create and return JWT token
    token = create_access_token({
        "sub": str(found["_id"]),
        "name": found["name"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "name": found["name"],
        "email": found["email"]
    }