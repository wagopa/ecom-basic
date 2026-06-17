#!/bin/bash

# Seed script: creates sample categories and products for STOCKROOM on Linux / macOS
# Usage: chmod +x seed-data.sh && ./seed-data.sh

API="http://localhost:8080/api"

echo -e "\n=== STOCKROOM Seed Data ==="

# --- 1. Login as admin ---
echo -e "\n[1/3] Logging in as admin..."
LOGIN_BODY="{\"email\":\"admin@ecommerce.com\",\"password\":\"Admin@123\"}"

LOGIN_RES=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_BODY")

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo "  FAILED - Could not login. Is the backend running?"
  echo "  Response: $LOGIN_RES"
  exit 1
fi

echo "  OK - Got JWT token"
HEADERS_AUTH="Authorization: Bearer $TOKEN"

# --- 2. Create categories ---
echo -e "\n[2/3] Creating categories..."

create_category() {
  cat_name="$1"
  cat_desc="$2"
  
  BODY="{\"name\":\"$cat_name\",\"description\":\"$cat_desc\"}"
  res=$(curl -s -X POST "$API/categories" \
    -H "Content-Type: application/json" \
    -H "$HEADERS_AUTH" \
    -d "$BODY")
    
  id=$(echo "$res" | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')
  if [ -n "$id" ]; then
    echo "  Created: $cat_name (ID: $id)"
  else
    echo "  Skipped: $cat_name (already exists or failed)"
  fi
}

create_category "Electronics" "Smartphones, laptops, tablets, and cutting-edge tech gadgets"
create_category "Fashion" "Clothing, shoes, and accessories for men and women"
create_category "Home & Kitchen" "Furniture, appliances, and home decor essentials"
create_category "Books" "Bestsellers, novels, textbooks, and digital reads"
create_category "Sports & Outdoors" "Fitness gear, outdoor equipment, and sportswear"

# Fetch all categories to map names to IDs
ALL_CATS=$(curl -s -X GET "$API/categories?size=100")

get_cat_id() {
  target_name="$1"
  # Search for the id matching the category name
  # e.g., {"id":1,"name":"Electronics",...
  echo "$ALL_CATS" | grep -o "{\"id\":[0-9]*,\"name\":\"$target_name\"" | grep -o "\"id\":[0-9]*" | grep -o "[0-9]*$" | head -n 1
}

# --- 3. Create products ---
echo -e "\n[3/3] Creating products..."

create_product() {
  name="$1"
  desc="$2"
  price="$3"
  qty="$4"
  cat_name="$5"
  img_url="$6"
  
  cat_id=$(get_cat_id "$cat_name")
  if [ -z "$cat_id" ]; then
    echo "  Skipped: $name (category '$cat_name' not found)"
    return
  fi
  
  # Prepare JSON body safely using printf
  BODY=$(printf '{"name":"%s","description":"%s","price":%s,"quantity":%s,"categoryId":%s,"imageUrl":"%s"}' \
    "$name" "$desc" "$price" "$qty" "$cat_id" "$img_url")

  res=$(curl -s -X POST "$API/products" \
    -H "Content-Type: application/json" \
    -H "$HEADERS_AUTH" \
    -d "$BODY")
    
  prod_id=$(echo "$res" | grep -o '"id":[0-9]*' | grep -o '[0-9]*$')
  if [ -n "$prod_id" ]; then
    echo "  Created: $name - \$$price (ID: $prod_id)"
  else
    echo "  Skipped: $name (may already exist)"
  fi
}

# Electronics
create_product "iPhone 17 Pro Max" "The latest iPhone featuring the A19 Pro chip, 48MP camera system with 5x optical zoom, titanium design, and all-day battery life." "1199.00" "45" "Electronics" "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop"
create_product "MacBook Air M4" "Supercharged by the M4 chip with 10-core CPU and 10-core GPU. 15.3-inch Liquid Retina display, 24GB unified memory." "1499.00" "30" "Electronics" "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"
create_product "Sony WH-1000XM6 Headphones" "Industry-leading noise cancellation with Auto NC Optimizer." "349.99" "80" "Electronics" "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"
create_product "Samsung Galaxy Tab S10" "12.4-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3." "849.99" "25" "Electronics" "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop"

# Fashion
create_product "Classic Leather Jacket" "Handcrafted genuine leather jacket with a timeless biker silhouette." "289.00" "35" "Fashion" "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop"
create_product "Premium Running Sneakers" "Engineered mesh upper with responsive foam midsole." "149.99" "120" "Fashion" "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"
create_product "Minimalist Watch - Rose Gold" "Swiss quartz movement with sapphire crystal glass." "199.00" "60" "Fashion" "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop"

# Home & Kitchen
create_product "Smart Coffee Maker Pro" "WiFi-enabled drip coffee maker with built-in grinder." "179.99" "40" "Home & Kitchen" "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&h=600&fit=crop"
create_product "Scandinavian Floor Lamp" "Mid-century modern floor lamp with solid oak tripod base." "129.00" "55" "Home & Kitchen" "https://images.unsplash.com/photo-1561664701-5b89dafffdd5?w=600&h=600&fit=crop"
create_product "Cast Iron Dutch Oven 6Qt" "Enameled cast iron dutch oven, perfect for slow cooking." "89.99" "70" "Home & Kitchen" "https://plus.unsplash.com/premium_photo-1716450115556-4f5e381195ae?w=600&h=600&fit=crop"

# Books
create_product "Clean Code - Robert C. Martin" "A Handbook of Agile Software Craftsmanship." "39.99" "200" "Books" "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop"
create_product "Atomic Habits - James Clear" "An Easy & Proven Way to Build Good Habits & Break Bad Ones." "16.99" "150" "Books" "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"

# Sports & Outdoors
create_product "Yoga Mat Premium 6mm" "Non-slip TPE yoga mat with alignment lines." "45.99" "90" "Sports & Outdoors" "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop"
create_product "Insulated Water Bottle 32oz" "Triple-wall vacuum insulated stainless steel bottle." "34.99" "110" "Sports & Outdoors" "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop"
create_product "Trail Running Backpack 15L" "Ultralight hydration-compatible trail pack." "79.99" "45" "Sports & Outdoors" "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"

echo -e "\n=== Done! ==="
echo "Open http://localhost:8081 to see the storefront!"
