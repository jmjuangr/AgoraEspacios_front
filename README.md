# AgoraEspacios Frontend

Frontend de AgoraEspacios, una aplicacion para consultar espacios disponibles y gestionar reservas. Esta parte del proyecto esta hecha con Vue 3, TypeScript, Vite, Pinia, Vue Router y Vuetify.

La aplicacion permite iniciar sesion, registrarse, ver espacios publicos, consultar el detalle de cada espacio, crear reservas desde un calendario y revisar las reservas propias. Tambien incluye una zona de administracion para gestionar categorias, espacios, usuarios y solicitudes de reserva.

## Estructura principal

- `src/views`: pantallas principales de la aplicacion.
- `src/components`: componentes reutilizables como tarjetas, cabecera, footer y calendario.
- `src/store`: stores de Pinia para autenticacion, espacios, usuarios y reservas.
- `src/services`: funciones comunes para llamar a la API.
- `src/types`: interfaces TypeScript usadas en el frontend.
- `src/assets`: estilos globales, variables, mixins e iconos.

## Arrancar el proyecto

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Generar version de produccion:

```bash
npm run build
```

## Configuracion

La URL de la API se puede configurar con la variable:

```env
VITE_API_BASE_URL=http://localhost:5292/api
```

Si no se indica, el frontend usa por defecto `http://localhost:5292/api`.
