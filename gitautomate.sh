# Navigate to the project root
# cd path/to/your/project

# Initialize Git repository
git init

# Create README file
# echo "# Distance Calculator" > README.md

# Create .gitignore file
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "frontend/node_modules/" >> .gitignore
echo "backend/node_modules/" >> .gitignore

# Add all files to staging area
git add .

# Commit changes
git commit -m "Initial commit with frontend and backend"

# Add remote URL (replace with your actual URL)
git remote add origin https://github.com/vijay-Jonathan/distance_calculator.git

# Push changes to GitHub
git push -u origin master