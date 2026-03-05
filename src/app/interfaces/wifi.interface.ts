export interface WifiPoint {
  id: string;
  programa: string;
  alcaldia: string;
  latitud: number;
  longitud: number;
  distancia?: number; // Para la IA
  score?: number;     // Para la IA
}