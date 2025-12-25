import React, { useState, useRef } from 'react';
import { X, User as UserIcon, LogOut, Save, Loader2, RefreshCw, Camera, ChevronLeft, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user, updateUser, logout } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    // New State for Details View
    const [view, setView] = useState<'list' | 'details'>('list');
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

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

    const handleViewDetails = async (bookingId: string) => {
        setLoadingDetails(true);
        try {
            const details = await import('../services/api').then(m => m.api.hotels.getBookingDetails(bookingId));
            setBookingDetails(details);
            setView('details');
        } catch (e) {
            console.error(e);
            alert("Failed to load details.");
        } finally {
            setLoadingDetails(false);
        }
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
                <div className="bg-gray-900 p-4 text-white flex justify-between items-center relative">
                    {view === 'details' && (
                        <button
                            onClick={() => { setView('list'); setBookingDetails(null); }}
                            className="absolute left-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <h2 className="font-bold text-lg flex items-center gap-2 mx-auto">
                        <UserIcon size={20} /> {view === 'details' ? 'Booking Details' : 'Edit Profile'}
                    </h2>

                    <button onClick={onClose} className="absolute right-4 text-white/70 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">

                    {/* DETAILS VIEW */}
                    {view === 'details' && bookingDetails ? (
                        <div className="space-y-4 animate-in slide-in-from-right">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shadow-sm border border-gray-200">
                                    🏨
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{bookingDetails.accommodation.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{bookingDetails.accommodation.location?.address?.city_name || 'City Center'}</p>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-start gap-2">
                                    <span className="shrink-0 mt-0.5">📍</span>
                                    <span>
                                        {bookingDetails.accommodation.location?.address?.line_1}, {bookingDetails.accommodation.location?.address?.city_name}
                                        <br />
                                        <span className="text-xs text-gray-400">{bookingDetails.accommodation.location?.address?.postal_code}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="shrink-0">📅</span>
                                    <span>{new Date(bookingDetails.check_in_date).toLocaleDateString()} — {new Date(bookingDetails.check_out_date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="shrink-0">🛏️</span>
                                    <span>{bookingDetails.rooms} Room(s)</span>
                                </div>
                            </div>

                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 text-sm space-y-2">
                                <div className="flex justify-between font-bold text-gray-900">
                                    <span>Total Paid</span>
                                    <span>{bookingDetails.total_currency} {bookingDetails.total_amount}</span>
                                </div>
                                <div className="text-xs text-gray-500 pt-2 border-t border-brand-200/50 flex justify-between">
                                    <span>Duffel Reference:</span>
                                    <span className="font-mono">{bookingDetails.reference}</span>
                                </div>
                            </div>

                            {bookingDetails.guests && (
                                <div>
                                    <h4 className="font-bold text-sm mb-2 text-gray-700">Guests</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bookingDetails.guests.map((g: any, i: number) => (
                                            <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                                {g.given_name} {g.family_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* PROFILE FORM VIEW */
                        <>
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
                                                <div
                                                    key={idx}
                                                    onClick={() => key.bookingId && handleViewDetails(key.bookingId)}
                                                    className={`bg-white p-4 rounded-xl border border-gray-200 flex flex-col gap-3 text-sm transition-all shadow-sm ${key.bookingId ? 'cursor-pointer hover:shadow-md hover:border-brand-300 group' : ''}`}
                                                >
                                                    <div className="w-full flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-900 text-base group-hover:text-brand-700 transition-colors flex items-center gap-2">
                                                                {key.hotelName}
                                                                {key.bookingId && <ChevronLeft size={16} className="rotate-180 text-gray-300 group-hover:text-brand-500 transition-colors" />}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {new Date(key.checkIn).toLocaleDateString()} - {new Date(key.checkOut).toLocaleDateString()}
                                                            </div>
                                                        </div>

                                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${key.status === 'active' ? 'bg-green-100 text-green-700' :
                                                            key.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                                                                'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {key.status}
                                                        </div>
                                                    </div>

                                                    {/* Actions Row */}
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">

                                                        {/* Type / Instructions */}
                                                        <div className="flex-1">
                                                            {key.keyCollection && key.status === 'active' ? (
                                                                <div className="text-blue-700 text-xs flex items-center gap-1 bg-blue-50 px-2 py-1 rounded w-fit">
                                                                    <span>🔑 {key.keyCollection}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-brand-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    View Details &rarr;
                                                                </span>
                                                            )}
                                                        </div>

                                                        {key.status === 'active' && key.bookingId && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
                                                                    const btn = e.currentTarget;
                                                                    const originalText = btn.innerText;
                                                                    btn.innerText = 'Checking...';
                                                                    btn.disabled = true;

                                                                    try {
                                                                        // 1. Fetch Policy
                                                                        const details = await import('../services/api').then(m => m.api.hotels.getBookingDetails(key.bookingId!));

                                                                        // 2. Calculate Refund
                                                                        let refundText = "an unknown amount";
                                                                        if (details.cancellation_timeline && Array.isArray(details.cancellation_timeline)) {
                                                                            const now = new Date();
                                                                            // Find the explicit rule that applies right now
                                                                            const rule = details.cancellation_timeline.find((r: any) => new Date(r.before) > now);

                                                                            if (rule) {
                                                                                refundText = `${rule.currency} ${rule.refund_amount}`;
                                                                            } else {
                                                                                // If we are past the last 'before' date, usually it's non-refundable or 0
                                                                                refundText = `${details.total_currency} 0.00 (Non-Refundable)`;
                                                                            }
                                                                        }

                                                                        // 3. Confirm with Details
                                                                        if (confirm(`⚠ REFUND WARNING ⚠\n\nBased on the cancellation policy, if you cancel now you will receive: ${refundText}.\n\nThis action cannot be undone. Are you sure?`)) {
                                                                            await import('../services/api').then(m => m.api.hotels.cancelBooking(key.bookingId!));

                                                                            const updatedKeys = [...user.digitalKeys];
                                                                            updatedKeys[idx] = { ...key, status: 'cancelled' };
                                                                            updateUser({ digitalKeys: updatedKeys });
                                                                            alert('Booking cancelled.');
                                                                        }
                                                                    } catch (err: any) {
                                                                        console.error(err);
                                                                        alert('Failed to check policy: ' + err.message);
                                                                    } finally {
                                                                        btn.innerText = originalText;
                                                                        btn.disabled = false;
                                                                    }
                                                                }}
                                                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors font-medium z-10 disabled:opacity-50"
                                                            >
                                                                Cancel Booking
                                                            </button>
                                                        )}
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

                                <div className="mt-6 flex gap-3">
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
