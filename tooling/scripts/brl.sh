#!/bin/sh

# Change to the initial working directory
cd "$INIT_CWD" || { echo "Failed to change directory to $INIT_CWD"; exit 1; }

# Function to check if index.tsx exists and run barrelsby if it doesn't
run_barrelsby() {
    local dir="$1"
    shift  # Remove the first argument (dir) from the list
    if [ ! -f "$dir/index.tsx" ]; then
        local temp_index=""
        local temp_input_rules_index=""

        if [ -f "$dir/index.ts" ]; then
            temp_index="$dir/.index.ts.brl.bak"
            mv "$dir/index.ts" "$temp_index" || return 1
        fi

        if [ -f "$dir/lib/plugins/input-rules/index.ts" ]; then
            temp_input_rules_index="$dir/lib/plugins/input-rules/.index.ts.brl.bak"
            mv "$dir/lib/plugins/input-rules/index.ts" "$temp_input_rules_index" || return 1
        fi

        if barrelsby -d "$dir" "$@"; then
            if [ -n "$temp_index" ] && [ ! -f "$dir/index.ts" ]; then
                mv "$temp_index" "$dir/index.ts" || return 1
                [ -n "$temp_input_rules_index" ] && mv "$temp_input_rules_index" "$dir/lib/plugins/input-rules/index.ts"
                echo "barrelsby did not regenerate $dir/index.ts" >&2
                return 1
            fi

            [ -n "$temp_index" ] && rm -f "$temp_index"
            [ -n "$temp_input_rules_index" ] && rm -f "$temp_input_rules_index"
            return 0
        else
            [ -n "$temp_index" ] && mv "$temp_index" "$dir/index.ts"
            [ -n "$temp_input_rules_index" ] && mv "$temp_input_rules_index" "$dir/lib/plugins/input-rules/index.ts"
            return 1
        fi
    fi
}

common_excludes='.*__tests__.*|(.*(fixture|template|spec|slow|internal).*)|(.*\.d\.ts$)'

src_excludes="$common_excludes|(^.*\/(react|static)\/.*$)"

# Run barrelsby on the src directory if index.tsx doesn't exist
run_barrelsby "$INIT_CWD/src" -D -l all -q -e "$src_excludes"

# Check if the src/react directory exists and run barrelsby if it does and if index.tsx doesn't exist
if [ -d "$INIT_CWD/src/react" ]; then
    run_barrelsby "$INIT_CWD/src/react" -D -l all -q -e "$common_excludes"
fi

# Check if the src/static directory exists and run barrelsby if it does and if index.tsx doesn't exist
if [ -d "$INIT_CWD/src/static" ]; then
    run_barrelsby "$INIT_CWD/src/static" -D -l all -q -e "$common_excludes"
fi
