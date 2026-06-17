# Seed script: creates sample categories and products for STOCKROOM
# Usage: powershell -ExecutionPolicy Bypass -File seed-data.ps1

$API = "http://localhost:8080/api"

Write-Host "`n=== STOCKROOM Seed Data ===" -ForegroundColor Cyan

# --- 1. Login as admin ---
Write-Host "`n[1/3] Logging in as admin..." -ForegroundColor Yellow
$loginBody = @{ email = "admin@ecommerce.com"; password = "Admin@123" } | ConvertTo-Json
try {
    $loginResponse = Invoke-RestMethod -Uri "$API/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "  OK - Got JWT token" -ForegroundColor Green
} catch {
    Write-Host "  FAILED - Could not login. Is the backend running?" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# --- 2. Create categories ---
Write-Host "`n[2/3] Creating categories..." -ForegroundColor Yellow

$categories = @(
    @{ name = "Electronics"; description = "Smartphones, laptops, tablets, and cutting-edge tech gadgets" }
    @{ name = "Fashion"; description = "Clothing, shoes, and accessories for men and women" }
    @{ name = "Home & Kitchen"; description = "Furniture, appliances, and home decor essentials" }
    @{ name = "Books"; description = "Bestsellers, novels, textbooks, and digital reads" }
    @{ name = "Sports & Outdoors"; description = "Fitness gear, outdoor equipment, and sportswear" }
)

$categoryIds = @{}
foreach ($cat in $categories) {
    $body = $cat | ConvertTo-Json
    try {
        $result = Invoke-RestMethod -Uri "$API/categories" -Method POST -ContentType "application/json" -Headers $headers -Body $body
        $categoryIds[$cat.name] = $result.id
        Write-Host "  Created: $($cat.name) (ID: $($result.id))" -ForegroundColor Green
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorResponse.message -match "already exists" -or $_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  Skipped: $($cat.name) (already exists)" -ForegroundColor DarkYellow
            # Try to get existing category ID
            try {
                $allCats = Invoke-RestMethod -Uri "$API/categories?size=100" -Method GET -ContentType "application/json"
                foreach ($c in $allCats.content) {
                    if ($c.name -eq $cat.name) {
                        $categoryIds[$cat.name] = $c.id
                        break
                    }
                }
            } catch {}
        } else {
            Write-Host "  Failed: $($cat.name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# --- 3. Create products ---
Write-Host "`n[3/3] Creating products..." -ForegroundColor Yellow

$products = @(
    # Electronics
    @{
        name = "iPhone 17 Pro Max"
        description = "The latest iPhone featuring the A19 Pro chip, 48MP camera system with 5x optical zoom, titanium design, and all-day battery life. Available in Natural Titanium."
        price = 1199.00
        quantity = 45
        categoryName = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop"
    }
    @{
        name = "MacBook Air M4"
        description = "Supercharged by the M4 chip with 10-core CPU and 10-core GPU. 15.3-inch Liquid Retina display, 24GB unified memory, and up to 18 hours of battery life."
        price = 1499.00
        quantity = 30
        categoryName = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"
    }
    @{
        name = "Sony WH-1000XM6 Headphones"
        description = "Industry-leading noise cancellation with Auto NC Optimizer. 40-hour battery, multipoint connection, and Hi-Res Audio. Supremely comfortable for all-day wear."
        price = 349.99
        quantity = 80
        categoryName = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop"
    }
    @{
        name = "Samsung Galaxy Tab S10"
        description = "12.4-inch Dynamic AMOLED 2X display, Snapdragon 8 Gen 3, S Pen included. Perfect for productivity, creativity, and entertainment on the go."
        price = 849.99
        quantity = 25
        categoryName = "Electronics"
        imageUrl = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop"
    }

    # Fashion
    @{
        name = "Classic Leather Jacket"
        description = "Handcrafted genuine leather jacket with a timeless biker silhouette. YKK zippers, quilted lining, and antique brass hardware. Fits true to size."
        price = 289.00
        quantity = 35
        categoryName = "Fashion"
        imageUrl = "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop"
    }
    @{
        name = "Premium Running Sneakers"
        description = "Engineered mesh upper with responsive foam midsole for maximum comfort. Reflective details, reinforced heel counter, and durable rubber outsole."
        price = 149.99
        quantity = 120
        categoryName = "Fashion"
        imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"
    }
    @{
        name = "Minimalist Watch - Rose Gold"
        description = "Swiss quartz movement with sapphire crystal glass. 38mm case in brushed rose gold, genuine Italian leather strap, and water-resistant to 50m."
        price = 199.00
        quantity = 60
        categoryName = "Fashion"
        imageUrl = "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop"
    }

    # Home & Kitchen
    @{
        name = "Smart Coffee Maker Pro"
        description = "WiFi-enabled drip coffee maker with built-in grinder. Schedule brews from your phone, adjustable strength, and thermal carafe keeps coffee hot for 4 hours."
        price = 179.99
        quantity = 40
        categoryName = "Home & Kitchen"
        imageUrl = "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&h=600&fit=crop"
    }
    @{
        name = "Scandinavian Floor Lamp"
        description = "Mid-century modern floor lamp with solid oak tripod base and linen drum shade. Warm ambient lighting with a dimmable LED bulb included. Height: 150cm."
        price = 129.00
        quantity = 55
        categoryName = "Home & Kitchen"
        imageUrl = "https://images.unsplash.com/photo-1561664701-5b89dafffdd5?w=600&h=600&fit=crop"
    }
    @{
        name = "Cast Iron Dutch Oven 6Qt"
        description = "Enameled cast iron dutch oven, perfect for slow cooking, braising, and baking artisan bread. Even heat distribution, oven-safe to 500°F. Lifetime warranty."
        price = 89.99
        quantity = 70
        categoryName = "Home & Kitchen"
        imageUrl = "https://plus.unsplash.com/premium_photo-1716450115556-4f5e381195ae?w=600&h=600&fit=crop"
    }

    # Books
    @{
        name = "Clean Code - Robert C. Martin"
        description = "A Handbook of Agile Software Craftsmanship. Essential reading for any developer who wants to write better, cleaner, more maintainable code. Paperback edition."
        price = 39.99
        quantity = 200
        categoryName = "Books"
        imageUrl = "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop"
    }
    @{
        name = "Atomic Habits - James Clear"
        description = "An Easy & Proven Way to Build Good Habits & Break Bad Ones. The #1 New York Times bestseller with over 15 million copies sold worldwide."
        price = 16.99
        quantity = 150
        categoryName = "Books"
        imageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop"
    }

    # Sports & Outdoors
    @{
        name = "Yoga Mat Premium 6mm"
        description = "Non-slip TPE yoga mat with alignment lines. Eco-friendly, hypoallergenic, and includes carrying strap. Perfect for yoga, pilates, and floor exercises."
        price = 45.99
        quantity = 90
        categoryName = "Sports & Outdoors"
        imageUrl = "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&h=600&fit=crop"
    }
    @{
        name = "Insulated Water Bottle 32oz"
        description = "Triple-wall vacuum insulated stainless steel bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid, fits standard cup holders."
        price = 34.99
        quantity = 110
        categoryName = "Sports & Outdoors"
        imageUrl = "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop"
    }
    @{
        name = "Trail Running Backpack 15L"
        description = "Ultralight hydration-compatible trail pack with breathable mesh back panel. Multiple pockets, trekking pole attachments, and emergency whistle. Weighs only 380g."
        price = 79.99
        quantity = 45
        categoryName = "Sports & Outdoors"
        imageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
    }
)

$created = 0
$skipped = 0

foreach ($prod in $products) {
    $catId = $categoryIds[$prod.categoryName]
    if (-not $catId) {
        Write-Host "  Skipped: $($prod.name) (category '$($prod.categoryName)' not found)" -ForegroundColor DarkYellow
        $skipped++
        continue
    }

    $body = @{
        name = $prod.name
        description = $prod.description
        price = $prod.price
        quantity = $prod.quantity
        categoryId = $catId
        imageUrl = $prod.imageUrl
    } | ConvertTo-Json

    try {
        $result = Invoke-RestMethod -Uri "$API/products" -Method POST -ContentType "application/json" -Headers $headers -Body $body
        Write-Host "  Created: $($prod.name) - `$$($prod.price) (ID: $($result.id))" -ForegroundColor Green
        $created++
    } catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorResponse.message -match "already exists" -or $_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  Skipped: $($prod.name) (may already exist)" -ForegroundColor DarkYellow
            $skipped++
        } else {
            Write-Host "  Failed: $($prod.name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Done! ===" -ForegroundColor Cyan
Write-Host "  Products created: $created" -ForegroundColor Green
Write-Host "  Products skipped: $skipped" -ForegroundColor DarkYellow
Write-Host "`nOpen http://localhost:8081 to see the storefront!" -ForegroundColor Cyan
