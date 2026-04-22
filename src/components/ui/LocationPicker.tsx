import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Position {
    lat: number;
    lng: number;
}

interface LocationPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    locationLabel?: string | null;
    onLocationSelect: (lat: number, lng: number) => void;
    isLoading?: boolean;
}

// Component to handle map click events
const MapClickHandler: React.FC<{
    onLocationSelect: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to recenter map
const RecenterMap: React.FC<{ position: Position }> = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);
    return null;
};

// Location display component (read-only map view)
export const LocationDisplay: React.FC<{
    latitude: number;
    longitude: number;
    label?: string;
    className?: string;
}> = ({ latitude, longitude, label, className = '' }) => {
    return (
        <div className={`rounded-xl overflow-hidden border border-secondary-200 ${className}`} style={{ position: 'relative', zIndex: 0 }}>
            <div className="h-48 relative" style={{ zIndex: 0 }}>
                <MapContainer
                    key={`preview-${latitude.toFixed(6)}-${longitude.toFixed(6)}`}
                    center={[latitude, longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    dragging={false}
                    zoomControl={false}
                    className="h-full w-full"
                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[latitude, longitude]} icon={customIcon} />
                </MapContainer>
            </div>
            {label && (
                <div className="p-3 bg-secondary-50 border-t border-secondary-200">
                    <div className="flex items-center gap-2 text-secondary-700">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="text-sm">{label}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Location picker modal component
export const LocationPickerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    initialLat?: number | null;
    initialLng?: number | null;
    onConfirm: (lat: number, lng: number) => void;
    isLoading?: boolean;
}> = ({ isOpen, onClose, initialLat, initialLng, onConfirm, isLoading }) => {
    // Default to Jakarta if no location provided
    const defaultLat = -6.2;
    const defaultLng = 106.816666;

    const [selectedPosition, setSelectedPosition] = useState<Position>({
        lat: initialLat ?? defaultLat,
        lng: initialLng ?? defaultLng,
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    // Reset position when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedPosition({
                lat: initialLat ?? defaultLat,
                lng: initialLng ?? defaultLng,
            });
            setLocationError(null);
        }
    }, [isOpen, initialLat, initialLng]);

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setSelectedPosition({ lat, lng });
        setLocationError(null);
    }, []);

    const getCurrentLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation tidak didukung oleh browser Anda');
            return;
        }

        setIsGettingLocation(true);
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setSelectedPosition({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Informasi lokasi tidak tersedia.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Permintaan lokasi timeout.');
                        break;
                    default:
                        setLocationError('Terjadi kesalahan saat mendapatkan lokasi.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    const handleConfirm = () => {
        onConfirm(selectedPosition.lat, selectedPosition.lng);
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pilih Lokasi" size="2xl">
            <div className="space-y-4">
                {/* Instructions */}
                <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200">
                    <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <p className="text-sm text-primary-700">
                        Klik pada peta untuk memilih lokasi, atau gunakan tombol "Gunakan Lokasi Saya" untuk mendapatkan lokasi saat ini.
                    </p>
                </div>

                {/* Get current location button */}
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        leftIcon={isGettingLocation ? Loader2 : Navigation}
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className={isGettingLocation ? 'animate-pulse' : ''}
                    >
                        {isGettingLocation ? 'Mendapatkan lokasi...' : 'Gunakan Lokasi Saya'}
                    </Button>
                    {locationError && (
                        <p className="text-sm text-danger-600">{locationError}</p>
                    )}
                </div>

                {/* Map - render only when modal is open */}
                <div className="h-[400px] rounded-xl overflow-hidden border border-secondary-200" style={{ position: 'relative', zIndex: 1 }}>
                    <MapContainer
                        key={`modal-map-${selectedPosition.lat}-${selectedPosition.lng}`}
                        center={[selectedPosition.lat, selectedPosition.lng]}
                        zoom={15}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedPosition.lat, selectedPosition.lng]} icon={customIcon} />
                        <MapClickHandler onLocationSelect={handleLocationSelect} />
                        <RecenterMap position={selectedPosition} />
                    </MapContainer>
                </div>

                {/* Selected coordinates */}
                <div className="p-3 bg-secondary-50 rounded-lg">
                    <p className="text-sm text-secondary-600">
                        <span className="font-medium">Koordinat terpilih:</span>{' '}
                        {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button onClick={handleConfirm} isLoading={isLoading} leftIcon={MapPin}>
                        Simpan Lokasi
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// Main LocationPicker component (inline with edit button only - no display)
export const LocationPicker: React.FC<LocationPickerProps> = ({
    latitude,
    longitude,
    locationLabel,
    onLocationSelect,
    isLoading,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleConfirm = (lat: number, lng: number) => {
        onLocationSelect(lat, lng);
        setIsModalOpen(false);
    };

    const hasLocation = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;

    return (
        <div className="space-y-3">
            {hasLocation ? (
                <LocationDisplay latitude={latitude!} longitude={longitude!} label={locationLabel || undefined} />
            ) : (
                <div className="h-48 rounded-xl border-2 border-dashed border-secondary-300 bg-secondary-50 flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-10 h-10 text-secondary-400 mx-auto mb-2" />
                        <p className="text-secondary-500 text-sm">Belum ada lokasi yang dipilih</p>
                    </div>
                </div>
            )}

            <Button
                type="button"
                variant="secondary"
                leftIcon={MapPin}
                onClick={() => setIsModalOpen(true)}
                className="w-full"
            >
                {hasLocation ? 'Ubah Lokasi' : 'Pilih Lokasi'}
            </Button>

            <LocationPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialLat={latitude}
                initialLng={longitude}
                onConfirm={handleConfirm}
                isLoading={isLoading}
            />
        </div>
    );
};

export default LocationPicker;
