import React, { useState, useEffect, useRef } from 'react';
import { decisionService } from '../services/api';
import Modal from './Modal';

export default function AttachmentsSection({ decisionId }) {
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewFile, setPreviewFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (decisionId) {
            fetchAttachments();
        }
    }, [decisionId]);

    const fetchAttachments = async () => {
        try {
            setLoading(true);
            const data = await decisionService.getAttachments(decisionId);
            setAttachments(data || []);
        } catch (err) {
            console.error('Failed to fetch attachments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file) => {
        try {
            setUploading(true);
            setProgress(0);
            const formData = new FormData();
            formData.append('file', file);

            const newAttachment = await decisionService.uploadAttachment(decisionId, formData, (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(percentCompleted);
            });

            setAttachments(prev => [newAttachment, ...prev]);
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Upload failed:', err);
            const errorMsg = err.response?.data?.details || err.response?.data?.message || err.message;
            alert('Upload failed: ' + errorMsg);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (attachmentId) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) return;

        try {
            await decisionService.deleteAttachment(attachmentId);
            setAttachments(prev => prev.filter(a => a.id !== attachmentId));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Delete failed');
        }
    };

    const getFileIcon = (fileType, fileName) => {
        if (fileType?.includes('image') || fileName?.match(/\.(jpg|jpeg|png|gif)$/i)) return '🖼️';
        if (fileType?.includes('pdf') || fileName?.endsWith('.pdf')) return '📄';
        if (fileType?.includes('word') || fileName?.match(/\.(doc|docx)$/i)) return '📝';
        return '📎';
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = (file) => file.resource_type === 'image' || file.file_name.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPDF = (file) => file.file_name.endsWith('.pdf') || (file.resource_type === 'application' && file.file_name.endsWith('.pdf'));

    return (
        <section className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Attachments / Context Files
                </h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload
                </button>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />

            {uploading && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-3 p-2 border border-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gray-100 rounded"></div>
                            <div className="flex-1 h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : attachments.length === 0 ? (
                <div
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.className = "border-2 border-dashed border-blue-400 rounded-xl p-6 bg-blue-50 transition-all"; }}
                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.className = "border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 transition-all"; }}
                    onDrop={async (e) => {
                        e.preventDefault();
                        e.currentTarget.className = "border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 transition-all";
                        const file = e.dataTransfer.files[0];
                        if (file) await uploadFile(file);
                    }}
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 text-center cursor-pointer hover:border-blue-300 hover:bg-white transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-xs text-gray-500 font-medium">Drag & drop or Click to upload</p>
                    <p className="text-[10px] text-gray-400 mt-1">PDF, Images, DOCX (Max 10MB)</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {attachments.map((file) => (
                        <div
                            key={file.id}
                            className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                        >
                            <div className="text-xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg group-hover:bg-blue-50 transition-colors">
                                {getFileIcon(file.resource_type, file.file_name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-gray-900 truncate" title={file.file_name}>
                                    {file.file_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-gray-400 font-medium">{formatSize(file.file_size)}</span>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {new Date(file.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setPreviewFile(file)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                    title="View"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <a
                                    href={file.file_url}
                                    download={file.file_name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                    title="Download"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </a>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                    title="Delete"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewFile && (
                <Modal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    title={previewFile.file_name}
                >
                    <div className="flex flex-col items-center">
                        {isImage(previewFile) ? (
                            <img
                                src={previewFile.file_url}
                                alt={previewFile.file_name}
                                className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                            />
                        ) : isPDF(previewFile) ? (
                            <iframe
                                src={previewFile.file_url}
                                title={previewFile.file_name}
                                className="w-full h-[70vh] border-0 rounded-lg"
                            />
                        ) : (
                            <div className="p-12 text-center bg-gray-50 rounded-xl w-full">
                                <span className="text-4xl mb-4 block">📎</span>
                                <p className="text-sm text-gray-600 mb-4">Preview not available for this file type.</p>
                                <a
                                    href={previewFile.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Download to View
                                </a>
                            </div>
                        )}
                        <div className="mt-4 flex gap-4 w-full">
                            <a
                                href={previewFile.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                            >
                                Open Original
                            </a>
                        </div>
                    </div>
                </Modal>
            )}
        </section>
    );
}
