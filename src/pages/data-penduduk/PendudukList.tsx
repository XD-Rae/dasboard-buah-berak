import React, {useState, useRef} from "react";
import {Link} from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import axios from "axios";
import {useDataContext} from "../../contexts/DataContext";
import {useAuth} from "../../contexts/AuthContext";

// Definisi Tipe Data Penduduk
interface Penduduk {
  _id: string;
  nama: string;
  dusun: string; // Field ID Dusun
  gaji_pokok: number;
  usia: number;
  tanggungan: number;
  penyakit: string;
  kondisi_rumah: string;
  aset: string;
  createdAt?: string;
}

const PendudukList: React.FC = () => {
  // 1. Ambil data penduduk, dusun, dan USER LOGIN dari context
  const {penduduk, deletePenduduk, fetchPenduduk, dusun} =
    useDataContext() as any;

  const {user} = useAuth();

  // console.log("User Login:", user); // Debugging: Cek data user

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDusun, setSelectedDusun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({
    show: false,
    id: "",
    name: "",
  });

  const itemsPerPage = 10;

  // 2. LOGIKA FILTERING UTAMA
  const filteredData = (penduduk || []).filter((p: Penduduk) => {
    // --- Filter 1: Role Based Access Control (RBAC) ---
    // Jika user adalah KDUS, paksa filter hanya menampilkan dusun miliknya
    if (user?.role === "KDUS" && user?.idDusun) {
      if (p.dusun !== user.idDusun) {
        return false; // Skip data jika ID dusun tidak cocok
      }
    }

    // --- Filter 2: Pencarian Teks ---
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.nama.toLowerCase().includes(term) ||
      p.kondisi_rumah.toLowerCase().includes(term) ||
      p.penyakit.toLowerCase().includes(term);

    // --- Filter 3: Dropdown Dusun (Hanya untuk Admin/Kades) ---
    // Jika KDUS login, dropdown ini bisa di-disable atau di-hide di UI
    // Tapi logic di sini tetap aman karena filter RBAC di atas jalan duluan.
    const matchesDusun = selectedDusun === "" || p.dusun === selectedDusun;
    console.log(user.idDusun);
    console.log(p);

    return matchesSearch && matchesDusun;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({show: true, id, name});
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setIsDeleting(true);
      await deletePenduduk(deleteConfirm.id);
      toast.success(`Data ${deleteConfirm.name} berhasil dihapus`);
      setDeleteConfirm({show: false, id: "", name: ""});
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Gagal menghapus data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error("Mohon upload file Excel (.xlsx atau .xls)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem("token"); // Atau ambil dari cookie jika pakai httpOnly

      // Pastikan URL Backend benar (sesuai setting proxy atau absolute URL)
      await axios.post(
        "https://desa-buah-berak.vercel.app/api/penduduk/import",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Import data Excel berhasil!");

      if (fetchPenduduk) {
        fetchPenduduk();
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Gagal mengimport data Excel");
    } finally {
      setIsUploading(false);
    }
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Data Penduduk</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Fitur Import & Add mungkin hanya untuk Admin/KDUS tertentu */}
          <button
            onClick={handleImportClick}
            disabled={isUploading}
            className={`inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <span className="animate-spin mr-2">⏳</span>
            ) : (
              <FileSpreadsheet size={16} className="mr-2" />
            )}
            {isUploading ? "Importing..." : "Import Excel"}
          </button>

          <Link
            to="/penduduk/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data
          </Link>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search Bar */}
        <div className="relative md:col-span-2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari Nama, Penyakit, atau Kondisi Rumah..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdown Filter Dusun (HANYA MUNCUL JIKA BUKAN KDUS) */}
        {user?.role !== "KDUS" && (
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
              value={selectedDusun}
              onChange={(e) => {
                setSelectedDusun(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">Semua Dusun</option>
              {dusun?.map((d: any) => (
                <option key={d.idDusun} value={d.idDusun}>
                  {d.nama_dusun}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Gaji Pokok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Usia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Tanggungan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Kriteria
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500 tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((p: Penduduk) => (
                  <tr
                    key={p._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {p.nama}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRupiah(p.gaji_pokok)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {p.usia} Tahun
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {p.tanggungan}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 w-fit">
                          {p.penyakit}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 w-fit">
                          🏠 {p.kondisi_rumah}
                        </span>
                        <span className="text-xs text-gray-400">
                          Aset: {p.aset}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        <Link
                          to={`/penduduk/${p._id}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <Edit size={18} />
                        </Link>

                        {/* Hapus hanya untuk Admin atau User tertentu */}
                        {user?.role === "ADM" && (
                          <button
                            onClick={() => handleDeleteClick(p._id, p.nama)}
                            className={`text-red-600 hover:text-red-900 transition-colors ${
                              isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isDeleting}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={32} className="mb-2 text-gray-300" />
                      <p>Data penduduk tidak ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50">
            <p className="text-sm text-gray-700">
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} data
            </p>
            <div className="flex space-x-1">
              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="px-3 py-1 text-sm font-medium">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus data penduduk atas nama "${deleteConfirm.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({show: false, id: "", name: ""})}
      />
    </div>
  );
};

export default PendudukList;
