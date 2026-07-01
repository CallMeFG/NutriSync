#!/usr/bin/env bash
# Hook untuk merapikan kode JS/CSS/HTML menggunakan Biome
FILE=$(jq -r .tool_input.file_path)
case "$FILE" in
  *.js|*.css|*.html|*.blade.php)
    npx @biomejs/biome format --write "$FILE" ;;
esac