import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {ArrowLeft, Save} from "lucide-react";
import toast from "react-hot-toast";
import {USER} from "../../types";

type UserFormData = Pick<USER, "NAMA" | "EMAIL" | "ROLE">;

const emptyUser: UserFormData = {
  NAMA: "",
  EMAIL: "",
  ROLE: "",
};

const UserForm: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();

  const {addUsers, updateUsers, getUsersById, roles} = useDataContext();

  const [formData, setFormData] = useState<UserFormData>(emptyUser);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  useEffect(() => {
    const fetchUser = async () => {
      if (isEditing && id) {
        try {
          setLoading(true);
          const existingUser = await getUsersById(id);
          if (existingUser) {
            setFormData({
              NAMA: existingUser.NAMA,
              EMAIL: existingUser.EMAIL,
              ROLE: existingUser.ROLE,
            });
          } else {
            navigate("/users");
            toast.error("User tidak ditemukan");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          toast.error("Gagal memuat data User");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, [id, getUsersById, navigate, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: undefined}));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.NAMA.trim()) newErrors.NAMA = "Nama wajib diisi";
    if (!formData.EMAIL.trim()) newErrors.EMAIL = "Email wajib diisi";
    if (!formData.ROLE.trim()) newErrors.ROLE = "Role wajib diisi";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Harap lengkapi semua field yang wajib diisi");
      return;
    }

    try {
      setLoading(true);
      if (isEditing && id) {
        await updateUsers(id, formData);
        toast.success("Data User berhasil diperbarui");
      } else {
        await addUsers(formData);
        toast.success("Data User berhasil ditambahkan");
      }
      navigate("/users");
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Gagal menyimpan data User");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link to="/users" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? "Edit Data User" : "Tambah User Baru"}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium">Nama *</label>
              <input
                name="NAMA"
                value={formData.NAMA}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {errors.NAMA && (
                <p className="text-sm text-red-600">{errors.NAMA}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input
                name="EMAIL"
                type="email"
                value={formData.EMAIL}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {errors.EMAIL && (
                <p className="text-sm text-red-600">{errors.EMAIL}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Role *</label>
              <select
                name="ROLE"
                value={formData.ROLE}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-full rounded-md border px-3 py-2 bg-white"
              >
                <option value="">-- Pilih Role --</option>
                {roles?.map((role: any) => (
                  <option key={role.IDROLE} value={role.IDROLE}>
                    {role.NAMA}
                  </option>
                ))}
              </select>
              {errors.ROLE && (
                <p className="text-sm text-red-600">{errors.ROLE}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4 border-t pt-6">
            <Link to="/users" className="px-4 py-2 border rounded-md">
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {loading ? "Menyimpan..." : isEditing ? "Perbarui" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
