import PocketBase from 'pocketbase';

const pb = new PocketBase('https://pocketbase-production-ad14.up.railway.app');

// Superuser credentials
const EMAIL = 'agarwalyash041@gmail.com';
const PASSWORD = 'Yash@244221';

// Function to authenticate the superuser
async function authenticate() {
    try {
        await pb.collection('_superusers').authWithPassword(EMAIL, PASSWORD);
        console.log('Authentication successful');
    } catch (error) {
        console.error('Authentication failed:', error.message);
        process.exit(1);
    }
}

// Function to fetch all records from the 'destinations' collection
async function fetchAllDestinations() {
    try {
        const records = await pb.collection('destinations').getFullList({
            sort: '-created', // Sort by creation date (newest first)
        });

        console.log('Fetched destinations:', records);
        return records;
    } catch (error) {
        console.error('Error fetching destinations:', error.message);
    }
}

// Main execution function
async function run() {
    await authenticate(); // Authenticate first
    await fetchAllDestinations(); // Fetch records after authentication
}

run();
