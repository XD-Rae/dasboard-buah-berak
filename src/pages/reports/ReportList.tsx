import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Plus, Search, Edit, Trash2, FileText, Eye, Filter} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {useDataContext} from "../../contexts/DataContext";
import {useAuth} from "../../contexts/AuthContext";

// Helper warna status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Reading":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "submitted":
      return "Baru Masuk";
    case "Reading":
      return "Sedang Dibaca";
    case "in_progress":
      return "Dalam Penanganan";
    case "resolved":
      return "Selesai";
    case "rejected":
      return "Ditolak";
    default:
      return status;
  }
};

const ReportList: React.FC = () => {
  // 1. Ambil data user dari context
  const {reports, deleteReport, dusun} = useDataContext() as any;
  const {user} = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDusun, setSelectedDusun] = useState("");

  const [selectedReport, setSelectedReport] = useState<{
    _id: string;
    title: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 2. LOGIKA FILTERING UTAMA
  const filteredReports = (reports || []).filter((report: any) => {
    // console.log(report);
    // --- ATURAN KHUSUS KDUS ---
    if (user?.role === "KDUS") {
      // Cek 1: Pastikan User punya idDusun
      if (!user.idDusun) return false;

      // Cek 2: Validasi ID Dusun Laporan vs ID Dusun User
      // "Hanya kepala dusun dari pelapor itu saja yang dapat lihat"
      if (report.dusun !== user.idDusun) {
        return false; // Skip jika ID dusun laporan beda dengan ID dusun user
      }
      // Cek 3: Filter Status (Hanya tampilkan yg sudah ditindaklanjuti)
      if (report.status === "submitted" || report.status === "Reading") {
        return false;
      }
      console.log("cek");
    }

    // --- Filter Pencarian Teks (Nama Pelapor / Judul) ---
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      report.name.toLowerCase().includes(term) ||
      report.title.toLowerCase().includes(term);

    // --- Filter Dropdown Dusun (Hanya Aktif untuk Admin/Kades) ---
    // Jika KDUS, selectedDusun pasti string kosong (karena dropdown hidden), jadi ini true
    const matchesDusun = selectedDusun === "" || report.dusun === selectedDusun;

    return matchesSearch && matchesDusun;
  });

  const handleDeleteClick = (report: {_id: string; title: string}) => {
    setSelectedReport(report);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedReport) return;

    try {
      await deleteReport(selectedReport._id);
      toast.success("Laporan berhasil dihapus");
      setShowDeleteConfirm(false);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Gagal menghapus laporan");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Laporan Desa</h1>
      </div>

      {/* Filter & Search Area */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari laporan berdasarkan pelapor atau judul..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Filter Dusun (HANYA UNTUK ADMIN / KDES) */}
        {/* KDUS tidak butuh ini karena otomatis difilter by sistem */}
        {user?.role !== "KDUS" && (
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none bg-white cursor-pointer"
              value={selectedDusun}
              onChange={(e) => setSelectedDusun(e.target.value)}
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

      {/* Report Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report: any) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* FOTO LAPORAN */}
              <div className="w-full h-48 bg-gray-100 relative">
                {report.images && report.images.length > 0 ? (
                  <img
                    src={report.images[0]}
                    alt={report.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FileText size={40} />
                  </div>
                )}
                {/* Badge Kategori */}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {report.category}
                </span>
              </div>

              {/* INFO */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="text-lg font-bold text-gray-900 line-clamp-1"
                    title={report.title}
                  >
                    {report.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusColor(
                      report.status,
                    )}`}
                  >
                    {getStatusLabel(report.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                  {report.description}
                </p>

                <div className="flex items-center text-xs text-gray-500 mb-4 border-t pt-2 border-gray-100">
                  <span className="truncate">By: {report.name}</span>
                  <span className="mx-1">•</span>
                  <span className="truncate">
                    {/* Tampilkan Nama Dusun dari Aggregate (jika ada) */}
                    {report.dusun_detail
                      ? report.dusun_detail.nama_dusun
                      : "Dusun ..."}
                  </span>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-end gap-2 border-t pt-3 border-gray-100">
                  <Link
                    to={`/reports/${report._id}`}
                    className="flex-1 inline-flex justify-center items-center rounded-md bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    <Eye size={16} className="mr-1.5" />
                    Detail
                  </Link>

                  {/* Tombol Hapus hanya untuk Admin */}
                  {user?.role === "ADM" && (
                    <button
                      onClick={() =>
                        handleDeleteClick({
                          _id: report._id,
                          title: report.title,
                        })
                      }
                      className="inline-flex justify-center items-center rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // EMPTY STATE
        <div className="rounded-lg bg-white p-12 text-center shadow-sm border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-indigo-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Tidak ada laporan ditemukan
          </h3>
          <p className="mb-6 text-gray-500 max-w-md mx-auto">
            {user?.role === "KDUS"
              ? "Belum ada laporan di dusun Anda yang telah ditindaklanjuti oleh Admin."
              : "Coba ubah kata kunci pencarian atau filter dusun untuk menemukan laporan."}
          </p>

          {user?.role !== "KDUS" && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDusun("");
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {/* CONFIRM DIALOG */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus laporan "${selectedReport?.title}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ReportList;
