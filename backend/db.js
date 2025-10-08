
const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, 'database.json');

async function readDb() {
  try {
    const data = await fs.promises.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, initialize it with an empty array of sessions
      await writeDb({ sessions: [] });
      return { sessions: [] };
    }
    console.error('Error reading database:', error);
    throw error;
  }
}

async function writeDb(data) {
  try {
    await fs.promises.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to database:', error);
    throw error;
  }
}

module.exports = { readDb, writeDb };
