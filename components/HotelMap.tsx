import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ScoredHotel } from '../types';
import { Star, ArrowRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icons in React (keep generic fallback)
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Create Price Marker Icon (External constant function to avoid recreation)
const createPriceIcon = (price: number, isSelected: boolean) => L.divIcon({
    className: 'bg-transparent', // Remove default leaflet square
    html: `
        <div class="${isSelected ? 'bg-gray-900 border-gray-900 z-50 scale-110' : 'bg-brand-600 border-white hover:bg-brand-700 hover:scale-105'} 
                    text-white font-bold px-2 py-1 rounded-lg shadow-md border-2 transition-transform cursor-pointer flex items-center justify-center text-xs whitespace-nowrap">
            € ${price}
        </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15] // Center it
});

interface HotelMapProps {
    hotels: ScoredHotel[];
    selectedHotel: ScoredHotel | null;
    onSelectHotel: (hotel: ScoredHotel) => void;
    onBook: (hotel: ScoredHotel) => void;
    className?: string;
}

// Helper to recenter map when selection changes
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    // Only update if center actually changes significantly (epsilon check could be added, but ref check from useMemo is enough)
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

// Memoized Marker Component to prevent re-rendering ALL markers when one is selected
const HotelMarker = React.memo(({ hotel, isSelected, onSelect, onBook }: {
    hotel: ScoredHotel;
    isSelected: boolean;
    onSelect: (h: ScoredHotel) => void;
    onBook: (h: ScoredHotel) => void;
}) => {
    return (
        <Marker
            position={[hotel.coordinates.lat, hotel.coordinates.lng]}
            icon={createPriceIcon(hotel.pricePerNight, isSelected)}
            eventHandlers={{
                click: () => onSelect(hotel)
            }}
        >
            <Popup>
                <div className="min-w-[200px] cursor-pointer" onClick={() => onSelect(hotel)}>
                    <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-24 object-cover rounded-t-lg mb-2"
                    />
                    <h3 className="font-bold text-sm text-gray-900 mb-1 hover:text-brand-600 transition-colors">{hotel.name}</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">{hotel.city}</span>
                        <span className="flex items-center text-xs font-bold text-amber-500">
                            <Star size={10} className="fill-amber-500 mr-1" /> {hotel.rating}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span className="font-bold text-brand-600">${hotel.pricePerNight}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onBook(hotel);
                            }}
                            className="bg-gray-900 text-white text-xs px-2 py-1.5 rounded flex items-center hover:bg-gray-800"
                        >
                            Book <ArrowRight size={10} className="ml-1" />
                        </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}, (prev, next) => {
    // Custom comparison: Only re-render if selection status changes or hotel data changes
    return prev.isSelected === next.isSelected && prev.hotel.id === next.hotel.id && prev.hotel.pricePerNight === next.hotel.pricePerNight;
});

const HotelMap: React.FC<HotelMapProps> = ({ hotels, selectedHotel, onSelectHotel, onBook, className }) => {
    // Default Center (Barcelona) if no hotels
    const defaultCenter: [number, number] = React.useMemo(() => [41.3851, 2.1734], []);

    const mapCenter: [number, number] = React.useMemo(() => {
        return selectedHotel
            ? [selectedHotel.coordinates.lat, selectedHotel.coordinates.lng]
            : (hotels.length > 0 ? [hotels[0].coordinates.lat, hotels[0].coordinates.lng] : defaultCenter);
    }, [selectedHotel, hotels, defaultCenter]);

    return (
        <div className={`w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 z-0 relative ${className || 'h-[600px]'}`}>
            <MapContainer
                center={mapCenter}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={mapCenter} zoom={13} />

                {hotels.map((hotel) => (
                    <HotelMarker
                        key={hotel.id}
                        hotel={hotel}
                        isSelected={selectedHotel?.id === hotel.id}
                        onSelect={onSelectHotel}
                        onBook={onBook}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default HotelMap;
