const { MongoClient } = require('mongodb');

const client = new MongoClient('your_mongo_connection_string_here', {
    maxPoolSize: 5,
    minPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    maxIdleTimeMS: 30000
});

async function connect() {
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

module.exports = { connect };