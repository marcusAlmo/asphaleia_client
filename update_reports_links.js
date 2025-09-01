const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'dashboard.html',
  'attendance.html',
  'entry.html',
  'machines.html',
  'student-management.html',
  'teacher-management.html',
  'settings.html'
];

const reportsLinkRegex = /(\s*<li>\s*<a href="reports\.html"[\s\S]*?<\/a>\s*<\/li>)/g;
const replacement = '\n          <!-- Reports link hidden until ready -->\n          <!-- $1 -->';

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(reportsLinkRegex, replacement);
    
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});
