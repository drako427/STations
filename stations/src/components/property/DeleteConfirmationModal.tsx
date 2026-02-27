"use client";

import { X, Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    propertyName: string;
    isLoading?: boolean;
}

export default function DeleteConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    propertyName,
    isLoading = false 
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in">
            <div className="glass-card w-full max-w-sm mx-4 animate-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-500/10">
                            <AlertTriangle className="h-5 w-5 text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Delete Property</h2>
                            <p className="text-xs text-muted">This action cannot be undone</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-surface/50 transition-colors"
                        disabled={isLoading}
                    >
                        <X className="h-4 w-4 text-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                        <p className="text-sm text-white">
                            Are you sure you want to delete <span className="font-semibold text-rose-400">"{propertyName}"</span>?
                        </p>
                        <p className="text-xs text-muted mt-2">
                            This will permanently remove the property from the system.
                        </p>
                    </div>

                    {/* Warning Details */}
                    <div className="space-y-2 text-xs text-muted">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                            <span>Property data will be permanently lost</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                            <span>Associated images will be deleted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
                            <span>This action cannot be reversed</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-border">
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-surface/50 text-white rounded-lg text-sm font-medium hover:bg-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
