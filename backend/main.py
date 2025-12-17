from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
from typing import List, Dict, Any
import os

app = FastAPI()


class DownloadRequest(BaseModel):
    video_url: str
    cookies: List[Dict[str, Any]]
    user_agent: str
    output_path: str  # This is just the filename (e.g., "Lecture 1")


def download_video(url, cookies_list, user_agent, file_name):
    # Convert cookies to header string
    cookie_header_val = "; ".join([f"{c['name']}={c['value']}" for c in cookies_list])

    # 2. Define the target folder
    target_folder = "Videos"

    # 3. Create the folder if it doesn't exist (Safety check)
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)

    # 4. Construct the full path: Videos/Lecture 1.mp4
    # We use .%(ext)s to let yt-dlp pick the correct extension first,
    # though merge_output_format will try to make it mp4.
    save_path = os.path.join(target_folder, f"{file_name}.%(ext)s")

    ydl_opts = {
        'quiet': False,
        'outtmpl': save_path,  # <--- Updated to use the folder path
        'format': 'bestvideo+bestaudio/best',
        'merge_output_format': 'mp4',
        'http_headers': {
            'Cookie': cookie_header_val,
            'User-Agent': user_agent,
        }
    }

    print(f"DEBUG: Saving to folder '{target_folder}' with name '{file_name}'")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False


@app.post("/download")
def start_download(request: DownloadRequest):
    success = download_video(
        request.video_url,
        request.cookies,
        request.user_agent,
        request.output_path
    )

    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="Download failed")