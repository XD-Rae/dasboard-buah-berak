import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext"; // Pastikan path benar
import {useAuth} from "../../contexts/AuthContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MapPin, // Ikon tambahan untuk Dusun
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";

// Definisi Interface sesuai data Dusun dari Backend
interface Dusun {
  idDusun: string; // UUID
  nama_dusun: string;
  kepala_dusun: string;
  jumlah_rt: number;
  keterangan: string;
  createdAt?: string;
  updatedAt?: string;
}

const DusunList: React.FC = () => {
  // Mengambil state 'dusun' dan fungsi 'deleteDusun' dari context
  const {dusun, deleteDusun} = useDataContext() as any;
  console.log(dusun);
  const {user} = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Filter Logic untuk Dusun
  const filteredDusun = (dusun || []).filter((d: Dusun) => {
    const term = searchTerm.toLowerCase();
    return (
      d.nama_dusun.toLowerCase().includes(term) ||
      d.kepala_dusun.toLowerCase().includes(term)
    );
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDusun.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDusun.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handler Delete
  // id di sini adalah idDusun (UUID)
  const handleDeleteClick = (id: string, name: string) => {
    setDeleteConfirm({show: true, id, name});
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setIsDeleting(true);
      await deleteDusun(deleteConfirm.id);
      toast.success(`Dusun ${deleteConfirm.name} berhasil dihapus`);
      setDeleteConfirm({show: false, id: "", name: ""});
    } catch (error) {
      console.error("Error deleting dusun:", error);
      toast.error("Gagal menghapus data Dusun");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="text-blue-600" />
            Data Dusun
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola data wilayah dusun dan kepala dusun.
          </p>
        </div>

        <Link
          to="/dusun/new"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Tambah Dusun
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari Nama Dusun atau Kepala Dusun..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
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
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Nama Dusun
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Kepala Dusun
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Jumlah RT
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Keterangan
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((item: Dusun) => (
                  <tr
                    key={item.idDusun}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Kolom Nama Dusun */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                          {item.nama_dusun.charAt(item.nama_dusun.length - 1)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {item.nama_dusun}
                          </div>
                          <div className="text-xs text-gray-400">
                            ID: {item.idDusun.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kolom Kepala Dusun */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users size={16} className="mr-2 text-gray-400" />
                        {item.kepala_dusun.NAMA}
                      </div>
                    </td>

                    {/* Kolom Jumlah RT */}
                    <td className="whitespace-nowrap px-6 py-4 text-center">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        {item.jumlah_rt} RT
                      </span>
                    </td>

                    {/* Kolom Keterangan */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.keterangan || "-"}
                    </td>

                    {/* Kolom Aksi */}
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        {/* Tombol Edit */}
                        <Link
                          to={`/dusun/edit/${item.idDusun}`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>

                        {/* Tombol Delete (Admin Only) */}
                        {(!user || user?.role === "admin") && (
                          <button
                            onClick={() =>
                              handleDeleteClick(item.idDusun, item.nama_dusun)
                            }
                            className={`text-red-600 hover:text-red-900 transition-colors ${
                              isDeleting ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={isDeleting}
                            title="Hapus"
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
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <MapPin size={32} className="text-gray-300 mb-2" />
                      <p>Tidak ada data dusun yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredDusun.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                  sampai{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredDusun.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium">{filteredDusun.length}</span>{" "}
                  data
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Simple Pagination Indicator */}
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    {currentPage}
                  </span>

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus "${deleteConfirm.name}"? Data RT yang terhubung mungkin akan terpengaruh.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({show: false, id: "", name: ""})}
      />
    </div>
  );
};

export default DusunList;
