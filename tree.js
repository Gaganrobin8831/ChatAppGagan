const fs = require('fs');
const path = require('path');

function displayTree(dir, depth = 0, exclude = ['node_modules', 'dist']) {
  const basename = path.basename(dir);
  if (exclude.includes(basename)) return;

  console.log('  '.repeat(depth) + basename);
  const entries = fs.readdirSync(dir);

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    if (fs.lstatSync(fullPath).isDirectory()) {
      displayTree(fullPath, depth + 1, exclude);
    }
  });
}

// Start from the current directory
displayTree(process.cwd());
