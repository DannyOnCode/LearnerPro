import { app, BrowserWindow, session, ipcMain, protocol, net } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { isDev } from "./util.js";
import { fileURLToPath, pathToFileURL } from 'url';
import axios from 'axios';
import { getPreloadPath, getVideoPath } from "./pathResolver.js";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const CURRENT_DIR = path.dirname(__filename);

const isProd = app.isPackaged;
const pythonPath = isProd ? path.join(process.resourcesPath, 'backend', 'main.exe')
    : path.join(CURRENT_DIR, '..', 'backend', 'main.py');

let pythonProcess: ChildProcess | null = null;

// Register the custom 'media' protocol
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'media',
        privileges: {
            secure: true,
            supportFetchAPI: true,
            bypassCSP: true,
            stream: true
        }
    }
]);

app.on("ready", () => {
    pythonProcess = isProd ? spawn(pythonPath)
        : spawn('python', [pythonPath]);

    pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
    });

    protocol.handle('media', (request) => {
        let filePath = request.url.replace('media:///', '');

        if (filePath.startsWith('media://')) {
            filePath = filePath.replace('media://', '');
        }

        filePath = decodeURIComponent(filePath);

        const fileUrl = pathToFileURL(filePath).toString();

        return net.fetch(fileUrl);
    });

    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: getPreloadPath(),
        }
    });
    if (isDev()) {
        mainWindow.loadURL('http://localhost:5123');
    } else {
        mainWindow.loadURL(path.join(app.getAppPath(), '/dist-react/index.html'));
    }
});

app.on("before-quit", () => {
    // Clean up Python process if needed
    if (pythonProcess) {
        pythonProcess.kill();
    }
})

// 1. Listen for a "Login" event from your Frontend UI
ipcMain.handle('perform-login-and-download', async (event, videoUrl, lecture_name) => {
    // Create a temporary window for the user to log in
    const loginWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: false }
    });

    // Load the video URL (which triggers the NUS login redirect)
    loginWindow.loadURL(videoUrl);

    // 2. Wait for the user to finish logging in
    // We can detect this by checking if the URL matches the "success" page
    // OR just wait for the window to close. Let's wait for close for simplicity.
    return new Promise((resolve) => {

        loginWindow.on('close', async () => {
            try {
                const userAgent = loginWindow.webContents.getUserAgent();
                const cookies = await session.defaultSession.cookies.get({});

                console.log(`Debug: Retrieved ${cookies.length} cookies.`);

                if (cookies.length === 0) {
                    resolve({ success: false, message: "No cookies found. Did you log in?" });
                    return;
                }

                // 3. Send to Python
                const response = await axios.post('http://127.0.0.1:8000/download', {
                    video_url: videoUrl,
                    cookies: cookies,
                    user_agent: userAgent,
                    output_path: lecture_name,
                });

                resolve({ success: true, data: response.data });

            } catch (error) {
                console.error("Python Error:", error);
                resolve({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
        });
    });
});

ipcMain.handle('get-videos', async () => {
    const videoPath = getVideoPath();
    console.log(videoPath);

    // 1. Check if folder exists
    if (!fs.existsSync(videoPath)) {
        console.log("Video path does not exist.");
        return [];
    }

    try {
        // 2. Read the directory
        const files = await fs.promises.readdir(videoPath);
        console.log(files);

        // 3. Filter for MP4s and return their names
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        console.log(videoFiles)

        // 4. Return simple objects
        return videoFiles.map(file => ({
            name: file,
            path: path.join(videoPath, file)
        }));
    } catch (error) {
        console.error("Error reading videos:", error);
        return [];
    }
});