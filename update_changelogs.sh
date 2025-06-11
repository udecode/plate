#!/bin/bash

# Function to update a single changelog
update_changelog() {
    local file="$1"
    local package_name=$(echo "$file" | sed 's|packages/||' | sed 's|/CHANGELOG.md||')
    
    echo "Updating $file..."
    
    # Check if file exists and has content
    if [[ ! -f "$file" || ! -s "$file" ]]; then
        echo "Skipping $file - file doesn't exist or is empty"
        return
    fi
    
    # Update package name from @udecode/plate-* to @platejs/*
    sed -i '' "1s|# @udecode/plate-$package_name|# @platejs/$package_name|" "$file"
    
    # Find the latest v48 version and add old package heading above it
    local latest_v48=$(grep -n "^## 48\." "$file" | head -1 | cut -d: -f1)
    
    if [[ -n "$latest_v48" ]]; then
        # Insert old package heading before the latest v48 version
        sed -i '' "${latest_v48}i\\
\\
# @udecode/plate-$package_name\\
\\
" "$file"
    fi
}

# Export the function so it can be used by xargs
export -f update_changelog

# Find all CHANGELOG.md files except udecode, ai, and core (already done) and process them
find packages -name "CHANGELOG.md" -not -path "packages/udecode/*" -not -path "packages/ai/*" -not -path "packages/core/*" | while read file; do
    update_changelog "$file"
done

echo "Done updating all changelogs!" 