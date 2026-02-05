# PayBack - Cleanup unnecessary .md files and commit to GitHub
# Run this script from the PayBack directory

Write-Host "🧹 Cleaning up unnecessary .md files..." -ForegroundColor Cyan

# Remove unnecessary .md files from root
Remove-Item -Path "PROJECT_OVERVIEW.md" -ErrorAction SilentlyContinue
Remove-Item -Path "PROJECT_SUMMARY.md" -ErrorAction SilentlyContinue
Remove-Item -Path "QUICK_REFERENCE.md" -ErrorAction SilentlyContinue
Remove-Item -Path "TROUBLESHOOTING.md" -ErrorAction SilentlyContinue

# Remove entire docs folder
Remove-Item -Path "docs" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Remaining files:" -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.md" | Select-Object Name

Write-Host ""
Write-Host "🔄 Staging changes for git..." -ForegroundColor Cyan

# Add all changes to git
git add .

# Show status
git status

Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Cyan

# Commit with message
git commit -m "feat: cleanup unnecessary documentation files and add database initialization

- Removed PROJECT_OVERVIEW.md, PROJECT_SUMMARY.md, QUICK_REFERENCE.md, TROUBLESHOOTING.md
- Removed docs/ folder (API_TESTING.md, DEPLOYMENT.md, LOCAL_SETUP.md, SPRINT1_CHECKLIST.md)
- Added database/init.js for database initialization
- Updated db.js to always use SSL for Render PostgreSQL
- Fixed .env with complete Render database URL
- Kept only essential README.md for project documentation"

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Cyan

# Push to GitHub
git push origin main

Write-Host ""
Write-Host "✅ Done! All changes pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Summary:" -ForegroundColor Yellow
Write-Host "  - Cleaned up unnecessary .md files"
Write-Host "  - Committed changes with descriptive message"
Write-Host "  - Pushed to remote repository"
