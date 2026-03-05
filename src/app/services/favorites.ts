import { Injectable, signal } from '@angular/core';
import { WifiPoint } from '../interfaces/wifi.interface';
import { environment } from '../../environments/environment';

// Añadimos onSnapshot y query a las importaciones
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, doc, setDoc, onSnapshot, query, deleteDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private db: Firestore;
  public error = signal<string | null>(null);
  
  // NUEVO: Estado reactivo que contiene los IDs de todos los favoritos actuales
  public favoriteIds = signal<Set<string>>(new Set());

  constructor() {
    const app: FirebaseApp = initializeApp(environment.firebase);
    this.db = getFirestore(app);
    
    // Iniciar la sincronización tan pronto como el servicio se instancia
    this.syncFavorites();
  }

  // NUEVO: Método que lee de Firestore en tiempo real
  private syncFavorites(): void {
    const q = query(collection(this.db, 'favorites'));
    
    // onSnapshot escucha cambios continuos (agregados, eliminados) en la colección
    onSnapshot(q, (snapshot) => {
      const ids = new Set<string>();
      snapshot.forEach((doc) => ids.add(doc.id));
      this.favoriteIds.set(ids); // Actualiza la señal de Angular instantáneamente
    }, (error) => {
      console.error('[Firestore Sync Error]:', error);
      this.error.set('No se pudieron sincronizar los favoritos.');
    });
  }

  async saveFavorite(punto: WifiPoint): Promise<void> {
    this.error.set(null);

    if (!punto || !punto.id || !punto.latitud || !punto.longitud) {
      this.error.set('Estructura de datos rechazada: Faltan identificadores o coordenadas.');
      return;
    }

    try {
      const docRef = doc(collection(this.db, 'favorites'), String(punto.id));
      const payload = {
        id: String(punto.id),
        programa: punto.programa ? punto.programa.substring(0, 100) : 'N/A',
        alcaldia: punto.alcaldia || 'N/A',
        latitud: Number(punto.latitud),
        longitud: Number(punto.longitud),
        agregadoEn: new Date().toISOString()
      };

      await setDoc(docRef, payload);
      console.info(`[Transacción] Punto ${punto.id} persistido en Firestore.`);
    } catch (e: any) {
      console.error('[Firestore Error]:', e);
      this.error.set(e.message || 'Fallo de conexión al intentar guardar en la base de datos.');
    }
  }

  async removeFavorite(id: string): Promise<void> {
    this.error.set(null);
    try {
      const docRef = doc(this.db, 'favorites', String(id));
      await deleteDoc(docRef);
      console.info(`[Transacción] Punto ${id} eliminado de Firestore.`);
    } catch (e: any) {
      console.error('[Firestore Error]:', e);
      this.error.set('Fallo de conexión al intentar eliminar el favorito.');
    }
  }

}