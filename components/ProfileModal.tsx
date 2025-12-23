import React, { useState, useRef } from 'react';
import { X, User as UserIcon, LogOut, Save, Loader2, RefreshCw, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user, updateUser, logout } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleShuffleAvatar = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file upload
        const newSeed = Math.random().toString(36).substring(7);
        const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
        updateUser({ avatar: newAvatar });
    };

    const compressAvatar = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 200; // Avatars don't need to be huge
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const compressed = await compressAvatar(file);
                updateUser({ avatar: compressed });
            } catch (err) {
                console.error("Failed to process avatar", err);
            }
        }
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

                        {/* Avatar Container */}
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-gray-100"
                            />

                            {/* Overlay: Upload (Default Hover) */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>

                            {/* Shuffle Button (Floating) */}
                            <button
                                onClick={handleShuffleAvatar}
                                className="absolute bottom-0 right-0 bg-white text-gray-700 p-1.5 rounded-full shadow-md hover:bg-brand-50 hover:text-brand-600 transition-colors border border-gray-200"
                                title="Shuffle Random Avatar"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />

                        <p className="text-xs text-gray-400 mt-3 font-mono flex items-center gap-1">
                            {user.walletAddress ? 'Wallet Connected' : 'Social Login'}
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">Click image to upload</span>
                        </p>
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

                        {/* DIGITAL KEYS / BOOKINGS SECTION */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">My Bookings</label>
                            {user.digitalKeys && user.digitalKeys.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                    {user.digitalKeys.map((key, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center text-sm">
                                            <div>
                                                <div className="font-bold text-gray-800">{key.hotelName}</div>
                                                <div className="text-xs text-gray-500">{new Date(key.checkIn).toLocaleDateString()} - {new Date(key.checkOut).toLocaleDateString()}</div>
                                            </div>
                                            <div className="flex items-center gap-2">

                                                {key.status === 'active' && (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (!key.bookingId) return alert("Cannot cancel legacy booking (missing ID)");
                                                            if (confirm('Are you sure you want to CANCEL this booking? This checks you out immediately.')) {
                                                                try {
                                                                    await import('../services/api').then(m => m.api.hotels.cancelBooking(key.bookingId!));

                                                                    // Update local state to show Cancelled
                                                                    const updatedKeys = [...user.digitalKeys];
                                                                    updatedKeys[idx] = { ...key, status: 'cancelled' };
                                                                    updateUser({ digitalKeys: updatedKeys });
                                                                    alert('Booking cancelled successfully.');
                                                                } catch (err: any) {
                                                                    console.error(err);
                                                                    alert('Failed to cancel: ' + err.message);
                                                                }
                                                            }
                                                        }}
                                                        className="px-2 py-1 bg-white text-red-500 border border-red-200 rounded text-xs hover:bg-red-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                <div className={`px-2 py-1 rounded text-xs font-bold ${key.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    key.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {key.status === 'active' ? 'Active' : key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center border border-dashed border-gray-200">
                                    No active bookings found.
                                </div>
                            )}
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
        </div >
    );
};

export default ProfileModal;
