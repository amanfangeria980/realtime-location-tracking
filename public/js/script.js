const socket = io();
let userName = "";

// Prompt for user name when page loads
window.addEventListener("load", () => {
    userName = prompt("Please enter your name:", "Anonymous");
    if (!userName || userName.trim() === "") {
        userName = "Anonymous";
    }

    // Start location tracking after getting the name
    startLocationTracking(userName);
});

function startLocationTracking(name) {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("send-location", {
                    latitude,
                    longitude,
                    name,
                });
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    }
}

const map = L.map("map").setView([0, 0], 16);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    attribution:
        "Made with ❤️ by <a href='https://github.com/amanfangeria980' target='_blank'>Aman Fangeria</a>",
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, latitude, longitude, name } = data;
    map.setView([latitude, longitude]);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        // Update the popup content in case name changed
        markers[id].getPopup().setContent(name);
    } else {
        markers[id] = L.marker([latitude, longitude])
            .bindPopup(name, { permanent: true, direction: "bottom" })
            .addTo(map)
            .openPopup();
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
