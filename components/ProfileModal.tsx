import React, { useState } from 'react';
import { X, User as UserIcon, LogOut, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user, updateUser, logout } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            await updateUser({ name, bio });
            onClose();
        } catch (error) {
            console.error("Failed to save profile", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        onClose();
    };

    if (!user) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <UserIcon size={20} /> Edit Profile
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            />
                            {/* Future: Add avatar upload overlay here */}
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-mono">{user.walletAddress ? 'Wallet Connected' : 'Social Login'}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                                placeholder="How should we call you?"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">This is what others will see in the chat.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Vibe Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none h-24"
                                placeholder="What's your vibe? (e.g. 'Here for techno and tacos')"
                                maxLength={100}
                            />
                            <div className="text-right text-[10px] text-gray-400">{bio.length}/100</div>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={handleLogout}
                            className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !name.trim()}
                            className="flex-[2] bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfileModal;
