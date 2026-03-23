from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get Groq API Key
GROQ_API_KEY = os.getenv("Groq_Api_Key")
MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="AI HR Assistant API")

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured in .env")
    
    async with httpx.AsyncClient() as client:
        try:
            # Call Groq API
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": MODEL,
                    "messages": [
                        {
                            "role": "system", 
                            "content": "You are a professional and helpful HR Assistant bot. You help employees with questions about payroll, benefits, company policies, and workplace issues. Be concise, empathetic, and professional."
                        },
                        {
                            "role": "user", 
                            "content": request.message
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 1024
                },
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            error_detail = e.response.json().get('error', {}).get('message', str(e))
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Basic route for root to serve index.html
@app.get("/", response_class=HTMLResponse)
async def get_root():
    return FileResponse("index.html")

# Serve other static files (css, js)
app.mount("/static", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
