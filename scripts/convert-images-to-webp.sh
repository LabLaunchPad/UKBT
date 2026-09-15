#!/bin/bash
# scripts/convert-images-to-webp.sh
# Convert UKBT monorepo JPEG images to WebP format at quality 85.
# Uses npx sharp if available; falls back to ImageMagick or cwebp.
# Run from the repository root directory.

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

UPPSALA_DIR="apps/web/public/media/uppsala-squad"
NORDIC_FILE="apps/web/public/media/nordic-smash-slide.jpg"
CONVERTED=0
FAILED=0

convert_jpeg_to_webp() {
    local input="$1"
    local output="${input%.jpg}.webp"
    local size_before=$(stat -c%s "$input" 2>/dev/null || stat -f%z "$input" 2>/dev/null || echo "0")

    if command -v npx &>/dev/null && npx sharp --version &>/dev/null 2>&1; then
        npx sharp -i "$input" -o "$output" -f webp --quality 85 2>/dev/null
    elif command -v magick &>/dev/null; then
        magick convert "$input" -quality 85 "$output" 2>/dev/null
    elif command -v cwebp &>/dev/null; then
        cwebp -q 85 "$input" -o "$output" 2>/dev/null
    else
        echo "ERROR: No conversion tool available (need npx sharp, magick, or cwebp)"
        return 1
    fi

    if [ -f "$output" ]; then
        local size_after=$(stat -c%s "$output" 2>/dev/null || stat -f%z "$output" 2>/dev/null || echo "0")
        echo "OK: $input -> $output ($size_before -> $size_after bytes)"
        CONVERTED=$((CONVERTED + 1))
    else
        echo "FAIL: $input (conversion produced no output)"
        FAILED=$((FAILED + 1))
    fi
}

echo "=== Converting uppsala-squad JPEGs to WebP ==="
if [ -d "$UPPSALA_DIR" ]; then
    for jpg in "$UPPSALA_DIR"/*.jpg; do
        [ -f "$jpg" ] || continue
        convert_jpeg_to_webp "$jpg"
    done
else
    echo "WARNING: Directory $UPPSALA_DIR not found"
fi

echo ""
echo "=== Converting nordic-smash-slide.jpg ==="
if [ -f "$NORDIC_FILE" ]; then
    convert_jpeg_to_webp "$NORDIC_FILE"
else
    echo "WARNING: $NORDIC_FILE not found"
fi

echo ""
echo "=== Summary ==="
echo "Converted: $CONVERTED"
echo "Failed: $FAILED"
