import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WifiPoint } from '../interfaces/wifi.interface';
import { finalize } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WifiService {
  private http = inject(HttpClient);
  
  // Estado base
  private rawPoints = signal<WifiPoint[]>([]);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public filterAlcaldia = signal<string>('Todas');
  // Estado de interacción UI
  public selectedPoint = signal<WifiPoint | null>(null);
  // EXPOSICIÓN SEGURA: Señal de solo lectura para componentes externos
  public points = this.rawPoints.asReadonly();
  
  // Estado de geolocalización
  public userLocation = signal<{ lat: number; lng: number } | null>(null);

  // Derivación de alcaldías
  public alcaldiasDisponibles = computed(() => {
    const alcaldias = this.rawPoints().map(p => p.alcaldia);
    return ['Todas', ...new Set(alcaldias)].sort();
  });

  // Pipeline principal de datos: Filtra, calcula distancia, asigna score y ordena
  public filteredPoints = computed(() => {
    let points = this.rawPoints();
    const filter = this.filterAlcaldia();
    const userLoc = this.userLocation();
    
    // 1. Filtrado por Alcaldía
    if (filter !== 'Todas') {
      points = points.filter(p => p.alcaldia === filter);
    }

    // 2. Si no hay ubicación del usuario, retornamos los puntos filtrados tal cual
    if (!userLoc) return points;

    // 3. Aplicación de la heurística de proximidad (Haversine + Score)
    return points.map(p => {
      const distanciaKm = this.calculateHaversineDistance(
        userLoc.lat, userLoc.lng, p.latitud, p.longitud
      );
      
      // Heurística de Score: 0km = 100 puntos. El puntaje baja conforme aumenta la distancia.
      // Asumimos que más de 15km da un score cercano a 0.
      let score = 100 - (distanciaKm * (100 / 15)); 
      score = Math.max(0, Math.min(100, Math.round(score))); // Limitar entre 0 y 100

      return { ...p, distancia: distanciaKm, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0)); // Orden descendente por score
  });

  loadPoints(): void {
    this.loading.set(true);
    this.error.set(null); // <-- Corrección: Limpieza previa
    
    this.http.get<WifiPoint[]>('assets/data/wifi_cdmx.json')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.rawPoints.set(data),
        error: (err) => {
          console.error('Error HTTP:', err);
          this.error.set('No se pudo cargar el dataset local.');
        }
      });
  }

  requestUserLocation(): void {
    this.error.set(null); // <-- Corrección: Limpieza previa
    
    if (!navigator.geolocation) {
      this.error.set('Geolocalización no soportada por el navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLocation.set({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error('Error de geolocalización:', err);
        this.error.set('Permiso de ubicación denegado o no disponible.');
      }
    );
  }

  // Implementación del algoritmo Haversine
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; // Distancia en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}