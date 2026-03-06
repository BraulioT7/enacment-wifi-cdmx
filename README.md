# GeoWifi CDMX - Enacment App Developer

![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Live Demo:** [https://braulio-enacment-wificdmx.web.app](https://braulio-enacment-wificdmx.web.app/)

## Visión General del Proyecto

GeoWifi CDMX es una aplicación web progresiva diseñada para localizar, puntuar y gestionar puntos de acceso WiFi públicos en la Ciudad de México. Construida como resolución al reto técnico de Enacment, la arquitectura prioriza el rendimiento, la reactividad moderna y una experiencia de usuario (UX) sin fricciones.



## Arquitectura Técnica

El proyecto está construido bajo los estándares más recientes del framework:

* **Angular 19 Standalone Components:** Eliminación total de `NgModules` para un árbol de dependencias más limpio y un empaquetado optimizado (Tree-shaking).
* **Gestión de Estado Reactivo (Signals):** Implementación de Angular Signals (`signal`, `computed`, `effect`) para el flujo de datos unidireccional, reemplazando a RxJS en el manejo de estado síncrono local (Favoritos y UI).
* **Change Detection `OnPush`:** Optimización del ciclo de renderizado, limitando las comprobaciones del DOM estrictamente a cuando las referencias de los Signals o Inputs cambian.
* **Lazy Loading nativo:** Carga diferida de la vista del mapa mediante el nuevo enrutador Standalone.

## "El Toque Personal": Heurística de Proximidad

Para cumplir con el requerimiento de análisis espacial, se descartó el uso de distancias lineales planas a favor de la **Fórmula del Semiverseno (Haversine)**. 

Esta fórmula calcula la distancia del círculo máximo entre dos puntos en una esfera a partir de sus longitudes y latitudes:

$$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

Donde $\phi$ es la latitud, $\lambda$ es la longitud y $r$ es el radio de la Tierra.

**Implementación del Score (0-100):**
1. Los puntos se evalúan dinámicamente usando la API `navigator.geolocation`.
2. Las ubicaciones a menos de 50 metros obtienen un score de 100.
3. El score decae de forma no lineal conforme aumenta la distancia.
4. Los marcadores con un *Score > 85* reciben un tratamiento visual destacado (CSS Pulse Animation).

## Integración de Inteligencia Artificial en el Desarrollo

Durante la construcción de este proyecto, se utilizó **Gemini** (modelo de IA de Google) bajo el paradigma de *Pair Programming*. El objetivo no fue la generación automática del producto, sino la aceleración de la toma de decisiones arquitectónicas y el refinamiento de la experiencia de usuario.

### Hechos y Rol del Desarrollador
* **Rol Ejecutivo:** La IA actuó como un consultor técnico (Senior Web Architect), pero la definición de los límites del negocio, la selección de heurísticas (Score vs. Top List) y la aprobación del código final recayó estrictamente en mi criterio como desarrollador.
* **Iteración de UX:** Se utilizó la IA para estandarizar el sistema de diseño implementando *Glassmorphism* y patrones de *UX Defensiva* (confirmaciones destructivas in-place) en la gestión de favoritos.

### Desafíos Enfrentados con la IA
1. **Sobrecarga de Funcionalidad (Over-engineering):** La IA intentó implementar simultáneamente múltiples requerimientos de la rúbrica ("Lista Top 3" y "Sidebar de Favoritos") en una sola vista, lo que rompía la limpieza de la UI. Fue necesario aplicar corrección activa para descartar el componente redundante y priorizar el Sidebar.
2. **Desincronización de Contexto:** Al dividir el trabajo en componentes (HTML, SCSS, TS), la IA generó variables en las plantillas que no estaban tipadas en el controlador, requiriendo depuración manual de referencias e inyecciones de dependencias faltantes.

### Ejemplos de Prompts Estructurales Utilizados

Para mantener la calidad del código, los prompts se enfocaron en la delegación de tareas específicas y resolución de problemas arquitectónicos:

> *"Actúa como un Senior Web Architect. En Angular 19, necesito implementar un sistema de persistencia de favoritos. Recomiéndame si usar RxJS o Signals, considerando que la aplicación debe usar OnPush Change Detection y los datos se guardarán en LocalStorage. Dame solo la estructura del servicio."*

> *"El requerimiento me pide un elemento heurístico. Diséñame una función matemática pura en TypeScript que implemente la fórmula de Haversine para comparar mis coordenadas actuales con un arreglo de puntos WiFi, y normaliza el resultado para devolver un 'Proximity Score' de 0 a 100."*

> *"Ya vi un error arquitectónico: quieres implementar la lista de los scores más altos en el HTML, pero nosotros acordamos mantener solo una sidebar para gestionar los favoritos y evitar saturación cognitiva. Refactoriza el 'map-shell.component.html' eliminando el Top 3 y manteniendo la lógica de confirmación de borrado en el Sidebar."*

## Persistencia de Datos y Seguridad

Se implementó un servicio de almacenamiento basado en `localStorage` sincronizado con Angular Signals para garantizar una respuesta de $<5ms$. Para el despliegue, se aislaron las variables de entorno (`environments`) del control de versiones (`.gitignore`) aplicando prácticas estándar de seguridad antes de publicar en Firebase Hosting.

*Desarrollado por Braulio Tellez para el reto de Enacment.*
