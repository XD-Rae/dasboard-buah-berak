import axios from "axios";
import {
  Aparatur, // Mengganti Faculty menjadi Aparatur
  Event,
  Role,
  SURAT_KELUAR,
  SURAT_MASUK,
  User,
  Penduduk,
  Bantuan,
  Dusun,
} from "../types";

// API response types
interface APIResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

interface APIErrorResponse {
  success: false;
  error: string;
}

// Custom error classes
class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3008";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api-buah-berak.garnusa.com";
const DEFAULT_TIMEOUT = 30000;

// Remove id fields before sending to API
const sanitizeData = (data: any) => {
  if (data instanceof FormData) return data;
  const clone = {...data};
  delete clone._id;
  delete clone.id;
  return clone;
};

// Handle request timeout
const fetchWithTimeout = async (
  resource: string,
  options?: RequestInit,
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

// Main fetch function with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
      mode: "cors",
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (_) {}
      throw new APIError(response.status, errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof APIError) throw error;
    if (error.name === "AbortError") throw new NetworkError("Request timeout");
    if (!navigator.onLine) throw new NetworkError("No internet connection");
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new NetworkError(`Unable to connect to API at ${API_BASE_URL}`);
    }

    console.error("Unhandled API error:", error);
    throw new NetworkError("Unexpected error during API request");
  }
}

const prepareRequestData = (data: any) => {
  const clean = sanitizeData(data);
  return clean instanceof FormData ? clean : JSON.stringify(clean);
};

