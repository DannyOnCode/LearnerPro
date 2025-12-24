import {useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './Workspace.css';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }], // Headers
        ['bold', 'italic', 'underline', 'strike'], // Basic formatting
        [{ 'list': 'ordered'}, { 'list': 'bullet' }], // Lists
        [{ 'indent': '-1'}, { 'indent': '+1' }], // Tabbing
        [{ 'size': ['small', false, 'large', 'huge'] }], // Font size
        ['image'], // Image button
        ['clean'] // Remove formatting
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'indent',
    'size',
    'image'
];

export default function Workspace() {
    const location = useLocation();
    const navigate = useNavigate();
    const [noteContent, setNoteContent] = useState('');
    const [savingStatus, setSavingStatus] = useState('Saved');

    const videoData = location.state as { name: string; path: string } | null;

    useEffect(() => {
        const loadNote = async () => {
            if (videoData && window.electron) {
                const savedContent = await window.electron.getNote(videoData.path);
                setNoteContent(savedContent);
            }
        };
        loadNote();
    }, [videoData]);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (videoData && window.electron) {
                setSavingStatus('Saving...');
                await window.electron.saveNote(videoData.path, noteContent);
                setSavingStatus('Saved');
            }
        }, 1000); // Waits for 1 second of inactivity before saving

        return () => clearTimeout(timeoutId);
    }, [noteContent, videoData]);

    if (!videoData) {
        return <div className="error-screen">No video selected. <button onClick={() => navigate('/')}>Go Back</button></div>;
    }

    const cleanPath = videoData.path.replace(/\\/g, '/');
    const videoSrc = `media:///${cleanPath}`;

    // const displayVideoName = videoData.name.replace('.mp4', '')

    return (
        <div className="workspace-container">
            {/* Left Panel: Video Player */}
            <div className="video-panel">
                <button className="back-button" onClick={() => navigate('/')}>
                    ← Back to Library
                </button>

                <div className="video-wrapper">
                    <video
                        className="main-video"
                        controls
                        autoPlay
                        src={videoSrc}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

            {/* Right Panel: Note Taking */}
            <div className="notes-panel">
                <div className="notes-header">
                    <h3 className="notes-title">Lecture Notes</h3>
                    <span style={{fontSize: '12px', color: '#888'}}>{savingStatus}</span>
                </div>

                <ReactQuill
                    theme="snow"
                    value={noteContent}
                    onChange={setNoteContent}
                    modules={modules}
                    formats={formats}
                    placeholder="Write your notes here... (You can paste images directly)"
                />
            </div>
        </div>
    );
}