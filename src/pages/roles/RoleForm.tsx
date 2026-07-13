import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
// Asumsikan context Anda sudah disesuaikan untuk handle Role
// Jika belum, sesuaikan nama functionnya (misal: addRole, getRoleById)
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Save} from "lucide-react";
import toast from "react-hot-toast";

// Definisikan tipe data sesuai Mongoose Schema
interface RoleData {
  _id?: string; // ID bawaan mongoDB (optional untuk payload, ada saat fetch)
  IDROLE: string;
  NAMA: string;
}

const emptyRole: RoleData = {
  IDROLE: "",
  NAMA: "",
};

const RoleForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  // Pastikan context Anda memiliki method ini
  const {addRole, updateRole, getRoleById} = useDataContext();

  const [formData, setFormData] = useState<RoleData>(emptyRole);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  // Fetch Data jika mode Edit
  useEffect(() => {
    const fetchRoleData = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const existingRole = await getRoleById(id);
          if (existingRole) {
            setFormData({
              IDROLE: existingRole.IDROLE,
              NAMA: existingRole.NAMA,
            });
          } else {
            navigate("/roles");
            toast.error("Role tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          toast.error("Gagal memuat data Role");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRoleData();
  }, [id, getRoleById, navigate, isEditing]);

  // Handle Perubahan Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    // Hapus error realtime saat user mengetik
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: undefined}));
    }
  };

  // Validasi Sederhana
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.IDROLE.trim()) newErrors.IDROLE = "ID Role wajib diisi";
    if (!formData.NAMA.trim()) newErrors.NAMA = "Nama Role wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await updateRole(id, formData);
        toast.success("Data Role berhasil diperbarui");
      } else {
        await addRole(formData);
        toast.success("Data Role berhasil ditambahkan");
      }
      navigate("/roles");
    } catch (error) {
      console.error("Error saving role:", error);
      toast.error("Gagal menyimpan data Role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/roles" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Data Role" : "Tambah Role Baru"}
          </h1>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* ID ROLE Input */}
            <div>
              <label
                htmlFor="IDROLE"
                className="block text-sm font-medium text-gray-700"
              >
                ID Role (Kode) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="IDROLE"
                name="IDROLE"
                value={formData.IDROLE}
                onChange={handleChange}
                disabled={loading} // Bisa didisable jika ID tidak boleh diganti saat edit
                placeholder="Contoh: ADM, USR, GURU"
                className={`mt-1 block w-full rounded-md border ${
                  errors.IDROLE ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {errors.IDROLE && (
                <p className="mt-1 text-sm text-red-600">{errors.IDROLE}</p>
              )}
            </div>

            {/* NAMA ROLE Input */}
            <div>
              <label
                htmlFor="NAMA"
                className="block text-sm font-medium text-gray-700"
              >
                Nama Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="NAMA"
                name="NAMA"
                value={formData.NAMA}
                onChange={handleChange}
                disabled={loading}
                placeholder="Contoh: Administrator, User Biasa"
                className={`mt-1 block w-full rounded-md border ${
                  errors.NAMA ? "border-red-300" : "border-gray-300"
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
              />
              {errors.NAMA && (
                <p className="mt-1 text-sm text-red-600">{errors.NAMA}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
            <Link
              to="/roles"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} className="mr-2" />
              {loading
                ? "Menyimpan..."
                : isEditing
                  ? "Perbarui Data"
                  : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;
