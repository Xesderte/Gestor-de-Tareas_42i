const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = 'c:\\Users\\sardi\\Desktop\\Daniel\\Soy Henry\\Postulaciones\\Gestor-de-Tareas_42i';
const outputFilePath = path.join(rootDir, 'codigos.md');

// Use git to get all files tracked or untracked but not ignored
let files = [];
try {
  const trackedFiles = execSync('git ls-files -z', { cwd: rootDir, encoding: 'utf-8' }).split('\0').filter(Boolean);
  const untrackedFiles = execSync('git ls-files --others --exclude-standard -z', { cwd: rootDir, encoding: 'utf-8' }).split('\0').filter(Boolean);
  files = [...new Set([...trackedFiles, ...untrackedFiles])];
} catch (e) {
  console.error("Error using git", e);
  process.exit(1);
}

// Tree Generation
const tree = { name: 'Gestor-de-Tareas_42i', children: {} };

files.forEach(file => {
  const parts = file.split('/');
  let current = tree.children;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      current[part] = null;
    } else {
      if (!current[part]) {
        current[part] = { children: {} };
      }
      current = current[part].children;
    }
  }
});

let treeOutput = '```\n';
function printTree(nodeName, nodeInfo, prefix = '') {
  treeOutput += prefix + (prefix ? '├── ' : '') + nodeName + '\n';
  if (nodeInfo && nodeInfo.children) {
    const keys = Object.keys(nodeInfo.children);
    for (let i = 0; i < keys.length; i++) {
      const isLast = i === keys.length - 1;
      const childName = keys[i];
      const childPrefix = prefix + (prefix ? (isLast ? '    ' : '│   ') : '');
      const childPrefixForNode = prefix + (prefix ? (isLast ? '└── ' : '├── ') : (isLast ? '└── ' : '├── '));
      
      treeOutput += childPrefixForNode + childName + '\n';
      
      if (nodeInfo.children[childName]) {
          printChildren(nodeInfo.children[childName].children, childPrefix + (isLast ? '    ' : '│   '));
      }
    }
  }
}

function printChildren(children, prefix) {
    const keys = Object.keys(children);
    for (let i = 0; i < keys.length; i++) {
      const isLast = i === keys.length - 1;
      const childName = keys[i];
      const childPrefixForNode = prefix + (isLast ? '└── ' : '├── ');
      
      treeOutput += childPrefixForNode + childName + '\n';
      
      if (children[childName]) {
          printChildren(children[childName].children, prefix + (isLast ? '    ' : '│   '));
      }
    }
}


treeOutput += 'Gestor-de-Tareas_42i\n';
printChildren(tree.children, '');
treeOutput += '```\n\n';

let markdownOutput = '# Estructura del Proyecto\n\n' + treeOutput + '# Códigos de los archivos\n\n';

files.forEach(file => {
    // Skip binary files and some generic ignored files
    if (file.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|sqlite|sqlite3|db)$/)) return;
    
    const filePath = path.join(rootDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        markdownOutput += `## Ruta: Gestor-de-Tareas_42i/${file}\n\n`;
        markdownOutput += '```' + (file.split('.').pop() || '') + '\n';
        markdownOutput += content + '\n';
        markdownOutput += '```\n\n';
    } catch(e) {
        console.error(`Error reading ${file}`, e);
    }
});

fs.writeFileSync(outputFilePath, markdownOutput);
console.log('File created successfully.');
