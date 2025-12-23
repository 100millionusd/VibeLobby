import React, { useState, useEffect, useRef } from 'react';
import { ScoredHotel, RoomOffer, GuestDetails } from '../types';
import { X, Calendar, CheckCircle, ShieldCheck, ArrowRight, Bed, Users, CreditCard, Loader2, ChevronLeft, Lock, AlertCircle } from 'lucide-react';
import { duffelService } from '../services/duffelService';
import { useAuth } from '../contexts/AuthContext';
import { getEnv } from '../utils/env';

interface BookingModalProps {
  hotel: ScoredHotel;
  interest: string;
  searchParams: {
    checkIn: Date;
    checkOut: Date;
    guestCount: number;
    roomCount: number;
  };
  onClose: () => void;
  onConfirm: () => void;
}

type BookingStep = 'search' | 'selection' | 'details' | 'payment' | 'confirmed';

const BookingModal: React.FC<BookingModalProps> = ({ hotel, interest, searchParams, onClose, onConfirm }) => {
  const { grantDigitalKey } = useAuth();
  const [step, setStep] = useState<BookingStep>('search');

  // Data State
  const [offers, setOffers] = useState<RoomOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<RoomOffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({ firstName: '', lastName: '', email: '' });
  const [bookingRef, setBookingRef] = useState('');

  // Duffel Component State
  const duffelContainerRef = useRef<HTMLDivElement>(null);
  const [duffelInstance, setDuffelInstance] = useState<any>(null);

  // 1. On Mount: Simulate Searching Availability via Duffel
  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      try {
        const rooms = await duffelService.searchAccommodations(
          hotel,
          searchParams.checkIn,
          searchParams.checkOut,
          searchParams.roomCount,
          searchParams.guestCount
        );
        setOffers(rooms);
        setStep('selection');
      } catch (e) {
        console.error("Duffel Search Failed", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffers();
  }, [hotel]);

  // 2. Initialize Duffel Components when reaching payment step
  useEffect(() => {
    if (step === 'payment' && duffelContainerRef.current) {
      // NOTE: In production, use your actual Duffel Public Key
      const DUFFEL_PUBLIC_KEY = getEnv('VITE_DUFFEL_PUBLIC_KEY') || 'test_123_placeholder_key';

      try {
        if (window.DuffelComponents) {
          const duffel = window.DuffelComponents.createCardComponent({
            clientKey: DUFFEL_PUBLIC_KEY,
            intent: 'tokenize',
            styles: {
              input: {
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '12px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#111827',
                boxShadow: 'none',
              },
              inputFocused: {
                borderColor: '#e11d48',
                boxShadow: '0 0 0 1px #e11d48',
              },
              label: {
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#6b7280',
                marginBottom: '4px',
              }
            }
          });
          duffel.mount(duffelContainerRef.current);
          setDuffelInstance(duffel);

          return () => {
            // Cleanup if user navigates back
            if (duffel) duffel.unmount();
          };
        } else {
          setErrorMsg("Payment system failed to load. Please check your connection.");
        }
      } catch (err) {
        console.error("Duffel Load Error", err);
        // Fallback for demo if key is invalid
        setErrorMsg("Demo Mode: Duffel Key not configured.");
      }
    }
  }, [step]);

  // Handler: Select Room
  const handleSelectOffer = (offer: RoomOffer) => {
    setSelectedOffer(offer);
    setStep('details');
  };

  // Handler: Submit Details & Move to Payment
  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestDetails.firstName && guestDetails.email) {
      setStep('payment');
    }
  };

  // Handler: Process Payment & Create Order via Backend Service
  const handlePay = async () => {
    if (!selectedOffer) return;
    setIsLoading(true);
    setErrorMsg(null);

    // Real Dates from Search
    const checkIn = searchParams.checkIn;
    const checkOut = searchParams.checkOut;

    try {
      let paymentToken = "tok_visa_simulation";

      // 1. Tokenize Card via Duffel Component
      if (duffelInstance) {
        try {
          const result = await duffelInstance.createCardToken();
          if (result.error) {
            throw new Error(result.error.message);
          }
          paymentToken = result.token;
        } catch (e: any) {
          // Fallback for demo purposes if the API key is invalid/placeholder
          // In production, you would throw here: throw e;
          console.warn("Duffel Tokenization failed (expected without valid key). Using mock token.");
          paymentToken = "tok_mock_fallback";
        }
      }

      // 2. Call our Backend Integration Service
      const confirmation = await duffelService.bookHotel(
        hotel,
        selectedOffer.id,
        guestDetails,
        paymentToken,
        checkIn,
        checkOut
      );

      if (confirmation.success) {
        setBookingRef(confirmation.data.booking_reference);

        // 3. Trigger the "Unlock Logic" in AuthContext
        grantDigitalKey(confirmation);

        setStep('confirmed');
      }
    } catch (e: any) {
      console.error("Payment Failed", e);
      setErrorMsg(e.message || "Payment declined. Please check your card details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    onConfirm(); // Close modal and open chat
  };

  // --- RENDER HELPERS ---

  // Header Logic
  const renderHeader = () => (
    <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {step !== 'search' && step !== 'selection' && step !== 'confirmed' && (
          <button onClick={() => setStep(prev => prev === 'payment' ? 'details' : 'selection')} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
        )}
        <h2 className="font-bold text-lg text-gray-900">
          {step === 'confirmed' ? 'Booking Confirmed' : 'Secure Booking'}
        </h2>
      </div>
      {step !== 'confirmed' && (
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <X size={20} />
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">

        {renderHeader()}

        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1: SEARCHING (Loading) */}
          {step === 'search' && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 size={40} className="animate-spin text-brand-600" />
              <p className="text-gray-500 font-medium animate-pulse">Checking real-time availability...</p>
            </div>
          )}

          {/* STEP 2: ROOM SELECTION */}
          {step === 'selection' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex gap-4">
                <img src={hotel.images[0]} className="w-16 h-16 rounded-lg object-cover" alt="" />
                <div>
                  <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Calendar size={12} className="mr-1" /> Oct 14 - Oct 17 (3 Nights)
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">Select a Room</h3>
              {offers.map(offer => (
                <div
                  key={offer.id}
                  onClick={() => handleSelectOffer(offer)}
                  className="border border-gray-200 rounded-xl p-4 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{offer.name}</h4>
                    <span className="font-bold text-brand-600">${offer.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{offer.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Bed size={14} /> {offer.bedType}</span>
                    <span className="flex items-center gap-1"><Users size={14} /> Max {offer.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 3: GUEST DETAILS */}
          {step === 'details' && selectedOffer && (
            <form onSubmit={handleSubmitDetails} className="space-y-5">
              <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 flex justify-between items-center">
                <div>
                  <div className="text-xs text-brand-700 font-bold uppercase">Selected Room</div>
                  <div className="font-bold text-gray-900">{selectedOffer.name}</div>
                </div>
                <div className="text-xl font-bold text-brand-600">${selectedOffer.price}</div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                    <input
                      required
                      type="text"
                      value={guestDetails.firstName}
                      onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      placeholder="e.g. Alice"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                    <input
                      required
                      type="text"
                      value={guestDetails.lastName}
                      onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      placeholder="e.g. Wonderland"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    value={guestDetails.email}
                    onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="alice@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number (Mobile)</label>
                  <input
                    required
                    type="tel"
                    value={guestDetails.phoneNumber || ''}
                    onChange={e => setGuestDetails({ ...guestDetails, phoneNumber: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="+44 7911 123456"
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg mt-4 flex justify-center items-center">
                Continue to Payment <ArrowRight size={18} className="ml-2" />
              </button>
            </form>
          )}

          {/* STEP 4: PAYMENT (Duffel Components) */}
          {step === 'payment' && selectedOffer && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900">${selectedOffer.price}</div>
                <div className="text-sm text-gray-500">Total due now (Merchant: {hotel.name})</div>
              </div>

              {/* Container for Duffel Components Iframe */}
              <div className="bg-white p-1">
                <div ref={duffelContainerRef} id="duffel-payment-container" className="min-h-[200px]"></div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2 animate-in fade-in">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : `Pay $${selectedOffer.price} & Book`}
              </button>

              <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                <Lock size={10} /> Payments processed securely via Duffel
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMED */}
          {step === 'confirmed' && (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-in zoom-in duration-500">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-500 mb-2">You're going to {hotel.city}!</p>

              <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 mb-8 font-mono text-sm text-gray-600">
                Ref: <span className="font-bold text-gray-900">{bookingRef}</span>
              </div>

              <div className="w-full bg-brand-50 border border-brand-100 p-4 rounded-xl mb-6 text-left">
                <div className="font-bold text-brand-800 text-sm mb-1 flex items-center gap-2">
                  <ShieldCheck size={16} /> Digital Key Activated
                </div>
                <p className="text-xs text-brand-600">
                  You have been automatically verified. You can now access the {interest} lobby chat.
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center"
              >
                Join Lobby Chat <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BookingModal;