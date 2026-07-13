import React, {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Edit, Trash2, Mail, User, Shield} from "lucide-react";
import toast from "react-hot-toast";

const UserDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {getUsersById, deleteUsers} = useDataContext();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await getUsersById(id || "");
        console.log(data);
        setUser(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Gagal memuat data user");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, getUsersById]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          User tidak ditemukan
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "Data User dengan ID tersebut tidak ditemukan."}
        </p>
        <Link
          to="/users"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar User
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus user ${user.NAMA}?`)) {
      try {
        await deleteUsers(user._id);
        toast.success("Data user berhasil dihapus");
        navigate("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Gagal menghapus data user");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/users" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail User</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/users/edit/${user.IDUSER}`}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Informasi User</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.NAMA?.charAt(0)}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {user.NAMA}
              </h3>
              <p className="text-sm text-gray-600">{user.EMAIL}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </div>
              <p className="mt-1 text-gray-900">{user.EMAIL}</p>
            </div>

            <div>
              <div className="flex items-center text-sm font-medium text-gray-500">
                <Shield className="h-4 w-4 mr-2" />
                Role
              </div>
              <p className="mt-1 text-gray-900">{user.ROLE}</p>
            </div>

            {user.CREATED_AT && (
              <div>
                <div className="flex items-center text-sm font-medium text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  Dibuat Pada
                </div>
                <p className="mt-1 text-gray-900">
                  {new Date(user.CREATED_AT).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