// -------- Surat Keluar API --------
export const suratKeluarAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<SURAT_KELUAR[]>>(
        "/api/surat-keluar/get",
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching surat keluar:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    if (!id) throw new Error("ID Surat Keluar is required");
    try {
      const response = await fetchAPI<APIResponse<SURAT_KELUAR>>(
        `/api/surat-keluar/get/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching surat keluar ${id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);

    // const response = await axios.post<APIResponse<SURAT_KELUAR>>(
    // "http://localhost:3008/api/surat-keluar/create",

    const response = await axios.post<APIResponse<SURAT_KELUAR>>(
      "https://api-buah-berak.garnusa.com/api/surat-keluar/create",
      body,
      {
        withCredentials: true,
      },
    );

    return response.data.data;
  },

  update: async (id: string, data: any) => {
    if (!id) throw new Error("ID Surat Keluar is required");

    const body = prepareRequestData(data);

    // const response = await axios.put<APIResponse<SURAT_KELUAR>>(
    // `http://localhost:3008/api/surat-keluar/edit/${id}`,

    const response = await axios.put<APIResponse<SURAT_KELUAR>>(
      `https://api-buah-berak.garnusa.com/api/surat-keluar/edit/${id}`,
      body,
      {
        withCredentials: true,
        // Axios akan otomatis menangani boundary jika body adalah FormData
      },
    );

    return response.data.data;
  },

  delete: async (id: string) => {
    if (!id) throw new Error("ID Surat Keluar is required");
    await fetchAPI<APIResponse<void>>(`/api/surat-keluar/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// -------- Surat Masuk API --------
export const suratMasukAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<SURAT_MASUK[]>>(
        "/api/surat-masuk/get",
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching surat masuk:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    if (!id) throw new Error("ID Surat Masuk is required");
    try {
      const response = await fetchAPI<APIResponse<SURAT_MASUK>>(
        `/api/surat-masuk/get/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching surat masuk ${id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);

    // const response = await axios.post<APIResponse<SURAT_MASUK>>(
    // "http://localhost:3008/api/surat-masuk/create",

    const response = await axios.post<APIResponse<SURAT_MASUK>>(
      "https://api-buah-berak.garnusa.com/api/surat-masuk/create",
      body,
      {
        withCredentials: true,
      },
    );

    return response.data.data;
  },

  update: async (id: string, data: any) => {
    if (!id) throw new Error("ID Surat Masuk is required");

    const body = prepareRequestData(data);

    // const response = await axios.put<APIResponse<SURAT_MASUK>>(
    // `http://localhost:3008/api/surat-masuk/edit/${id}`,

    const response = await axios.put<APIResponse<SURAT_MASUK>>(
      `https://api-buah-berak.garnusa.com/api/surat-masuk/edit/${id}`,
      body,
      {
        withCredentials: true,
        // Axios secara otomatis mengatur Content-Type jika body adalah FormData
      },
    );

    return response.data.data;
  },

  delete: async (id: string) => {
    if (!id) throw new Error("ID Surat Masuk is required");
    await fetchAPI<APIResponse<void>>(`/api/surat-masuk/delete/${id}`, {
      method: "DELETE",
    });
  },

  deleteAll: async () => {
    await fetchAPI<APIResponse<void>>("/api/surat-masuk/delete-all", {
      method: "DELETE",
    });
  },

  getCount: async () => {
    const response = await fetchAPI<APIResponse<number>>(
      "/api/surat-masuk/count",
    );
    return response.data;
  },
};

export const bantuanAPI = {
  getAll: async () => {
    try {
      const response =
        await fetchAPI<APIResponse<Bantuan[]>>("/api/penduduk/saw");
      return response.data;
    } catch (error) {
      console.error("Error fetching penduduk:", error);
      return [];
    }
  },
};

// -------- Penduduk API --------
export const pendudukAPI = {
  // GET ALL
  getAll: async () => {
    try {
      // Sesuai route controller: router.get("/", getAllPenduduk)
      const response = await fetchAPI<APIResponse<Penduduk[]>>("/api/penduduk");
      return response.data;
    } catch (error) {
      console.error("Error fetching penduduk:", error);
      return [];
    }
  },

  // GET BY ID
  getById: async (id: string) => {
    if (!id) throw new Error("ID Penduduk is required");
    try {
      const response = await fetchAPI<APIResponse<Penduduk>>(
        `/api/penduduk/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching penduduk ${id}:`, error);
      return undefined;
    }
  },

  // CREATE (Manual Input)
  create: async (data: Partial<Penduduk>) => {
    // Menggunakan fetchAPI atau axios, pastikan endpoint sesuai
    // Sesuai route controller: router.post("/", createPenduduk)

    // Jika fetchAPI Anda support method POST:
    /*
    const response = await fetchAPI<APIResponse<Penduduk>>("/api/penduduk", {
       method: "POST",
       body: JSON.stringify(data),
       headers: { "Content-Type": "application/json" }
    });
    return response.data;
    */

    // Menggunakan Axios (seperti contoh Anda sebelumnya):
    // const response = await axios.post<APIResponse<Penduduk>>(
    // "http://localhost:3008/api/penduduk",

    const response = await axios.post<APIResponse<Penduduk>>(
      "https://api-buah-berak.garnusa.com/api/penduduk", // Sesuaikan port backend
      data,
      {
        withCredentials: true, // Jika butuh cookie/session
      },
    );

    return response.data.data;
  },

  // UPDATE
  update: async (id: string, data: Partial<Penduduk>) => {
    if (!id) throw new Error("ID Penduduk is required");

    // Sesuai route controller: router.put("/:id", updatePenduduk)
    const response = await fetchAPI<APIResponse<Penduduk>>(
      `/api/penduduk/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data), // Pastikan dikirim sebagai JSON string
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  },

  // DELETE
  delete: async (id: string) => {
    if (!id) throw new Error("ID Penduduk is required");
    // Sesuai route controller: router.delete("/:id", deletePenduduk)
    await fetchAPI<APIResponse<void>>(`/api/penduduk/${id}`, {
      method: "DELETE",
    });
  },

  // IMPORT EXCEL (Fitur Baru)
  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    // const response = await axios.post<APIResponse<Penduduk[]>>(
    // "http://localhost:3008/api/penduduk/import",

    const response = await axios.post<APIResponse<Penduduk[]>>(
      "https://api-buah-berak.garnusa.com/api/penduduk/import",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      },
    );

    return response.data;
  },
};

// -------- Aparatur API (Renamed from Faculty) --------
export const aparaturAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Aparatur[]>>("/api/aparatur");
      return response.data;
    } catch (error) {
      console.error("Error fetching aparatur:", error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error("Aparatur ID is required");
    try {
      const response = await fetchAPI<APIResponse<Aparatur>>(
        `/api/aparatur/${_id}`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching aparatur ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Aparatur>>("/api/aparatur", {
      method: "POST",
      body,
      headers:
        data instanceof FormData ? {} : {"Content-Type": "application/json"},
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error("Aparatur ID is required");
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Aparatur>>(
      `/api/aparatur/${_id}`,
      {
        method: "PUT",
        body,
        headers:
          data instanceof FormData ? {} : {"Content-Type": "application/json"},
      },
    );
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error("Aparatur ID is required");
    await fetchAPI<APIResponse<void>>(`/api/aparatur/${_id}`, {
      method: "DELETE",
    });
  },
};

// -------- Dusun API --------
export const dusunAPI = {
  // GET ALL
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Dusun[]>>("/api/dusun");
      return response.data;
    } catch (error) {
      console.error("Error fetching dusun:", error);
      return [];
    }
  },

  // GET BY ID (UUID)
  getById: async (id: string) => {
    if (!id) throw new Error("ID Dusun is required");
    try {
      // id di sini adalah idDusun (UUID), bukan _id Mongo
      const response = await fetchAPI<APIResponse<Dusun>>(`/api/dusun/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching dusun ${id}:`, error);
      return undefined;
    }
  },

  // CREATE
  create: async (data: Partial<Dusun>) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Dusun>>("/api/dusun", {
      method: "POST",
      body,
      headers:
        data instanceof FormData ? {} : {"Content-Type": "application/json"},
    });
    return response.data;
  },

  // UPDATE
  update: async (id: string, data: Partial<Dusun>) => {
    if (!id) throw new Error("ID Dusun is required");
    const body = prepareRequestData(data);

    const response = await fetchAPI<APIResponse<Dusun>>(`/api/dusun/${id}`, {
      method: "PUT",
      body,
      headers:
        data instanceof FormData ? {} : {"Content-Type": "application/json"},
    });
    return response.data;
  },

  // DELETE
  delete: async (id: string) => {
    if (!id) throw new Error("ID Dusun is required");
    await fetchAPI<APIResponse<void>>(`/api/dusun/${id}`, {
      method: "DELETE",
    });
  },
};

// -------- Roles API --------
export const roleAPI = {
  // GET /api/roles
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Role[]>>("/api/roles");
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
  },

  // GET /api/roles/:id
  getById: async (_id: string) => {
    if (!_id) throw new Error("Role ID is required");
    try {
      const response = await fetchAPI<APIResponse<Role>>(`/api/roles/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${_id}:`, error);
      return undefined;
    }
  },

  // POST /api/roles
  create: async (data: Omit<Role, "_id">) => {
    const response = await fetchAPI<APIResponse<Role>>("/api/roles", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // PUT /api/roles/:id
  update: async (_id: string, data: Partial<Role>) => {
    if (!_id) throw new Error("Role ID is required");

    const response = await fetchAPI<APIResponse<Role>>(`/api/roles/${_id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // DELETE /api/roles/:id
  delete: async (_id: string) => {
    if (!_id) throw new Error("Role ID is required");
    await fetchAPI<APIResponse<void>>(`/api/roles/${_id}`, {
      method: "DELETE",
    });
  },
};

// -------- Users API --------
export const userAPI = {
  // GET /api/users
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<User[]>>("/api/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  // GET /api/users/:id
  getById: async (id: string) => {
    if (!id) throw new Error("User ID is required");
    try {
      const response = await fetchAPI<APIResponse<User>>(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return undefined;
    }
  },

  // POST /api/users
  create: async (data: Omit<User, "_id">) => {
    console.log(data);
    const response = await fetchAPI<APIResponse<User>>("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // PUT /api/users/:id
  update: async (id: string, data: Partial<User>) => {
    if (!id) throw new Error("User ID is required");

    const response = await fetchAPI<APIResponse<User>>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // DELETE /api/users/:id
  delete: async (id: string) => {
    if (!id) throw new Error("User ID is required");
    await fetchAPI<APIResponse<void>>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  // POST /api/users/login
  login: async (data: {email: string; password: string}) => {
    const response = await fetchAPI<APIResponse<any>>("/api/users/login", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  // POST /api/users/refreshToken
  refreshToken: async () => {
    const response = await fetchAPI<APIResponse<any>>(
      "/api/users/refreshToken",
      {
        method: "POST",
      },
    );
    return response.data;
  },

  // POST /api/users/logout
  logout: async () => {
    await fetchAPI<APIResponse<void>>("/api/users/logout", {
      method: "POST",
    });
  },

  changeName: async (id: string, data: {newName: string}) => {
    if (!id) throw new Error("User ID is required");

    const response = await fetchAPI<APIResponse<any>>(
      `/api/users/${id}/change-name`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response; // Return full response untuk cek status success/fail di komponen
  },

  // PUT /api/users/:id/change-password
  changePassword: async (
    id: string,
    data: {oldPassword: string; newPassword: string},
  ) => {
    if (!id) throw new Error("User ID is required");

    const response = await fetchAPI<APIResponse<any>>(
      `/api/users/${id}/change-password`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response;
  },
};

// -------- Reports API --------
export const reportAPI = {
  getAll: async () => {
    const res = await fetchAPI<{data: any[]}>("/api/reports");
    return res.data;
  },

  addTindakLanjut: async (id: string, data: {tindak_lanjut: string}) => {
    const response = await fetchAPI<APIResponse<any>>(
      `/api/reports/${id}/tindak-lanjut`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const res = await fetchAPI<{data: any}>(`/api/reports/${id}`);
    return res.data;
  },

  create: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API create report error:", error);
      throw error;
    }
  },

  update: async (id: string, formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API update report error:", error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: string) => {
    // Sesuaikan endpoint dengan route backend yang kita buat: /api/reports/:id/status
    const response = await fetchAPI<APIResponse<any>>(
      `/api/reports/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({status}),
        headers: {"Content-Type": "application/json"},
      },
    );
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error("Reports ID is required");
    await fetchAPI<APIResponse<void>>(`/api/reports/${_id}`, {
      method: "DELETE",
    });
  },
};

// -------- Event API --------
export const eventAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Event[]>>("/api/events");
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error("Event ID is required");
    try {
      const response = await fetchAPI<APIResponse<Event>>(`/api/events/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>("/api/events", {
      method: "POST",
      body,
      headers:
        data instanceof FormData ? {} : {"Content-Type": "application/json"},
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error("Event ID is required");
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>(`/api/events/${_id}`, {
      method: "PUT",
      body,
      headers:
        data instanceof FormData ? {} : {"Content-Type": "application/json"},
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error("Event ID is required");
    await fetchAPI<APIResponse<void>>(`/api/events/${_id}`, {method: "DELETE"});
  },
};

export {APIError, NetworkError};
