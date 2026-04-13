# QR Scan System - Testing Guide

## Step-by-Step Testing

### 1️⃣ React Native App (MyFirstApp) - Create QR Codes

```
App Flow:
├─ Navigate to "Table QR Management" (Owner tab)
├─ Enter number of tables (e.g., 12)
├─ Click "Save & Generate QR Codes"
└─ QR codes created with URL: http://192.168.1.4:3000/{stallId}/{tableNo}
```

**Example QR URL:**
```
http://192.168.1.4:3000/user123abc/1
                         ↑         ↑
                      ownerUid  tableNo
```

### 2️⃣ Next.js Web App (customer-menu-app) - Handle QR Scan

**Current Route Structure:**
```
/[stallId]/[tableId]
├─ Shows WelcomePage (5 sec countdown)
└─ Redirects to → /[stallId]/[tableId]/menu
```

**When QR is scanned:**
```
http://192.168.1.4:3000/user123abc/1
                        ↓
                Matched with [stallId]=[user123abc], [tableId]=[1]
                       ↓
            WelcomePage shows (5 seconds)
                       ↓
            Redirects to /user123abc/1/menu
                       ↓
            Fetches menu from Firebase: collection("menu")
            where: stallId === "user123abc" AND available === true
```

### 3️⃣ Firebase Menu Data Structure

**Required Collection:** `menu`

**Required Fields:**
```javascript
{
  stallId: "user123abc",        // Owner's UID
  name: "Chai",                 // Item name
  price: 50,                    // Price in Rs
  category: "Drinks",           // Category
  available: true,              // Must be TRUE to show
  unit: "cup",                  // Optional: piece, cup, plate, etc.
  description: "...",           // Optional
  image: "url_to_image"         // Optional
}
```

### 4️⃣ Quick Testing Steps

#### Option A: Add Test Items from Web App
1. Scan a QR code from your phone
2. Next.js web app will show "Menu Not Available"
3. Click **"🧪 Add Test Items"** button
4. Sample menu items will be added to Firebase
5. Refresh browser or go back and scan again
6. Menu should now show!

#### Option B: Add Items from React Native App
1. Open MyFirstApp
2. Go to "Menu Management" (Owner tab)
3. Add menu items:
   - Name: Chai
   - Price: 50
   - Category: Drinks
   - Unit: cup
4. Click Save
5. Items are saved to collection("menu") with stallId = your ownerUid
6. Now scan QR on web app - menu will show!

#### Option C: Manually Add to Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Create collection "menu" (if it doesn't exist)
5. Add document with:
```json
{
  "stallId": "YOUR_OWNER_UID",
  "name": "Chai",
  "price": 50,
  "category": "Drinks",
  "available": true,
  "unit": "cup"
}
```

### 5️⃣ Debug Information

When menu is empty, the web app shows:
- **Stall ID** - Your ownerUid from auth
- **Table ID** - Table number from QR
- **Business Name** - From your stall profile

If Debug Info shows different Stall IDs → Firebase query won't find items!

### 6️⃣ Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Menu shows "No items" | No items in Firebase | Add items using any method above |
| Items not showing | `available: false` | Set to `true` in Firebase |
| Wrong stall appears | stallId mismatch | Check ownerUid matches in menu items |
| Different URL IP | Development issue | Update `WEB_BASE_URL` in TableQrManagementScreen.js |

### 7️⃣ URL Format Reference

**React Native generates:**
```javascript
// In TableQrManagementScreen.js
WEB_BASE_URL = 'http://192.168.1.4:3000'
buildQrValue(stallId, tableNo) → `${WEB_BASE_URL}/${stallId}/${tableNo}`
// Result: http://192.168.1.4:3000/user123abc/1
```

**Next.js expects:**
```
Route: [stallId]/[tableId]
User IP visits: http://192.168.1.4:3000/user123abc/1
Params parsed: { stallId: "user123abc", tableId: "1" }
```

### 8️⃣ Testing Checklist

- [ ] QR codes generated in React Native app
- [ ] QR code links format correct: `http://192.168.1.4:3000/{stallId}/{tableNo}`
- [ ] Menu items added to Firebase (collection("menu"))
- [ ] Menu items have `stallId`, `available: true`
- [ ] Scan QR from phone - WelcomePage appears
- [ ] After 5 sec - Menu page loads
- [ ] Menu items display correctly
- [ ] Can add items to cart and place order

---

## Development Notes

### File Locations
- **React Native QR Generation:** `src/screens/owner/TableQrManagementScreen.js`
- **Next.js Menu Page:** `src/app/[stallId]/[tableId]/menu/MenuClient.tsx`
- **Firebase Config:** `src/lib/firestore.ts`
- **Types:** `src/types/index.ts`

### Key Functions
- `fetchStall(stallId)` - Gets business info from "stalls" collection
- `fetchMenu(stallId)` - Gets items from "menu" collection where stallId matches
