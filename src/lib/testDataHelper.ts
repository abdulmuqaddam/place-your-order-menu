import { collection, addDoc, serverTimestamp, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TEST_MENU_ITEMS = [
  { name: "Chai", category: "Drinks", price: 50, unit: "cup" },
  { name: "Anda Roti", category: "Fast Food", price: 100, unit: "piece" },
  { name: "Samosa", category: "Fast Food", price: 30, unit: "piece" },
  { name: "Biryani", category: "Desi", price: 250, unit: "plate" },
  { name: "Lassi", category: "Drinks", price: 80, unit: "glass" },
];

/**
 * Add test menu items to a stall (for development/testing)
 * Usage: Call this once per stall to populate test data
 */
export async function addTestMenuItems(stallId: string) {
  try {
    console.log(`Adding test menu items for stall: ${stallId}`);
    
    const menuRef = collection(db, "menu");
    
    for (const item of TEST_MENU_ITEMS) {
      await addDoc(menuRef, {
        ...item,
        stallId,
        available: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    console.log(`✅ Added ${TEST_MENU_ITEMS.length} test menu items`);
    return true;
  } catch (error) {
    console.error("Error adding test menu items:", error);
    return false;
  }
}

/**
 * Clear all menu items for a stall (use with caution!)
 */
export async function clearMenuItems(stallId: string) {
  try {
    const q = query(collection(db, "menu"), where("stallId", "==", stallId));
    const snapshot = await getDocs(q);
    
    let deleted = 0;
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "menu", docSnap.id));
      deleted++;
    }
    
    console.log(`🗑️ Deleted ${deleted} menu items`);
    return deleted;
  } catch (error) {
    console.error("Error clearing menu items:", error);
    return 0;
  }
}

/**
 * Get menu count for a stall
 */
export async function getMenuItemCount(stallId: string): Promise<number> {
  try {
    const q = query(collection(db, "menu"), where("stallId", "==", stallId));
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting menu count:", error);
    return 0;
  }
}
