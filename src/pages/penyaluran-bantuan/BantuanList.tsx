import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useDataContext} from "../../contexts/DataContext";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Printer,
  Trophy,
  Info,
  AlertCircle,
  Filter, // Tambahan Icon Filter
} from "lucide-react";
import {useAuth} from "../../contexts/AuthContext";

// Definisi Tipe Data Bantuan (Hasil SAW)
interface BantuanData {
  _id: string;
  rank: number;
  nama: string;
  dusun: string; // Pastikan backend SAW mengembalikan field ini!
  finalScore: number;
  raw: {
    gaji: number;
    usia: number;
    tanggungan: number;
    penyakit: string;
    rumah: string;
    aset: string;
  };
}

const BantuanList: React.FC = () => {
  // 1. Ambil data bantuan, dusun, dan USER LOGIN
  const {bantuan, dusun} = useDataContext() as any;
  const {user} = useAuth() as any;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDusun, setSelectedDusun] = useState(""); // State Filter Dusun
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. LOGIKA FILTERING UTAMA
  const filteredData = (bantuan || []).filter((item: BantuanData) => {
    console.log(item);
    // --- Filter 1: RBAC (Role Based Access Control) ---
    // Jika user adalah KDUS, paksa filter hanya dusun miliknya
    if (user?.role === "KDUS" && user?.idDusun) {
      if (item?.raw.dusun !== user.idDusun) {
        return false;
      }
    }

    // --- Filter 2: Pencarian Teks ---
    const matchesSearch = item.nama
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // --- Filter 3: Dropdown Dusun (Admin Only) ---
    const matchesDusun = selectedDusun === "" || item.dusun === selectedDusun;

    return matchesSearch && matchesDusun;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getStatusLabel = (score: number) => {
    if (score >= 0.8) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          Sangat Prioritas
        </span>
      );
    } else if (score >= 0.6) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Prioritas
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          Kurang Prioritas
        </span>
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Data Penerima Bantuan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hasil perangkingan penduduk berdasarkan metode SAW (Simple Additive
            Weighting).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer size={16} className="mr-2" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Search & Filter Area */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search Bar */}
        <div className="relative md:col-span-2">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari Nama Penerima..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Dropdown Filter Dusun (HANYA MUNCUL JIKA BUKAN KDUS) */}
        {user?.role !== "KDUS" && (
          <div className="relative">
            <Filter
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <select
              className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer shadow-sm"
              value={selectedDusun}
              onChange={(e) => {
                setSelectedDusun(e.target.value);
                setCurrentPage(1);
              }}
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

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-20">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nama Penduduk
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Nilai Akhir
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Info Ekonomi
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Detail
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((item: BantuanData) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      item.rank <= 3 ? "bg-yellow-50/30" : ""
                    }`}
                  >
                    {/* Kolom Ranking */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          item.rank === 1
                            ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400"
                            : item.rank === 2
                              ? "bg-gray-200 text-gray-700 ring-2 ring-gray-400"
                              : item.rank === 3
                                ? "bg-orange-100 text-orange-800 ring-2 ring-orange-400"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {item.rank}
                      </div>
                    </td>

                    {/* Kolom Nama */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {item.nama}
                      </div>
                      <div className="text-xs text-gray-500 md:hidden">
                        Skor: {item.finalScore?.toFixed(4)}
                      </div>
                    </td>

                    {/* Kolom Skor Akhir */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {item.finalScore?.toFixed(4)}
                      </div>
                    </td>

                    {/* Kolom Status */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusLabel(item.finalScore)}
                    </td>

                    {/* Kolom Info Ekonomi */}
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                      <div className="flex flex-col text-xs gap-1">
                        <span className="flex items-center gap-1">
                          💰 {formatRupiah(item.raw?.gaji || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          👨‍👩‍👧‍👦 {item.raw?.tanggungan} Tanggungan
                        </span>
                      </div>
                    </td>

                    {/* Kolom Aksi */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <Link
                        to={`/bantuan/${item._id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50"
                        title="Lihat Detail"
                      >
                        <Info size={20} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle size={40} className="mb-3 text-gray-300" />
                      <p className="font-medium text-gray-600">
                        Data tidak ditemukan
                      </p>
                      <p className="text-xs mt-1">
                        {bantuan?.length === 0
                          ? "Belum ada data hasil perhitungan SAW."
                          : "Coba kata kunci pencarian lain atau ganti filter dusun."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3 bg-gray-50">
            <p className="text-sm text-gray-700">
              Menampilkan{" "}
              <span className="font-medium">{indexOfFirstItem + 1}</span> -{" "}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredData.length)}
              </span>{" "}
              dari <span className="font-medium">{filteredData.length}</span>{" "}
              data
            </p>
            <div className="flex space-x-1">
              <button
                className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="px-4 py-1 text-sm font-medium bg-white border rounded-md flex items-center">
                Hal. {currentPage} / {totalPages}
              </span>

              <button
                className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
};

export default BantuanList;
