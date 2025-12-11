# backend/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
from typing import List, Dict, Any

app = FastAPI()


class DownloadRequest(BaseModel):
    video_url: str
    cookies: List[Dict[str, Any]]
    user_agent: str  # <--- NEW FIELD


def download_video(url, cookies_list, user_agent, output_path="lecture.mp4"):
    # Convert cookies to header string
    cookie_header_val = "; ".join([f"{c['name']}={c['value']}" for c in cookies_list])

    ydl_opts = {
        'quiet': False,
        'outtmpl': output_path,
        'format': 'bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'http_headers': {
            'Cookie': cookie_header_val,
            'User-Agent': user_agent,
        }
    }

    print(f"DEBUG: Using User-Agent: {user_agent}")  # Optional: Check logs to verify

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


@app.post("/download")
def start_download(request: DownloadRequest):
    # Pass the user_agent to the download function
    success = download_video(request.video_url, request.cookies, request.user_agent)

    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Download failed")