import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDataContext } from "../../contexts/DataContext";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Tag,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationDialog from "../../components/shared/ConfirmationDialog";

// List jenis informasi untuk filter
const CATEGORIES = [
  "Semua",
  "Gotong Royong",
  "Kerja Bakti",
  "Rapat",
  "Pelatihan",
  "Senam",
  "Posyandu",
  "PKK",
  "Dana Desa",
  "Lainnya",
];

const EventList: React.FC = () => {
  const { events, deleteEvent } = useDataContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedEvent, setSelectedEvent] = useState<{
    _id: string;
    nama: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Filter awal berdasarkan teks pencarian
  const searchFilteredEvents = events.filter((event) => {
    return (
      (event.nama?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (event.deskripsi?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (event.lokasi?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (event.jenis?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  // Ambil kategori yang akan ditampilkan
  const activeCategories =
    selectedCategory === "Semua"
      ? CATEGORIES.filter((cat) => cat !== "Semua")
      : [selectedCategory];

  // Hitung total hasil secara keseluruhan
  const totalResults = searchFilteredEvents.filter((event) =>
    selectedCategory === "Semua"
      ? true
      : (event.jenis || "Lainnya").toLowerCase() === selectedCategory.toLowerCase()
  ).length;

  const handleDeleteClick = (event: { _id: string; nama: string }) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;

    try {
      await deleteEvent(selectedEvent._id);
      toast.success("Informasi berhasil dihapus");
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Gagal menghapus Informasi");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Data Informasi/Pengumuman
        </h1>
        <Link
          to="/events/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} className="mr-2" />
          Tambah Informasi
        </Link>
      </div>

      {/* Filter Section (Search Bar + Dropdown Kategori) */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari Informasi..."
            className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Dropdown Filter Jenis / Kategori */}
        <div className="relative min-w-[180px]">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Filter size={16} />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full appearance-none rounded-md border border-gray-300 bg-white pl-9 pr-8 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "Semua" ? "Semua Jenis" : cat}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Grid Informasi Kelompok Per Kategori */}
      {totalResults > 0 ? (
        <div className="space-y-10">
          {activeCategories.map((category) => {
            // Filter per jenis
            const categoryEvents = searchFilteredEvents.filter(
              (event) =>
                (event.jenis || "Lainnya").toLowerCase() === category.toLowerCase()
            );

            // Sembunyikan kategori jika tidak ada data
            if (categoryEvents.length === 0) return null;

            return (
              <section
                key={category}
                className="bg-gray-50/50 rounded-xl p-5 border border-gray-200/80 shadow-sm"
              >
                {/* Header Kategori + Pembatas/Divider */}
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                      <Tag size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {category}
                    </h2>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                      {categoryEvents.length}
                    </span>
                  </div>
                </div>

                {/* Grid Item Card */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryEvents.map((event) => (
                    <div
                      key={event._id}
                      className="overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-gray-200"
                    >
                      <div>
                        <div
                          className="h-44 w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              event.foto ||
                              "https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
                            })`,
                          }}
                        />
                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                              {event.nama}
                            </h3>
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 whitespace-nowrap ml-2 border border-indigo-100">
                              {event.jenis || "Informasi"}
                            </span>
                          </div>

                          <div className="mb-3 flex items-center text-xs text-gray-500">
                            <Calendar size={14} className="mr-1 flex-shrink-0" />
                            <span>{event.tanggal}</span>
                          </div>

                          <p className="mb-4 text-xs text-gray-600 line-clamp-2">
                            {event.deskripsi}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 pt-0 flex justify-end space-x-2">
                        <Link
                          to={`/events/${event._id}`}
                          className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/events/edit/${event._id}`}
                          className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(event)}
                          className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-lg bg-white p-8 text-center shadow-md border border-gray-200">
          <Layers size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">
            Tidak ada Informasi
          </h3>
          <p className="mb-4 text-gray-600">
            Belum ada data Informasi yang sesuai dengan pencarian atau filter jenis "{selectedCategory}".
          </p>
          <Link
            to="/events/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Informasi Baru
          </Link>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus Informasi "${selectedEvent?.nama}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default EventList;