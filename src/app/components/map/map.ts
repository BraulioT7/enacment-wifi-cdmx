import { Component, ElementRef, OnInit, ViewChild, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WifiService } from '../../services/wifi.service';
import * as L from 'leaflet';
import { WifiPoint } from '../../interfaces/wifi.interface';
import { FavoritesService } from '../../services/favorites';

// Corrección activa: Solución al bug de rutas de íconos en Angular + Webpack/Vite
const iconDefault = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrl: './map.scss'
})
export class WifiMap implements OnInit {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;
  
  private wifiService = inject(WifiService);
  private map!: L.Map;
  private markersGroup: L.LayerGroup = L.layerGroup();
  private userMarker: L.CircleMarker | null = null; // Referencia a tu ubicación
  private markersDictionary = new Map<string, L.Marker>();
  private favoritesService = inject(FavoritesService);
  private proximityRadar: L.Circle | null = null;

  constructor() {
    // El 'effect' rastrea automáticamente cualquier cambio en 'filteredPoints'
    effect(() => {
      const points = this.wifiService.filteredPoints();
      this.updateMarkers(points);
    });

    // Efecto 2: - Escucha la ubicación del usuario y mueve el mapa
    effect(() => {
      const loc = this.wifiService.userLocation();
      if (loc && this.map) {
        // 1. Mueve la cámara del mapa hacia el usuario con una animación suave
        this.map.flyTo([loc.lat, loc.lng], 14, { animate: true, duration: 1.5 });
        
        // 2. Dibuja un círculo rojo indicando "Tu ubicación"
        if (this.userMarker) {
          this.map.removeLayer(this.userMarker);
        }
        this.userMarker = L.circleMarker([loc.lat, loc.lng], {
          color: '#dc3545',
          fillColor: '#dc3545',
          fillOpacity: 0.8,
          radius: 8
        }).bindPopup('<b>📍 Tú estás aquí</b>').addTo(this.map);
        
        this.userMarker.openPopup();
      }
    });

    // Efecto 3: Escucha si el usuario hace clic en una tarjeta de recomendación
    effect(() => {
      const selected = this.wifiService.selectedPoint();
      if (selected && this.map) {
        // 1. Volar a la coordenada con zoom cercano (nivel 16)
        this.map.flyTo([selected.latitud, selected.longitud], 16, { animate: true, duration: 1 });

        // 2. Buscar el marcador en el diccionario y abrir su popup
        const targetMarker = this.markersDictionary.get(selected.id);
        if (targetMarker) {
          targetMarker.openPopup();
        }
      }
    });

    effect(() => {
      const loc = this.wifiService.userLocation();
      if (loc && this.map) {
        // Limpiar radar anterior
        if (this.proximityRadar) this.map.removeLayer(this.proximityRadar);

        // Dibujar el nuevo radar (Círculo de radio dinámico o fijo de 2km)
        this.proximityRadar = L.circle([loc.lat, loc.lng], {
          radius: 2000, // 2 kilómetros
          color: '#0056b3',
          fillColor: '#0056b3',
          fillOpacity: 0.08,
          weight: 1,
          dashArray: '5, 10', // Línea punteada para efecto radar
          interactive: false   // Que no bloquee clics en marcadores
        }).addTo(this.map);
      }
    });
  }

  ngOnInit(): void {
    this.initMap();
    //this.wifiService.loadPoints(); // Dispara la carga del JSON
  }

  private initMap(): void {
    // Coordenadas centrales de CDMX
    this.map = L.map(this.mapElement.nativeElement).setView([19.4326, -99.1332], 11);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    this.markersGroup.addTo(this.map);
  }

  private updateMarkers(points: WifiPoint[]): void {
    if (!this.map) return;
    this.markersGroup.clearLayers();
    this.markersDictionary.clear();
    
    points.forEach(p => {
      const isFav = this.favoritesService.favoriteIds().has(p.id);
      
      // 1. Construimos el bloque de métricas solo si existen
      let aiMetricsHtml = '';
      if (p.score !== undefined && p.distancia !== undefined) {
        aiMetricsHtml = `
          <div style="margin: 8px 0; padding: 5px; background: #f0fff4; border-radius: 4px; border: 1px solid #c3e6cb;">
            <b style="color: #28a745;">⭐ Score IA: ${p.score}/100</b><br>
            <small style="color: #666;">Distancia: ${p.distancia.toFixed(2)} km</small>
          </div>
        `;
      }

      const container = document.createElement('div');
      container.innerHTML = `
        <div style="font-family: sans-serif; min-width: 160px;">
          <b style="display: block; margin-bottom: 4px;">${p.programa}</b>
          <small style="color: #666;">${p.alcaldia}</small>
          
          ${aiMetricsHtml} <button id="btn-fav-${p.id}" class="popup-fav-btn" 
            style="width:100%; padding: 8px; margin-top: 5px; cursor:pointer; 
            background:${isFav ? '#28a745' : '#0056b3'}; color:white; border:none; border-radius:4px; font-weight: bold;">
            ${isFav ? '✅ Guardado' : '❤️ Guardar Favorito'}
          </button>
        </div>
      `;

      const btn = container.querySelector(`#btn-fav-${p.id}`);
      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isFav) {
          this.favoritesService.removeFavorite(String(p.id));
        } else {
          this.favoritesService.saveFavorite(p);
        }
      });

      const marker = L.marker([p.latitud, p.longitud])
        .bindPopup(container)
        .addTo(this.markersGroup);

        marker.on('click', () => {
          this.wifiService.selectedPoint.set(p); // Avisamos a Angular que este es el punto activo
        });

      this.markersDictionary.set(p.id, marker);
    });
  }

  

}