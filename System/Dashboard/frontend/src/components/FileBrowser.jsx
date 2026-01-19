import { useState, useEffect } from 'react'
import { api } from '../utils/api'
import {
    Folder,
    File,
    ChevronRight,
    ChevronDown,
    Home,
    Save,
    X,
    Edit3
} from 'lucide-react'
import './FileBrowser.css'

export default function FileBrowser() {
    const [currentPath, setCurrentPath] = useState('')
    const [items, setItems] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [fileContent, setFileContent] = useState('')
    const [editing, setEditing] = useState(false)
    const [editContent, setEditContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadDirectory(currentPath)
    }, [currentPath])

    const loadDirectory = async (path) => {
        setLoading(true)
        try {
            const data = await api.getFiles(path)
            if (data.type === 'directory') {
                setItems(data.items)
                setSelectedFile(null)
                setFileContent('')
                setEditing(false)
            }
        } catch (error) {
            console.error('Failed to load directory:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleItemClick = async (item) => {
        if (item.isDirectory) {
            setCurrentPath(item.path)
        } else {
            setLoading(true)
            try {
                const data = await api.getFiles(item.path)
                if (data.type === 'file') {
                    setSelectedFile(item)
                    setFileContent(data.content)
                    setEditContent(data.content)
                    setEditing(false)
                }
            } catch (error) {
                console.error('Failed to load file:', error)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleSave = async () => {
        if (!selectedFile) return
        setSaving(true)
        try {
            await api.saveFile(selectedFile.path, editContent)
            setFileContent(editContent)
            setEditing(false)
        } catch (error) {
            console.error('Failed to save file:', error)
            alert('Failed to save file: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const navigateUp = () => {
        const parts = currentPath.split('/').filter(Boolean)
        parts.pop()
        setCurrentPath(parts.join('/'))
    }

    const pathParts = currentPath.split('/').filter(Boolean)

    return (
        <div className="file-browser">
            <div className="file-list card">
                <div className="file-list-header card-header">
                    <div className="breadcrumb">
                        <button
                            className="breadcrumb-item breadcrumb-home"
                            onClick={() => setCurrentPath('')}
                        >
                            <Home size={16} />
                        </button>
                        {pathParts.map((part, index) => (
                            <span key={index} className="breadcrumb-segment">
                                <ChevronRight size={14} className="breadcrumb-separator" />
                                <button
                                    className="breadcrumb-item"
                                    onClick={() => setCurrentPath(pathParts.slice(0, index + 1).join('/'))}
                                >
                                    {part}
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="file-list-content">
                    {currentPath && (
                        <button className="file-item file-item-up" onClick={navigateUp}>
                            <Folder size={18} className="file-icon folder" />
                            <span>..</span>
                        </button>
                    )}

                    {loading && !items.length ? (
                        <div className="file-list-loading">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        items.map((item) => (
                            <button
                                key={item.path}
                                className={`file-item ${selectedFile?.path === item.path ? 'active' : ''}`}
                                onClick={() => handleItemClick(item)}
                            >
                                {item.isDirectory ? (
                                    <Folder size={18} className="file-icon folder" />
                                ) : (
                                    <File size={18} className="file-icon" />
                                )}
                                <span className="file-name">{item.name}</span>
                                {!item.isDirectory && (
                                    <span className="file-size">{formatSize(item.size)}</span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            <div className="file-preview card">
                {selectedFile ? (
                    <>
                        <div className="file-preview-header card-header">
                            <div className="preview-title">
                                <File size={18} />
                                <span>{selectedFile.name}</span>
                            </div>
                            <div className="preview-actions">
                                {editing ? (
                                    <>
                                        <button
                                            className="btn btn-ghost"
                                            onClick={() => {
                                                setEditing(false)
                                                setEditContent(fileContent)
                                            }}
                                        >
                                            <X size={16} />
                                            Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            <Save size={16} />
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setEditing(true)}
                                    >
                                        <Edit3 size={16} />
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="file-preview-content">
                            {editing ? (
                                <textarea
                                    className="file-editor"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    spellCheck={false}
                                />
                            ) : (
                                <pre className="file-content">{fileContent}</pre>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="file-preview-empty">
                        <File size={48} className="empty-icon" />
                        <p>Select a file to preview</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
