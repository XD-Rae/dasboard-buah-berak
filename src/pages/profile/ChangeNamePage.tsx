import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {User, Save, ArrowLeft, Loader2} from "lucide-react";
import toast from "react-hot-toast";
import {useAuth} from "../../contexts/AuthContext";
import {userAPI} from "../../services/api";

export default function ChangeNamePage() {
  const navigate = useNavigate();
  const {user} = useAuth(); // Pastikan AuthContext Anda punya method updateUser jika ingin real-time update

  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    if (newName === user?.name) {
      toast("Tidak ada perubahan nama", {icon: "ℹ️"});
      return;
    }

    setIsLoading(true);

    try {
      const id = user?.id;
      const payload = {newName: newName};

      const response = await userAPI.changeName(id, payload);

      if (response.status === false) {
        throw new Error(response.message || "Gagal mengubah nama");
      }

      // Update LocalStorage & Refresh
      const updatedUser = {...user, name: newName};
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Nama berhasil diperbarui!");
      navigate("/profile");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Kembali</span>
        </button>

        {/* Page Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-24 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Ubah Nama Tampilan
          </h1>
          <p className="text-blue-100 text-sm mt-1">
            Perbarui identitas profil Anda
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Icon Header */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                <User size={32} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nama Lengkap Baru
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900 bg-gray-50/50 focus:bg-white"
                    placeholder="Masukkan nama lengkap..."
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500 flex items-center mt-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                  Nama ini akan digunakan pada seluruh dokumen dan laporan.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 flex justify-center items-center gap-2 px-6 py-3 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Decorative */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Perubahan nama mungkin memerlukan waktu beberapa saat untuk
              terlihat di semua halaman.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
