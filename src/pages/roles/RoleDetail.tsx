import React, {useEffect, useState} from "react";
import {useParams, Link, useNavigate} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Book,
  Award,
  GraduationCap,
  FileText,
  Users,
  Calendar,
  Link as LinkIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {aparaturAPI} from "../../services/api"; // Mengganti import facultyAPI

type ResearchTab = "publications" | "hki" | "pengabdian";

const RoleDetail: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  // Mengganti deleteFaculty menjadi deleteAparatur
  const {deleteAparatur} = useDataContext();
  // Mengganti state faculty menjadi aparatur
  const [aparatur, setAparatur] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ResearchTab>("publications");

  useEffect(() => {
    const fetchAparatur = async () => {
      try {
        setLoading(true);
        // Mengganti pemanggilan API
        const data = await aparaturAPI.getById(id || "");
        setAparatur(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching aparatur:", err);
        setError("Gagal memuat data aparatur");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAparatur();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !aparatur) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Aparatur tidak ditemukan
        </h2>
        <p className="mt-2 text-gray-600">
          {error || "Data Aparatur dengan ID tersebut tidak ditemukan."}
        </p>
        <Link
          to="/aparatur" // Mengganti route
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar Aparatur
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (
      window.confirm(
        `Anda yakin ingin menghapus data aparatur ${aparatur.name}?`,
      )
    ) {
      try {
        await deleteAparatur(aparatur._id);
        toast.success("Data aparatur berhasil dihapus");
        navigate("/aparatur"); // Mengganti route redirect
      } catch (error) {
        console.error("Error deleting aparatur:", error);
        toast.error("Gagal menghapus data aparatur");
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/aparatur" // Mengganti route
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Aparatur</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/aparatur/edit/${aparatur._id}`} // Mengganti route edit
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2">
          <div className="rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">
                Informasi Aparatur
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                {aparatur.foto ? (
                  <img
                    src={aparatur.foto}
                    alt={aparatur.name}
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className =
                          "h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold";
                        fallback.textContent = aparatur.name.charAt(0);
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {aparatur.name.charAt(0)}
                  </div>
                )}
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {aparatur.name}
                  </h3>
                  <p className="text-sm text-gray-600">{aparatur.position}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">NIK</p>
                  <p className="text-gray-900">{aparatur.nidn}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Jabatan</p>
                  <p className="text-gray-900">{aparatur.fields.join(", ")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-gray-900">AKTIF</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Lain-lain
                </h3>
                {aparatur.education && aparatur.education.length > 0 ? (
                  <div className="space-y-4">
                    {aparatur.education.map((edu: any, index: number) => (
                      <div key={index} className="rounded-md bg-gray-50 p-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-500">
                            Jenjang Pendidikan :{" "}
                          </p>
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <span className="ml-2 font-medium text-gray-900">
                            {edu.degree}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-500">
                            Jenis Kelamin :{" "}
                          </p>
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <span className="ml-2 font-medium text-gray-900">
                            {edu.year}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-500">
                            Agama :{" "}
                          </p>
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <span className="ml-2 font-medium text-gray-900">
                            {edu.institution}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-500">
                            Tempat, Tanggal Lahir :{" "}
                          </p>
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <span className="ml-2 font-medium text-gray-900">
                            {edu.field}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data pendidikan</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Alamat
                </h3>
                {aparatur.courses && aparatur.courses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {aparatur.courses.map((course: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        <Book className="mr-1 h-4 w-4" />
                        {course}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data alamat</p>
                )}
              </div>

              {/* Research Tabs */}
              <div className="mt-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab("publications")}
                      className={`${
                        activeTab === "publications"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                      <FileText className="inline-block h-5 w-5 mr-2" />
                      Publikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("hki")}
                      className={`${
                        activeTab === "hki"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                      <Award className="inline-block h-5 w-5 mr-2" />
                      HKI
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("pengabdian")}
                      className={`${
                        activeTab === "pengabdian"
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                      <Users className="inline-block h-5 w-5 mr-2" />
                      Pengabdian Masyarakat
                    </button>
                  </nav>
                </div>

                <div className="mt-6">
                  {/* Publications Tab */}
                  {activeTab === "publications" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data Publikasi
                      </h3>
                      {aparatur.publications &&
                      aparatur.publications.length > 0 ? (
                        <div className="space-y-4">
                          {aparatur.publications.map(
                            (pub: any, index: number) => (
                              <div
                                key={index}
                                className="rounded-md border border-gray-200 p-4"
                              >
                                <div className="flex items-start">
                                  <FileText className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                  <div className="ml-3">
                                    <p className="font-medium text-gray-900">
                                      {pub.title}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Tahun: {pub.year}
                                    </p>
                                    {pub.link && (
                                      <a
                                        href={pub.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                      >
                                        <LinkIcon size={14} className="mr-1" />
                                        Lihat Publikasi
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          Tidak ada data publikasi
                        </p>
                      )}
                    </div>
                  )}

                  {/* HKI Tab */}
                  {activeTab === "hki" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data HKI
                      </h3>
                      {aparatur.hki && aparatur.hki.length > 0 ? (
                        <div className="space-y-4">
                          {aparatur.hki.map((item: any, index: number) => (
                            <div
                              key={index}
                              className="rounded-md border border-gray-200 p-4"
                            >
                              <div className="flex items-start">
                                <Award className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">
                                    {item.judulHKI}
                                  </p>
                                  <div className="mt-1 space-y-1 text-sm text-gray-600">
                                    <p>Nomor: {item.nomorHKI}</p>
                                    <p>Tanggal: {item.tanggalHKI}</p>
                                  </div>
                                  {item.linkDriveHKI && (
                                    <a
                                      href={item.linkDriveHKI}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                                    >
                                      <LinkIcon size={14} className="mr-1" />
                                      Lihat Dokumen
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Tidak ada data HKI</p>
                      )}
                    </div>
                  )}

                  {/* Community Service Tab */}
                  {activeTab === "pengabdian" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Data Pengabdian Masyarakat
                      </h3>
                      {aparatur.pengabdian && aparatur.pengabdian.length > 0 ? (
                        <div className="space-y-6">
                          {aparatur.pengabdian.map(
                            (item: any, index: number) => (
                              <div
                                key={index}
                                className="rounded-md border border-gray-200 p-4"
                              >
                                <div className="flex items-start">
                                  <Users className="h-5 w-5 text-indigo-600 mt-1 flex-shrink-0" />
                                  <div className="ml-3 flex-1">
                                    <p className="font-medium text-gray-900">
                                      {item.judulPengabdian}
                                    </p>
                                    <div className="mt-1 flex items-center text-sm text-gray-600">
                                      <Calendar size={14} className="mr-1" />
                                      <span>{item.tanggalMulai}</span>
                                      <span className="mx-2">s/d</span>
                                      <span>{item.tanggalSelesai}</span>
                                    </div>
                                    <p className="mt-2 text-gray-700">
                                      {item.deskripsi}
                                    </p>
                                    {item.gambarPengabdian &&
                                      item.gambarPengabdian.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                          {item.gambarPengabdian.map(
                                            (img: string, imgIndex: number) => (
                                              <img
                                                key={imgIndex}
                                                src={img}
                                                alt={`Dokumentasi ${
                                                  imgIndex + 1
                                                }`}
                                                className="h-24 w-full rounded-lg object-cover"
                                              />
                                            ),
                                          )}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          Tidak ada data pengabdian masyarakat
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <div className="rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Kontak</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <p className="ml-2 text-sm font-medium text-gray-500">
                    Email
                  </p>
                </div>
                <p className="mt-1 text-gray-900">{aparatur.email}</p>
              </div>

              {aparatur.phone && (
                <div className="mb-4">
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      Telepon
                    </p>
                  </div>
                  <p className="mt-1 text-gray-900">{aparatur.phone}</p>
                </div>
              )}

              {aparatur.address && (
                <div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm font-medium text-gray-500">
                      Alamat
                    </p>
                  </div>
                  <p className="mt-1 text-gray-900">{aparatur.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;
