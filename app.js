var map = L.map('map').setView([21.1458, 79.0882], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const url = 'http://localhost:3000';
const drawnLayer = new L.FeatureGroup().addTo(map);

const drawControl = new L.Control.Draw({
    draw: {
        polyline: true,
        polygon: false,
        marker: false,
        circlemarker: false,
        circle: false,
        rectangle: false,
    },
    edit: {
        featureGroup: drawnLayer,
    }
});

map.addControl(drawControl);

async function saveHighwayToDatabase(geoJSON, name) {
    try {
        const response = await fetch(`${url}/api/saveHighway`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, geometry: geoJSON }),
        });

        if (response.ok) {
            console.log('Highway saved successfully');
        } else {
            console.error('Error saving highway:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving highway:', error);
    }
}

async function deleteHighwayFromDatabase(geoJSON) {
    try {
        const response = await fetch(`${url}/api/deleteHighway`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ geometry: geoJSON }),
        });

        if (response.ok) {
            console.log('Highway deleted successfully');
        } else {
            console.error('Error deleting highway:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting highway:', error);
    }
}

//

// Function to load highways from the server
async function loadHighwaysFromDatabase() {
    try {
        const response = await fetch(`${url}/api/getAllHighways`);
        const data = await response.json();

        // Draw existing highways on the map
        data.forEach(highway => {
            const geoJSON = L.geoJSON(highway.geometry);
            geoJSON.bindPopup(highway.name);
            drawnLayer.addLayer(geoJSON);
        });
    } catch (error) {
        console.error('Error loading highways:', error);
    }
}

// Call the function to load highways on page load
loadHighwaysFromDatabase();

map.on('draw:created', function (e) {
    var type = e.layerType;
    var layer = e.layer;

    if (type === 'polyline') {
        drawnLayer.addLayer(layer);
        var highwayName = prompt('Enter highway name:');
        layer.bindPopup(highwayName);
        saveHighwayToDatabase(layer.toGeoJSON(), highwayName);
    }
});

map.on('draw:deleted', function (e) {
    deleteHighwayFromDatabase(e.layers.toGeoJSON());
});
