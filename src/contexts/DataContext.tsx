import React, {createContext, useContext, useState, useEffect} from "react";
import {
  Aparatur,
  Event,
  Report,
  Role,
  User,
  USER,
  SURAT_MASUK,
  SURAT_KELUAR,
  Penduduk,
  Bantuan,
  Dusun, // Tambahan Import Dusun
} from "../types";
import {
  aparaturAPI,
  eventAPI,
  reportAPI,
  roleAPI,
  userAPI,
  suratMasukAPI,
  suratKeluarAPI,
  pendudukAPI,
  bantuanAPI,
  dusunAPI, // Tambahan Import API Dusun
} from "../services/api";
import toast from "react-hot-toast";

interface DataContextType {
  aparatur: Aparatur[];
  bantuan: Bantuan[];
  penduduk: Penduduk[];
  dusun: Dusun[]; // Tambahan State Type
  users: USER[];
  suratMasuk: SURAT_MASUK[];
  suratKeluar: SURAT_KELUAR[];
  roles: Role[];
  events: Event[];
  reports: Report[];
  loading: boolean;
  error: string | null;

  // Mengganti nama fungsi faculty ke aparatur
  addPenduduk: (data: Partial<Penduduk>) => Promise<void>; // Adjusted type for consistency
  updatePenduduk: (id: string, data: Partial<Penduduk>) => Promise<void>;
  deletePenduduk: (id: string) => Promise<void>;
  getPendudukById: (id: string) => Promise<Penduduk | undefined>; // Adjusted return type

  // --- Tambahan Interface Handler Dusun ---
  addDusun: (data: Partial<Dusun>) => Promise<void>;
  updateDusun: (id: string, data: Partial<Dusun>) => Promise<void>;
  deleteDusun: (id: string) => Promise<void>;
  getDusunById: (id: string) => Promise<Dusun | undefined>;
  // ----------------------------------------

  addAparatur: (data: FormData) => Promise<void>;
  updateAparatur: (id: string, data: FormData) => Promise<void>;
  deleteAparatur: (id: string) => Promise<void>;
  getAparaturById: (id: string) => Promise<Aparatur | undefined>;

  addSuratMasuk: (data: FormData) => Promise<void>;
  updateSuratMasuk: (id: string, data: FormData) => Promise<void>;
  deleteSuratMasuk: (id: string) => Promise<void>;
  getSuratMasukById: (id: string) => Promise<SURAT_MASUK | undefined>;

  addSuratKeluar: (data: FormData) => Promise<void>;
  updateSuratKeluar: (id: string, data: FormData) => Promise<void>;
  deleteSuratKeluar: (id: string) => Promise<void>;
  getSuratKeluarById: (id: string) => Promise<SURAT_MASUK | undefined>;

  addRole: (data: FormData) => Promise<void>;
  updateRole: (id: string, data: FormData) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  getRoleById: (id: string) => Promise<Role | undefined>;

  addUsers: (data: FormData) => Promise<void>;
  updateUsers: (id: string, data: FormData) => Promise<void>;
  deleteUsers: (id: string) => Promise<void>;
  getUsersById: (id: string) => Promise<Role | undefined>;

  addEvent: (data: FormData) => Promise<void>;
  updateEvent: (id: string, data: FormData) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Promise<Event | undefined>;

  addReport: (data: FormData) => Promise<void>;
  updateReport: (id: string, data: FormData) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  getReportById: (id: string) => Promise<Report | undefined>;

  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within a DataProvider");
  }
  return context;
};

