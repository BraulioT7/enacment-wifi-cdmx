export interface WifiPoint {
  id: string;
  nombre: string;
  alcaldia: string;
  colonia: string;
  latitud: number;
  longitud: number;
  distancia?: number; // Para el cálculo de proximidad
  score?: number;     // Para la recomendación
}