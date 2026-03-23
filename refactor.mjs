import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'src');

const pagesDir = path.join(srcDir, 'pages');
const componentsDir = path.join(srcDir, 'components');

const moves = []; 
const mappingObj = {}; 

function scanAndPlan(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    if ((ext === '.jsx' || ext === '.js') && base !== 'index') {
      const oldFilePath = path.join(dir, file);
      const newDir = path.join(dir, base);
      const newFilePath = path.join(newDir, 'index' + ext);
      moves.push({ oldFilePath, newFilePath });
      mappingObj[oldFilePath] = newFilePath;
      
      const cssName = `${base}.module.css`;
      const oldCssPath = path.join(dir, cssName);
      if (fs.existsSync(oldCssPath)) {
        const newCssPath = path.join(newDir, 'index.module.css');
        moves.push({ oldFilePath: oldCssPath, newFilePath: newCssPath });
        mappingObj[oldCssPath] = newCssPath;
      }
    }
  });
}

scanAndPlan(pagesDir);
scanAndPlan(componentsDir);

// Move the files
moves.forEach(({ oldFilePath, newFilePath }) => {
  const dir = path.dirname(newFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.renameSync(oldFilePath, newFilePath);
});

function getAllSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllSourceFiles(filePath, fileList);
    } else if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const allSourceFiles = getAllSourceFiles(srcDir);

allSourceFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  const moveRecord = moves.find(m => m.newFilePath === filePath);
  const oldFilePath = moveRecord ? moveRecord.oldFilePath : filePath;

  function replacePath(match, p1, importPath, p3) {
    if (!importPath.startsWith('.')) return match;
    const targetOldPathExact = path.resolve(path.dirname(oldFilePath), importPath);
    
    let newTargetFilePath = targetOldPathExact;

    if (mappingObj[targetOldPathExact]) {
      newTargetFilePath = mappingObj[targetOldPathExact];
    } else if (mappingObj[targetOldPathExact + '.jsx']) {
      newTargetFilePath = mappingObj[targetOldPathExact + '.jsx'];
    } else if (mappingObj[targetOldPathExact + '.js']) {
      newTargetFilePath = mappingObj[targetOldPathExact + '.js'];
    } else if (mappingObj[targetOldPathExact + '/index.jsx']) {
      newTargetFilePath = mappingObj[targetOldPathExact + '/index.jsx'];
    } else if (mappingObj[targetOldPathExact + '.module.css']) {
      newTargetFilePath = mappingObj[targetOldPathExact + '.module.css'];
    }
    
    const newImporterDir = path.dirname(filePath);
    let relToNew = path.relative(newImporterDir, newTargetFilePath).replace(/\\/g, '/');
    if (!relToNew.startsWith('.')) relToNew = './' + relToNew;
    
    if (relToNew.endsWith('/index.jsx') || relToNew.endsWith('/index.js')) {
      relToNew = relToNew.replace(/\/index\.jsx?$/, '');
      if (relToNew === '.') relToNew = './';
    }
    
    if (relToNew !== importPath) {
      changed = true;
      return p1 + relToNew + p3;
    }
    return match;
  }

  content = content.replace(/(import\s+(?:[\w{}*,\s]+\s+from\s+)?['"])(.*?)(['"])/g, replacePath);
  content = content.replace(/(import\(['"])(.*?)(['"]\))/g, replacePath);
  content = content.replace(/(export\s+(?:[\w{}*,\s]+\s+from\s+)?['"])(.*?)(['"])/g, replacePath);

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
  }
});
console.log('Codemod completed. Total files moved: ' + moves.length + '. Source files processed: ' + allSourceFiles.length);