export const DataProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  // Mengganti state faculty menjadi aparatur
  const [aparatur, setAparatur] = useState<Aparatur[]>([]);
  const [bantuan, setBantuan] = useState<Bantuan[]>([]);
  const [penduduk, setPenduduk] = useState<Penduduk[]>([]);
  const [dusun, setDusun] = useState<Dusun[]>([]); // Tambahan State Dusun
  const [suratMasuk, setSuratMasuk] = useState<SURAT_MASUK[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<SURAT_KELUAR[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<Role[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        aparaturData,
        bantuanData,
        pendudukData,
        dusunData, // Tambahan Data Destructuring
        suratMasukData,
        suratKeluarData,
        roleData,
        userData,
        eventsData,
        reportsData,
      ] = await Promise.all([
        aparaturAPI.getAll(),
        bantuanAPI.getAll(),
        pendudukAPI.getAll(),
        dusunAPI.getAll(), // Tambahan API Call
        suratMasukAPI.getAll(),
        suratKeluarAPI.getAll(),
        roleAPI.getAll(),
        userAPI.getAll(),
        eventAPI.getAll(),
        reportAPI.getAll(),
        ]);
      setAparatur(aparaturData);
      setBantuan(bantuanData);
      setPenduduk(pendudukData);
      setDusun(dusunData); // Set State Dusun
      setSuratMasuk(suratMasukData);
      setSuratKeluar(suratKeluarData);
      setRoles(roleData);
      setUsers(userData);
      setEvents(eventsData);
      setReports(reportsData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---- Penduduk Handlers ----
  const addPenduduk = async (data: Partial<Penduduk>) => {
    try {
      await pendudukAPI.create(data);
      await fetchData();
      toast.success("Data penduduk berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menambahkan data penduduk");
      throw err;
    }
  };

  const updatePenduduk = async (id: string, data: Partial<Penduduk>) => {
    try {
      await pendudukAPI.update(id, data);
      await fetchData();
      toast.success("Data penduduk berhasil diperbarui");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui data penduduk");
      throw err;
    }
  };

  const deletePenduduk = async (id: string) => {
    try {
      await pendudukAPI.delete(id);
      await fetchData();
      toast.success("Data penduduk berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data penduduk");
      throw err;
    }
  };

  const getPendudukById = async (id: string): Promise<Penduduk | undefined> => {
    try {
      const data = await pendudukAPI.getById(id);
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil detail data penduduk");
      throw err;
    }
  };

  // ---- Dusun Handlers (TAMBAHAN) ----
  const addDusun = async (data: Partial<Dusun>) => {
    try {
      await dusunAPI.create(data);
      await fetchData();
      toast.success("Data dusun berhasil ditambahkan");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menambahkan data dusun");
      throw err;
    }
  };

  const updateDusun = async (id: string, data: Partial<Dusun>) => {
    try {
      await dusunAPI.update(id, data);
      await fetchData();
      toast.success("Data dusun berhasil diperbarui");
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui data dusun");
      throw err;
    }
  };

  const deleteDusun = async (id: string) => {
    try {
      await dusunAPI.delete(id);
      await fetchData();
      toast.success("Data dusun berhasil dihapus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus data dusun");
      throw err;
    }
  };

  const getDusunById = async (id: string): Promise<Dusun | undefined> => {
    try {
      const data = await dusunAPI.getById(id);
      return data;
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil detail data dusun");
      throw err;
    }
  };

  // Opsional: Handler untuk Import Excel jika ingin dimasukkan ke Context juga
  const importPendudukExcel = async (file: File) => {
    try {
      await pendudukAPI.importExcel(file);
      await fetchData();
      toast.success("Import data Excel berhasil");
    } catch (err: any) {
      console.error(err);
      const errorMsg =
        err.response?.data?.error || "Gagal mengimport data Excel";
      toast.error(errorMsg);
      throw err;
    }
  };

  // ---- User Handlers ----
  const addUsers = async (data: Partial<User>) => {
    try {
      await userAPI.create(data as any);
      await fetchData();
    } catch (err) {
      toast.error("Failed to add user");
      throw err;
    }
  };

  const updateUsers = async (id: string, data: Partial<User>) => {
    try {
      await userAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to update user");
      throw err;
    }
  };

  const deleteUsers = async (id: string) => {
    try {
      await userAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete user");
      throw err;
    }
  };

  const getUsersById = async (id: string): Promise<User | undefined> => {
    try {
      return await userAPI.getById(id);
    } catch (err) {
      toast.error("Failed to get user details");
      throw err;
    }
  };

  // ---- Surat Keluar Handlers ----
  const addSuratKeluar = async (data: Partial<SURAT_KELUAR>) => {
    try {
      console.log("ini masuk 1");
      await suratKeluarAPI.create(data as any);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menambahkan surat keluar");
      throw err;
    }
  };

  const updateSuratKeluar = async (id: string, data: Partial<SURAT_KELUAR>) => {
    try {
      await suratKeluarAPI.update(id, data as any);
      await fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui surat keluar");
      throw err;
    }
  };

  const deleteSuratKeluar = async (id: string) => {
    try {
      await suratKeluarAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menghapus surat keluar");
      throw err;
    }
  };

  const getSuratKeluarById = async (
    id: string,
  ): Promise<SURAT_KELUAR | undefined> => {
    try {
      return await suratKeluarAPI.getById(id);
    } catch (err) {
      toast.error("Gagal mengambil detail surat keluar");
      throw err;
    }
  };

  // ---- Surat Masuk Handlers ----
  const addSuratMasuk = async (data: Partial<SURAT_MASUK>) => {
    try {
      console.log("ini masuk 1");
      await suratMasukAPI.create(data as any);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menambahkan surat masuk");
      throw err;
    }
  };

  const updateSuratMasuk = async (id: string, data: Partial<SURAT_MASUK>) => {
    try {
      await suratMasukAPI.update(id, data as any);
      await fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui surat masuk");
      throw err;
    }
  };

  const deleteSuratMasuk = async (id: string) => {
    try {
      await suratMasukAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menghapus surat masuk");
      throw err;
    }
  };

  const getSuratMasukById = async (
    id: string,
  ): Promise<SURAT_MASUK | undefined> => {
    try {
      return await suratMasukAPI.getById(id);
    } catch (err) {
      toast.error("Gagal mengambil detail surat masuk");
      throw err;
    }
  };

  // ---- Aparatur Handlers (Renamed from Faculty) ----
  const addAparatur = async (data: FormData) => {
    try {
      await aparaturAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menambahkan data aparatur");
      throw err;
    }
  };

  const updateAparatur = async (id: string, data: FormData) => {
    try {
      await aparaturAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error("Gagal memperbarui data aparatur");
      throw err;
    }
  };

  const deleteAparatur = async (id: string) => {
    try {
      await aparaturAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Gagal menghapus data aparatur");
      throw err;
    }
  };

  const getAparaturById = async (id: string): Promise<Aparatur | undefined> => {
    try {
      return await aparaturAPI.getById(id);
    } catch (err) {
      toast.error("Gagal mengambil detail aparatur");
      throw err;
    }
  };

  // ---- Roles Handlers ----
  const addRole = async (data: FormData) => {
    try {
      await roleAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to add role");
      throw err;
    }
  };

  const updateRole = async (id: string, data: FormData) => {
    try {
      await roleAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to update role");
      throw err;
    }
  };

  const deleteRole = async (id: string) => {
    try {
      await roleAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete role");
      throw err;
    }
  };

  const getRoleById = async (id: string): Promise<Role | undefined> => {
    try {
      return await roleAPI.getById(id);
    } catch (err) {
      toast.error("Failed to get role details");
      throw err;
    }
  };

  // ---- Event Handlers ----
  const addEvent = async (data: FormData) => {
    try {
      await eventAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to add event");
      throw err;
    }
  };

  const updateEvent = async (id: string, data: FormData) => {
    try {
      await eventAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to update event");
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete event");
      throw err;
    }
  };

  const getEventById = async (id: string): Promise<Event | undefined> => {
    try {
      return await eventAPI.getById(id);
    } catch (err) {
      toast.error("Failed to get event details");
      throw err;
    }
  };

  // ---- Report Handlers ----
  const addReport = async (data: FormData) => {
    try {
      await reportAPI.create(data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to add report");
      throw err;
    }
  };

  const updateReport = async (id: string, data: FormData) => {
    try {
      await reportAPI.update(id, data);
      await fetchData();
    } catch (err) {
      toast.error("Failed to update report");
      throw err;
    }
  };

  const deleteReport = async (id: string) => {
    try {
      await reportAPI.delete(id);
      await fetchData();
    } catch (err) {
      toast.error("Failed to delete report");
      throw err;
    }
  };

  const getReportById = async (id: string): Promise<Report | undefined> => {
    try {
      return await reportAPI.getById(id);
    } catch (err) {
      toast.error("Failed to get report details");
      throw err;
    }
  };

  const value: DataContextType = {
    aparatur,
    suratMasuk,
    bantuan,
    suratKeluar,
    users,
    penduduk,
    dusun, // Tambahan Value Dusun
    roles,
    events,
    reports,
    loading,
    error,
    addPenduduk,
    updatePenduduk,
    deletePenduduk,
    getPendudukById,
    // --- Tambahan Handler Dusun ---
    addDusun,
    updateDusun,
    deleteDusun,
    getDusunById,
    // -----------------------------
    addSuratKeluar,
    updateSuratKeluar,
    deleteSuratKeluar,
    getSuratKeluarById,
    addSuratMasuk,
    updateSuratMasuk,
    deleteSuratMasuk,
    getSuratMasukById,
    addUsers,
    updateUsers,
    deleteUsers,
    getUsersById,
    addRole,
    updateRole,
    deleteRole,
    getRoleById,
    addAparatur,
    updateAparatur,
    deleteAparatur,
    getAparaturById,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    addReport,
    updateReport,
    deleteReport,
    getReportById,
    refreshData: fetchData,
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
};
