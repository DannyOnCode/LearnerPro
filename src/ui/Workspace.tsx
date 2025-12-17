import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './Workspace.css';

// Editor configuration for the toolbar
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
    'list', 'bullet', 'indent',
    'size',
    'image'
];

export default function Workspace() {
    const location = useLocation();
    const navigate = useNavigate();
    const [noteContent, setNoteContent] = useState('');

    const videoData = location.state as { name: string; path: string } | null;

    if (!videoData) {
        return <div className="error-screen">No video selected. <button onClick={() => navigate('/')}>Go Back</button></div>;
    }

    const cleanPath = videoData.path.replace(/\\/g, '/');
    const videoSrc = `media:///${cleanPath}`;

    return (
        <div className="workspace-container">
            {/* Left Panel: Video Player */}
            <div className="video-panel">
                <button className="back-button" onClick={() => navigate('/session')}>
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
                <h2 style={{marginTop: '20px', fontFamily: 'Google Sans'}}>{videoData.name}</h2>
            </div>

            {/* Right Panel: Note Taking */}
            <div className="notes-panel">
                <div className="notes-header">
                    <h3 className="notes-title">Lecture Notes</h3>
                </div>

                <ReactQuill
                    theme="snow"
                    value={noteContent}
                    onChange={setNoteContent}
                    modules={modules}
                    formats={formats}
                    placeholder="Start typing your notes here... (You can paste images directly)"
                />
            </div>
        </div>
    );
}