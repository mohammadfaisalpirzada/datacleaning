// This script renames teachers.xlsx to staffdata.xlsx in the correct public/data folder
const fs = require('fs');
const path = require('path');

const oldPath = path.join(__dirname, './public/data/teachers.xlsx');
const newPath = path.join(__dirname, './public/data/staffdata.xlsx');

fs.renameSync(oldPath, newPath);
console.log('Renamed teachers.xlsx to staffdata.xlsx');
