// This script deletes the update/page.tsx file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, './src/app/update/page.tsx');
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
  console.log('Deleted update/page.tsx');
} else {
  console.log('File not found: update/page.tsx');
}
