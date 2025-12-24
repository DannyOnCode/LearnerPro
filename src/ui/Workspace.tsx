import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './Workspace.css';

// --- Icons (Inline SVGs to match the look without external libraries) ---
const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;

// --- Quill Configuration ---
const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'link', 'image'
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
        }, 1000);
        return () => clearTimeout(timeoutId);
    }, [noteContent, videoData]);

    if (!videoData) {
        return <div className="error-screen">No video selected. <button onClick={() => navigate('/')}>Go Back</button></div>;
    }

    const cleanPath = videoData.path.replace(/\\/g, '/');
    const videoSrc = `media:///${cleanPath}`;

    return (
        <div className="workspace-layout">

            {/* 1. Left Navigation Rail (Matches the narrow sidebar in screenshot) */}
            <nav className="nav-rail">
                <div className="nav-item home-btn" onClick={() => navigate('/')} title="Back to Library">
                    <BackIcon />
                </div>
            </nav>

            {/* 2. Main Content Area (Video) */}
            <main className="main-stage">
                <div className="card-container video-card">
                    <div className="card-header">
                    </div>
                    <div className="video-content-area">
                        {/* Placeholder for "Add a source" look, but with actual video */}
                        <div className="video-responsive-wrapper">
                            <video
                                className="styled-video"
                                controls
                                autoPlay
                                src={videoSrc}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    </div>
                    <div className="card-header">
                    </div>
                </div>
            </main>

            {/* 3. Right Sidebar (Notes) */}
            <aside className="side-stage">
                <div className="card-container notes-card">

                    {/* Note Header */}
                    <div className="notes-header-row">
                        <div className="breadcrumbs">Note</div>
                        <div className="note-actions">
                            <span className="status-indicator">{savingStatus}</span>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="editor-wrapper">
                        <ReactQuill
                            theme="snow"
                            value={noteContent}
                            onChange={setNoteContent}
                            modules={modules}
                            formats={formats}
                            placeholder="Write your notes here..."
                        />
                    </div>
                </div>
            </aside>

        </div>
    );
}