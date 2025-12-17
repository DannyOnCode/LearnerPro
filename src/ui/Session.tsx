import React, { useState, type FormEvent } from 'react';

// 1. Electron API Definition
declare global {
    interface Window {
        electron?: {
            // Updated to accept lectureName
            performLoginAndDownload: (url: string, lectureName: string) => void;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        require?: (module: string) => any;
    }
}

// 2. Styles (Unchanged from previous aesthetic update)
const styles: Record<string, React.CSSProperties> = {
    // Page Layout
    pageBackground: {
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        minWidth: '100vw',
        padding: '40px',
        fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#333',
        boxSizing: 'border-box',
    },
    // Top Navigation Bar
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
    },
    filterGroup: {
        display: 'flex',
        gap: '12px',
    },
    filterChip: {
        padding: '8px 24px',
        borderRadius: '100px',
        border: '1px solid #e0e0e0',
        background: '#fff',
        cursor: 'pointer',
        fontWeight: '500',
        fontSize: '14px',
        color: '#333',
        transition: 'background 0.2s',
    },
    createNewButton: {
        backgroundColor: '#1a73e8',
        color: '#fff',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '100px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: '400',
        marginBottom: '24px',
        color: '#202124',
    },
    // Grid
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
    },
    // Cards
    card: {
        backgroundColor: '#f8f9fa',
        borderRadius: '24px',
        border: '1px solid #e0e0e0',
        height: '240px',
        display: 'flex',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.1s',
        position: 'relative',
        overflow: 'hidden',
    },
    uploadCardContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: '16px',
        display: 'flex',
        color: '#1a73e8',
    },
    plusIconCircle: {
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: '#e8f0fe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
    },
    plusIcon: {
        fontSize: '32px',
        fontWeight: '400',
        color: '#1a73e8',
    },
    uploadText: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#444',
    },
    thumbnailSection: {
        width: '35%',
        backgroundColor: '#e1e3e6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    contentSection: {
        width: '65%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '500',
        margin: 0,
        lineHeight: '1.4',
        color: '#202124',
    },
    tag: {
        backgroundColor: '#e6f4ea',
        color: '#137333',
        padding: '4px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        alignSelf: 'flex-start',
    },
    progressSection: {
        width: '100%',
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: '#e0e0e0',
        borderRadius: '3px',
        marginBottom: '10px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        width: '75%',
        backgroundColor: '#1a73e8',
    },
    metaText: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#5f6368',
        fontWeight: '500',
    },
    // Modal Styles
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' },
    modalTitle: { margin: '0 0 8px 0', fontSize: '22px', fontWeight: '500' },
    modalSubtitle: { margin: '0 0 24px 0', fontSize: '14px', color: '#666' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '16px' }, // Increased gap for two inputs
    label: { fontSize: '12px', fontWeight: '600', color: '#5f6368', marginBottom: '4px', display: 'block' },
    input: { padding: '14px 16px', borderRadius: '12px', border: '1px solid #dadce0', fontSize: '16px', width: '100%', boxSizing: 'border-box', outline: 'none' },
    footer: { marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
    cancelButton: { background: 'none', border: 'none', color: '#5f6368', cursor: 'pointer', fontSize: '14px', fontWeight: '500', padding: '10px 20px' },
    submitButton: { backgroundColor: '#1a73e8', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', fontWeight: '500' }
};

// --- Interfaces ---
interface UrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    // UPDATED: Now accepts both URL and Name
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
            // Reset fields
            setUrl('');
            setName('');
            onClose();
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalTitle}>Add Source</h2>
                <p style={styles.modalSubtitle}>Enter the details for the new lecture.</p>

                <form onSubmit={handleSubmit}>
                    <div style={styles.inputGroup}>
                        {/* Name Input */}
                        <div>
                            <label style={styles.label}>LECTURE NAME</label>
                            <input
                                type="text"
                                placeholder="e.g. CS2109 Lecture 3"
                                style={styles.input}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        {/* URL Input */}
                        <div>
                            <label style={styles.label}>SOURCE URL</label>
                            <input
                                type="url"
                                placeholder="https://example.com/recording"
                                style={styles.input}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" style={styles.cancelButton} onClick={onClose}>Cancel</button>
                        <button type="submit" style={styles.submitButton}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Session() {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // UPDATED: Accepts name as second argument
    const handleUrlSubmit = (url: string, lectureName: string) => {
        console.log("Sending to Electron:", { url, lectureName });

        if (window.electron) {
            window.electron.performLoginAndDownload(url, lectureName);
        } else if (window.require) {
            const { ipcRenderer } = window.require('electron');
            // Pass object or multiple args depending on your main process listener
            ipcRenderer.send('process-url', { url, lectureName });
        } else {
            alert(`Simulating Electron send:\nName: ${lectureName}\nURL: ${url}`);
        }
    };

    return (
        <div style={styles.pageBackground}>
            {/* Top Bar */}
            <div style={styles.topBar}>
                <div style={styles.filterGroup}>
                    <button style={{...styles.filterChip, backgroundColor: '#e8f0fe', color: '#1967d2', border: 'none'}}>All</button>
                    <button style={styles.filterChip}>CS2109</button>
                </div>

                <button style={styles.createNewButton} onClick={() => setIsModalOpen(true)}>
                    Create new +
                </button>
            </div>

            <h2 style={styles.sectionTitle}>Recent Lectures</h2>

            {/* Grid */}
            <div style={styles.gridContainer}>

                {/* 1. New Lecture Card */}
                <div style={styles.card} onClick={() => setIsModalOpen(true)}>
                    <div style={styles.uploadCardContent}>
                        <div style={styles.plusIconCircle}>
                            <div style={styles.plusIcon}>+</div>
                        </div>
                        <span style={styles.uploadText}>Create new notebook</span>
                    </div>
                </div>

                {/* 2. Content Card */}
                <div style={styles.card}>
                    <div style={styles.thumbnailSection}>
                        <svg width="48" height="48" viewBox="0 0 24 24" stroke="#9aa0a6" strokeWidth="1.5" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>
                    <div style={styles.contentSection}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>CS2109 Lecture 2</h3>
                            <div style={styles.tag}>CS2109</div>
                        </div>
                        <div style={styles.progressSection}>
                            <div style={styles.progressBar}>
                                <div style={styles.progressFill}></div>
                            </div>
                            <div style={styles.metaText}>
                                <span>75% Complete</span>
                                <span>1:30h left</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Empty Placeholder */}
                <div style={{...styles.card, opacity: 0.5, cursor: 'default', borderStyle: 'dashed', backgroundColor: 'transparent'}}>
                    <div style={{...styles.uploadCardContent, color: '#aaa'}}>
                        <span>(Empty Slot)</span>
                    </div>
                </div>

                {/* 4. Empty Placeholder */}
                <div style={{...styles.card, opacity: 0.5, cursor: 'default', borderStyle: 'dashed', backgroundColor: 'transparent'}}>
                    <div style={{...styles.uploadCardContent, color: '#aaa'}}>
                        <span>(Empty Slot)</span>
                    </div>
                </div>

            </div>

            <UrlModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUrlSubmit}
            />
        </div>
    );
}