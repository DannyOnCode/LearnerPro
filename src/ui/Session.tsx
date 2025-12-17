import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './Session.css';

interface VideoFile {
    name: string;
    path: string;
}

declare global {
    interface Window {
        electron?: {
            performLoginAndDownload: (url: string, lectureName: string) => void;
            getVideos: () => Promise<VideoFile[]>;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        require?: (module: string) => any;
    }
}

// --- Interfaces ---
interface UrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (url: string, lectureName: string) => void;
}

// --- Components ---

const UrlModal: React.FC<UrlModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [url, setUrl] = useState<string>('');
    const [name, setName] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (url.trim() && name.trim()) {
            onSubmit(url, name);
            setUrl('');
            setName('');
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Add Source</h2>
                <p className="modal-subtitle">Enter the details for the new lecture.</p>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div>
                            <label className="input-label">LECTURE NAME</label>
                            <input
                                type="text"
                                placeholder="e.g. CS2109 Lecture 3"
                                className="input-field"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">SOURCE URL</label>
                            <input
                                type="url"
                                placeholder="https://example.com/recording"
                                className="input-field"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-submit">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Session() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [videos, setVideos] = useState<VideoFile[]>([]);
    const navigate = useNavigate();

    const loadVideos = useCallback(async () => {
        if (window.electron && window.electron.getVideos) {
            try {
                const files = await window.electron.getVideos();
                setVideos(files);
            } catch (error) {
                console.error("Failed to load videos:", error);
            }
        }
    }, []);

    const handleVideoClick = (video: VideoFile) => {
        // Navigate to workspace and pass the video data via "state"
        navigate('/workspace', { state: video });
    };

    const handleUrlSubmit = (url: string, lectureName: string) => {
        console.log("Sending to Electron:", { url, lectureName });
        if (window.electron) {
            window.electron.performLoginAndDownload(url, lectureName);

            // Refresh the list after 5 seconds to see the new file
            setTimeout(() => {
                loadVideos();
            }, 5000);
        } else if (window.require) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { ipcRenderer } = window.require('electron') as any;
            ipcRenderer.send('process-url', { url, lectureName });
        } else {
            alert(`Simulating Electron send:\nName: ${lectureName}\nURL: ${url}`);
        }
    };

    useEffect(() => {
        const fetchVideos = async () => {
            if (window.electron && window.electron.getVideos) {
                try {
                    const files = await window.electron.getVideos();
                    setVideos(files);
                } catch (error) {
                    console.error("Failed to load videos:", error);
                }
            }
        };

        fetchVideos();
    }, []);

    return (
        <div className="page-background">
            {/* Top Bar */}
            <div className="top-bar">
                <div className="filter-group">
                    {/* Using the 'active' class for the selected state */}
                    <button className="filter-chip active">All</button>
                    <button className="filter-chip">CS2109</button>
                </div>

                <button className="create-new-button" onClick={() => setIsModalOpen(true)}>
                    Create new +
                </button>
            </div>

            <h2 className="section-title">Recent Lectures</h2>

            {/* Grid */}
            <div className="grid-container">

                {/* 1. New Lecture Card (Always First) */}
                <div className="card" onClick={() => setIsModalOpen(true)}>
                    <div className="upload-card-content">
                        <div className="plus-icon-circle">
                            <div className="plus-icon">+</div>
                        </div>
                        <span className="upload-text">Create new notebook</span>
                    </div>
                </div>

                {/* 2. Dynamically Render Videos from Folder */}
                {videos.map((video, index) => (
                    <div key={index}
                         className="card"
                         onClick={() => handleVideoClick(video)}>
                        <div className="thumbnail-section">
                            {/* Generic File Icon */}
                            <svg width="48" height="48" viewBox="0 0 24 24" stroke="#9aa0a6" strokeWidth="1.5" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div className="content-section">
                            <div className="card-header">
                                {/* Remove extension for display title */}
                                <h3 className="card-title">{video.name.replace(/\.[^/.]+$/, "")}</h3>
                                <div className="tag">Video</div>
                                <div className="tag">Test</div>
                            </div>

                            {/* Progress Bar Placeholder */}
                            <div className="progress-section">
                                <div className="progress-bar">
                                    {/* Keep width inline as it is dynamic */}
                                    <div className="progress-fill" style={{ width: '0%' }}></div>
                                </div>
                                <div className="meta-text">
                                    <span>Not Started</span>
                                    <span>--:--</span>
                                </div>
                            </div>

                        </div>
                    </div>
                ))}

                {/* 3. Empty Placeholders */}
                {videos.length === 0 && (
                    // Using combined classes for empty state
                    <div className="card empty">
                        <div className="upload-card-content empty-text">
                            <span>No lectures found</span>
                        </div>
                    </div>
                )}
            </div>

            <UrlModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUrlSubmit}
            />
        </div>
    );
}