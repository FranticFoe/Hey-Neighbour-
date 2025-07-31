import { useEffect, useRef, useState } from "react";

export default function GoogleMapDisplay({ userLocation, communities, onJoinCommunity }) {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef([]);

    const loadGoogleMaps = (apiKey) => {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve(window.google.maps);
                return;
            }

            const existingScript = document.getElementById("googleMapsScript");
            if (existingScript) {
                existingScript.onload = () => resolve(window.google.maps);
                return;
            }

            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
            script.id = "googleMapsScript";
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.google.maps);
            script.onerror = reject;
            document.body.appendChild(script);
        });
    };

    useEffect(() => {
        if (!userLocation) return;

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        loadGoogleMaps(apiKey)
            .then(() => {
                initializeMap();
            })
            .catch((err) => {
                console.error("Failed to load Google Maps script:", err);
            });
    }, [userLocation]);

    useEffect(() => {
        if (map && communities.length > 0) {
            addCommunityMarkers();
        }
    }, [map, communities]);

    const initializeMap = () => {
        if (!mapRef.current || !userLocation) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 13,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                },
                {
                    featureType: "transit",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ],
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
        });

        // Add user location marker
        new window.google.maps.Marker({
            position: userLocation,
            map: mapInstance,
            title: "Your Location",
            icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
            },
        });

        // Add user location circle
        new window.google.maps.Circle({
            strokeColor: "#4285F4",
            strokeOpacity: 0.3,
            strokeWeight: 2,
            fillColor: "#4285F4",
            fillOpacity: 0.1,
            map: mapInstance,
            center: userLocation,
            radius: 1000, // 1km radius
        });

        setMap(mapInstance);
    };

    const addCommunityMarkers = () => {
        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        communities.forEach((community, index) => {
            const marker = new window.google.maps.Marker({
                position: {
                    lat: community.latitude,
                    lng: community.longitude,
                },
                map: map,
                title: community.community_name,
                icon: {
                    url: `${window.location.origin}/house_Marker.png`,
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 40),
                },
                animation: window.google.maps.Animation.DROP,
            });

            const infoWindow = new window.google.maps.InfoWindow({
                content: createInfoWindowContent(community, index),
                maxWidth: 280,
            });

            marker.addListener("click", () => {
                infoWindow.open(map, marker);

                // Add event listener for join button after DOM is ready
                setTimeout(() => {
                    const joinButton = document.getElementById(`join-${community.community_name}`);
                    if (joinButton) {
                        joinButton.addEventListener("click", () => {
                            onJoinCommunity(community.community_name);
                            infoWindow.close();
                        });
                    }
                }, 100);
            });

            // Add hover effects
            marker.addListener("mouseover", () => {
                marker.setAnimation(window.google.maps.Animation.BOUNCE);
            });

            marker.addListener("mouseout", () => {
                marker.setAnimation(null);
            });

            markersRef.current.push(marker);
        });

        // Adjust map bounds to show all markers
        if (communities.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(userLocation);
            communities.forEach(community => {
                bounds.extend({ lat: community.latitude, lng: community.longitude });
            });
            map.fitBounds(bounds);

            // Ensure minimum zoom level
            const listener = window.google.maps.event.addListener(map, "idle", () => {
                if (map.getZoom() > 16) map.setZoom(16);
                window.google.maps.event.removeListener(listener);
            });
        }
    };

    const createInfoWindowContent = (community, index) => {
        const hue = (index * 137.5) % 360;

        return `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 16px;
                border-radius: 12px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                max-width: 260px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, hsl(${hue}, 70%, 60%) 0%, hsl(${hue}, 70%, 40%) 100%);
                    border-radius: 50%;
                    margin: 0 auto 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    font-weight: bold;
                ">
                    🏘️
                </div>
                
                <h4 style="
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #2c3e50;
                    line-height: 1.3;
                ">
                    ${community.community_name}
                </h4>
                
                <p style="
                    font-size: 12px;
                    color: #6c757d;
                    margin: 0 0 16px 0;
                    line-height: 1.4;
                ">
                    Join this community to connect with neighbors and participate in local activities
                </p>
                
                <button id="join-${community.community_name}" style="
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                " 
                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(40, 167, 69, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(40, 167, 69, 0.3)';">
                    ✨ Join Community
                </button>
            </div>
        `;
    };

    return (
        <div
            ref={mapRef}
            style={{
                height: "500px",
                width: "100%",
                borderRadius: "0",
                position: "relative"
            }}
            className="google-map-container"
        />
    );
}