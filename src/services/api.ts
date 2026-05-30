// src/services/api.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5292/api";

// Esta función comprueba si hay un token guardado en localStorage
// Si existe token lo añade a la cabecera Authorization para acceso a rutas protegidas.
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("agora_token");

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
}
//traducción de mensajes del backend
function traducirMensajeValidacion(mensaje: string): string {
  if (
    mensaje.includes("The field Password") &&
    mensaje.includes("minimum length")
  ) {
    return "La contraseña debe tener al menos 6 carácteres.";
  }

  return mensaje;
}
//obtner mensaje de error a partir de respuesta de la Api
function obtenerMensajeError(
  text: string,
  status: number,
  method: string,
  url: string,
) {
  if (!text) {
    return `Error ${status} en ${method} ${url}`;
  }

  try {
    const data = JSON.parse(text);

    if (data.errors && typeof data.errors === "object") {
      const mensajes = Object.values(data.errors)
        .flat()
        .filter((mensaje): mensaje is string => typeof mensaje === "string")
        .map(traducirMensajeValidacion);

      if (mensajes.length) return mensajes.join(" ");
    }

    if (typeof data.title === "string") return data.title;
    if (typeof data.message === "string") return data.message;
  } catch {
    // Si no es JSON. se muestra el texto normal que devuelva la API
  }

  return text;
}

//  GET reutilizable para hacer peticiones a la API.
// se usa el <T> para indicar tipo de dato esperado en respuesta
export async function apiGet<T>(url: string): Promise<T> {
  // cabecera de petiición si esta logueado el user se añade token
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const resp = await fetch(`${API_BASE_URL}${url}`, { headers });

  // gestion de error
  if (!resp.ok) {
    throw new Error(`Error ${resp.status} al hacer GET ${url}`);
  }

  return (await resp.json()) as T;
}

// POST / PUT / PATCH / DELETE
// Función comun
export async function apiSend<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  // Todas las peticiones se envian como JSON y con token si hay
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const resp = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  //gestion de error
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(obtenerMensajeError(text, resp.status, method, url));
  }

  const contentType = resp.headers.get("Content-Type") || "";
  // comprobar si la respuesta devuelve o no json
  if (contentType.includes("application/json")) {
    return (await resp.json()) as T;
  }

  return undefined as T;
}
