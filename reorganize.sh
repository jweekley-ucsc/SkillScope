#!/bin/bash

echo "🔁 Reorganizing SkillScope directory..."

# Create standard Flask folders
mkdir -p static
mkdir -p templates

# Move JS and CSS files into static/
mv frontend/static/*.js static/ 2>/dev/null
mv frontend/static/*.css static/ 2>/dev/null

# Move HTML files into templates/
mv templates/*.html templates/ 2>/dev/null

# Remove the now-empty folders
rmdir frontend/static 2>/dev/null
rmdir frontend 2>/dev/null

echo "✅ Reorganization complete."
echo "Static files now in:   ./static/"
echo "Template files now in: ./templates/"

