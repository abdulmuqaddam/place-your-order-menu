import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import type { MenuItem, StallData } from "@/types";

function uniqueNonEmpty(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

export async function fetchStall(stallId: string): Promise<StallData | null> {
  try {
    // Try by doc ID first
    const snap = await getDoc(doc(db, "stalls", stallId));
    if (snap.exists()) return snap.data() as StallData;

    // Fallback: query by ownerUid field
    const q = query(collection(db, "stalls"), where("ownerUid", "==", stallId));
    const qs = await getDocs(q);
    if (!qs.empty) return qs.docs[0].data() as StallData;

    return null;
  } catch {
    return null;
  }
}

export async function fetchMenu(stallId: string, ownerUid?: string): Promise<MenuItem[]> {
  try {
    const candidates = uniqueNonEmpty([stallId, ownerUid]);
    if (candidates.length === 0) return [];

    const q = candidates.length === 1
      ? query(collection(db, "menu"), where("stallId", "==", candidates[0]))
      : query(collection(db, "menu"), where("stallId", "in", candidates.slice(0, 10)));

    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as MenuItem))
      .filter((item) => item.available !== false);
  } catch {
    return [];
  }
}

export interface TableQrRow {
  id: string;
  tableNo?: number;
  token?: string;
  qrUrl?: string;
  qrValue?: string;
  active?: boolean;
}

export async function fetchTableQrs(stallId: string): Promise<{ ownerUid: string; rows: TableQrRow[] }> {
  try {
    const stall = await fetchStall(stallId);
    const ownerUid = stall?.ownerUid || stallId;

    const q = query(
      collection(db, "stalls", ownerUid, "table_qrs"),
      orderBy("tableNo", "asc")
    );

    const snap = await getDocs(q);
    const rows = snap.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableQrRow))
      .filter((row) => row.active !== false);

    return { ownerUid, rows };
  } catch {
    return { ownerUid: stallId, rows: [] };
  }
}
