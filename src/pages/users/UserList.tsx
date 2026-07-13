import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {useAuth} from "../../contexts/AuthContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";
import {User} from "../../types";

const UserList: React.FC = () => {
  const {users, deleteUsers} = useDataContext();
  const {user} = useAuth();
  console.log(user);

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

  // Filter Users
  const filteredUsers = (users || []).filter((u: User) => {
    const term = searchTerm.toLowerCase();
    return (
      u.NAMA.toLowerCase().includes(term) ||
      u.IDUSER.toLowerCase().includes(term) ||
      u.EMAIL.toLowerCase().includes(term)
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

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
      await deleteUsers(deleteConfirm.id);
      toast.success(`User ${deleteConfirm.name} berhasil dihapus`);
      setDeleteConfirm({show: false, id: "", name: ""});
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(`${error}`);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Users</h1>

        <Link
          to="/users/new"
          className="mt-4 md:mt-0 inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah User
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
            placeholder="Cari berdasarkan ID, Nama, atau Email..."
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
                {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  ID User
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((u: User) => (
                  <tr key={u.IDUSER} className="hover:bg-gray-50">
                    {/* <td className="px-6 py-4 text-sm font-medium">
                      {u.IDUSER}
                    </td> */}
                    <td className="px-6 py-4 text-sm">{u.NAMA}</td>
                    <td className="px-6 py-4 text-sm">{u.EMAIL}</td>
                    <td className="px-6 py-4 text-sm">{u.ROLE}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(u.CREATED_AT)}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <div className="flex justify-center space-x-3">
                        <Link
                          to={`/users/${u.IDUSER}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={18} />
                        </Link>

                        {user?.role === "ADM" && (
                          <button
                            onClick={() => handleDeleteClick(u.IDUSER, u.NAMA)}
                            className={`text-red-600 hover:text-red-900 ${
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
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Tidak ada data user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
              {filteredUsers.length} results
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={currentPage === i + 1 ? "font-bold" : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus User "${deleteConfirm.name}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({show: false, id: "", name: ""})}
      />
    </div>
  );
};

export default UserList;
