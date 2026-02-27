const fs = require('fs');
const path = require('path');

// Data persistence paths
const DATA_DIR = path.join(__dirname, 'data');
const STATIONS_FILE = path.join(DATA_DIR, 'stations.json');
const SUSPECTS_FILE = path.join(DATA_DIR, 'suspects.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load data from files
const loadData = () => {
    try {
        const stations = fs.existsSync(STATIONS_FILE) ? JSON.parse(fs.readFileSync(STATIONS_FILE, 'utf8')) : [];
        const suspects = fs.existsSync(SUSPECTS_FILE) ? JSON.parse(fs.readFileSync(SUSPECTS_FILE, 'utf8')) : [];
        const properties = fs.existsSync(PROPERTIES_FILE) ? JSON.parse(fs.readFileSync(PROPERTIES_FILE, 'utf8')) : [];
        const cases = fs.existsSync(CASES_FILE) ? JSON.parse(fs.readFileSync(CASES_FILE, 'utf8')) : [];
        
        return { stations, suspects, properties, cases };
    } catch (error) {
        console.error('❌ Error loading data:', error);
        return { stations: [], suspects: [], properties: [], cases: [] };
    }
};

// Save data to files
const saveData = (stations, suspects, properties, cases) => {
    try {
        fs.writeFileSync(STATIONS_FILE, JSON.stringify(stations, null, 2));
        fs.writeFileSync(SUSPECTS_FILE, JSON.stringify(suspects, null, 2));
        fs.writeFileSync(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2));
        console.log('✅ Data saved to files');
    } catch (error) {
        console.error('❌ Error saving data:', error);
    }
};

module.exports = { loadData, saveData };
