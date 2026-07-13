import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye, // Tambahkan ini
  Download, // Tambahkan ini
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {SURAT_KELUAR} from "../../types";

const SuratKeluarList: React.FC = () => {
  const {suratKeluar, deleteSuratKeluar} = useDataContext();
  console.log(suratKeluar);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Preview
  const [previewFile, setPreviewFile] = useState<string | null>(null);

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

  // --- Fungsi Download ---
  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split("/").pop() || "surat-keluar.pdf";

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error("Gagal mengunduh file.");
    }
  };

  // --- Filter Surat Keluar ---
  const filteredData = (suratKeluar || []).filter((s: SURAT_KELUAR) => {
    const term = searchTerm.toLowerCase();
    return (
      s.NO_SURAT.toLowerCase().includes(term) ||
      s.TUJUAN.toLowerCase().includes(term) ||
      s.PERIHAL.toLowerCase().includes(term)
    );
  });

  // Pagination
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
      await deleteSuratKeluar(deleteConfirm.id);
      toast.success(`Surat "${deleteConfirm.name}" berhasil dihapus`);
      setDeleteConfirm({show: false, id: "", name: ""});
    } catch (error) {
      console.error("Error deleting surat:", error);
      toast.error("Gagal menghapus surat keluar");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Surat Keluar</h1>
        <Link
          to="/surat-keluar/new"
          className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Surat
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari No Surat, Tujuan, atau Perihal..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  No Surat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tujuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Perihal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tgl Keluar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((s: SURAT_KELUAR) => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {s.NO_SURAT}
                    </td>
                    <td className="px-6 py-4 text-sm">{s.TUJUAN}</td>
                    <td className="px-6 py-4 text-sm">{s.PERIHAL}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(s.TANGGAL_KELUAR)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex justify-center space-x-3">
                        {/* Tombol Preview */}
                        <button
                          onClick={() => setPreviewFile(s.FILE_PATH || null)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Preview Surat"
                        >
                          <Eye size={18} />
                        </button>

                        <Link
                          to={`/surat-keluar/${s.IDSURATKELUAR}`}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit size={18} />
                        </Link>

                        <button
                          onClick={() =>
                            handleDeleteClick(s.IDSURATKELUAR!, s.NO_SURAT)
                          }
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-gray-500 italic"
                  >
                    Tidak ada data surat keluar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 bg-white">
            {/* ... (Konten pagination tetap sama seperti sebelumnya) ... */}
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} results
            </p>
            <div className="flex space-x-1">
              <button
                className="p-1 disabled:opacity-30"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="p-1 disabled:opacity-30"
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

      {/* --- MODAL PREVIEW --- */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="font-bold text-gray-800">Preview Surat Keluar</h2>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-gray-200">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile)}&embedded=true`}
                title="Preview Surat"
                className="w-full h-full border-none"
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button
                onClick={() => handleDownload(previewFile)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
              >
                <Download size={16} className="mr-2" />
                Download PDF
              </button>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus surat "${deleteConfirm.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({show: false, id: "", name: ""})}
      />
    </div>
  );
};

export default SuratKeluarList;
