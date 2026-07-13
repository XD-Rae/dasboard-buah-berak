import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  ArrowLeft,
  Lock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {useAuth} from "../../contexts/AuthContext";
import {userAPI} from "../../services/api";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const {user} = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password Strength Logic
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    strength = Object.values(checks).filter(Boolean).length;
    return {score: strength, percent: (strength / 5) * 100};
  };

  const {score, percent} = calculatePasswordStrength(formData.newPassword);

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.currentPassword)
      newErrors.currentPassword = "Password lama wajib diisi";

    if (!formData.newPassword) {
      newErrors.newPassword = "Password baru wajib diisi";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Minimal 8 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "Password baru tidak boleh sama dengan password lama";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const data = {
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      const response = await userAPI.changePassword(user?.id, data);

      if (response.status === false) {
        throw new Error(response.message || "Gagal mengganti password");
      }

      toast.success("Password berhasil diperbarui!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      navigate("/profile");
    } catch (error: any) {
      console.error(error);
      const msg =
        error.response?.data?.message || error.message || "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShow = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({...prev, [field]: !prev[field]}));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 1. Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-800">
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
            Ganti Password
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Amankan akun Anda secara berkala
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            {/* Icon Header */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <Shield size={32} />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* CURRENT PASSWORD */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Password Lama
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-gray-50/50 focus:bg-white ${
                      errors.currentPassword
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                    placeholder="Masukkan password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("current")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-600 text-xs flex items-center mt-1 ml-1 font-medium">
                    <AlertCircle size={12} className="mr-1.5" />{" "}
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-400 text-xs font-medium uppercase tracking-wider">
                    Password Baru
                  </span>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Buat Password Baru
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({...formData, newPassword: e.target.value})
                    }
                    className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-gray-50/50 focus:bg-white ${
                      errors.newPassword
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                    placeholder="Min. 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("new")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPasswords.new ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-600 text-xs flex items-center mt-1 ml-1 font-medium">
                    <AlertCircle size={12} className="mr-1.5" />{" "}
                    {errors.newPassword}
                  </p>
                )}

                {/* Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-500">Kekuatan Password</span>
                      <span
                        className={`${
                          score < 3
                            ? "text-red-500"
                            : score < 4
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {score < 3 ? "Lemah" : score < 4 ? "Sedang" : "Kuat"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                          score < 3
                            ? "bg-red-500"
                            : score < 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{width: `${percent}%`}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Konfirmasi Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`block w-full pl-12 pr-12 py-3.5 border rounded-xl focus:ring-2 focus:outline-none transition-all bg-gray-50/50 focus:bg-white ${
                      errors.confirmPassword
                        ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                        : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow("confirm")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs flex items-center mt-1 ml-1 font-medium">
                    <AlertCircle size={12} className="mr-1.5" />{" "}
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* BUTTONS */}
              <div className="pt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 flex justify-center items-center gap-2 px-6 py-3.5 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Tip */}
          <div className="bg-indigo-50/50 px-8 py-4 border-t border-indigo-100/50 text-center">
            <p className="text-xs text-indigo-600 font-medium">
              Tips: Gunakan kombinasi huruf besar, angka, dan simbol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
