import Dexie from 'dexie';
import axios from 'axios';

// Inisialisasi IndexedDB menggunakan Dexie.js (sesuai aturan wajib #10 dan frontend-ui.md)
// JANGAN PERNAH gunakan localStorage / sessionStorage untuk antrean offline medis.
export const db = new Dexie('NutriSyncOfflineDB');

db.version(1).stores({
    bloodSugarQueue: '++id, client_uuid, synced, created_at',
    nutritionQueue: '++id, client_uuid, synced, created_at',
});

/**
 * Menambahkan data ke dalam antrean offline lokal (IndexedDB).
 * @param {'bloodSugar'|'nutrition'} type - Tipe antrean
 * @param {Object} payload - Data log yang akan disimpan
 * @returns {Promise<number>} ID record di IndexedDB
 */
export async function addToQueue(type, payload) {
    const store = type === 'bloodSugar' ? db.bloodSugarQueue : db.nutritionQueue;
    
    // Setiap entri WAJIB punya client_uuid untuk idempotency saat sync ke backend
    const entry = {
        ...payload,
        client_uuid: payload.client_uuid || crypto.randomUUID(),
        synced: 0, // 0 = false (belum sinkron), 1 = true (sudah sinkron)
        created_at: new Date().toISOString(),
    };

    const id = await store.add(entry);
    notifyQueueChange();
    return id;
}

/**
 * Mengambil jumlah total item yang belum tersinkronisasi.
 * Dipakai untuk indikator UI eksplisit ("X data belum tersinkron") di PatientLayout/Dashboard.
 * @returns {Promise<number>}
 */
export async function getUnsyncedCount() {
    const bsCount = await db.bloodSugarQueue.where('synced').equals(0).count();
    const nutCount = await db.nutritionQueue.where('synced').equals(0).count();
    return bsCount + nutCount;
}

/**
 * Mengirimkan semua data offline yang belum tersinkron ke backend.
 * Kalau sync gagal (network error), entri JANGAN dihapus dari queue lokal — biarkan tetap synced: 0.
 */
export async function syncQueue() {
    if (!navigator.onLine) return { success: false, reason: 'offline' };

    let syncedCount = 0;

    // 1. Sync Gula Darah
    try {
        const unsyncedBS = await db.bloodSugarQueue.where('synced').equals(0).toArray();
        if (unsyncedBS.length > 0) {
            const response = await axios.post('/patient/blood-sugar/sync-offline', {
                logs: unsyncedBS.map(({ id, synced, created_at, ...data }) => data),
            });

            if (response.status === 200 || response.status === 201) {
                const ids = unsyncedBS.map((item) => item.id);
                // Tandai sudah tersinkron atau hapus dari queue aktif
                await db.bloodSugarQueue.bulkDelete(ids);
                syncedCount += ids.length;
            }
        }
    } catch (error) {
        // Biarkan tetap di queue dengan synced: 0 sesuai aturan medis tidak boleh hilang
        console.warn('[OfflineSync] Gagal menyinkronkan data gula darah:', error?.message);
    }

    // 2. Sync Nutrisi
    try {
        const unsyncedNut = await db.nutritionQueue.where('synced').equals(0).toArray();
        if (unsyncedNut.length > 0) {
            const response = await axios.post('/patient/nutrition/sync-offline', {
                logs: unsyncedNut.map(({ id, synced, created_at, ...data }) => data),
            });

            if (response.status === 200 || response.status === 201) {
                const ids = unsyncedNut.map((item) => item.id);
                await db.nutritionQueue.bulkDelete(ids);
                syncedCount += ids.length;
            }
        }
    } catch (error) {
        console.warn('[OfflineSync] Gagal menyinkronkan data nutrisi:', error?.message);
    }

    notifyQueueChange();
    return { success: true, syncedCount };
}

/**
 * Memicu event custom agar komponen UI (indikator offline) tahu ada perubahan antrean.
 */
function notifyQueueChange() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nutrisync:queue-updated'));
    }
}

// Trigger sync otomatis saat browser kembali online (aturan wajib frontend-ui.md)
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.info('[OfflineSync] Koneksi pulih. Memulai sinkronisasi otomatis...');
        syncQueue();
    });
}
