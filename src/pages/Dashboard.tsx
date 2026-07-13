import React from "react";
import {useDataContext} from "../contexts/DataContext";
import {useAuth} from "../contexts/AuthContext";
import {Users, Award, Building, Calendar} from "lucide-react";
import {Link} from "react-router-dom";

const Dashboard: React.FC = () => {
  // Mengganti faculty menjadi aparatur
  const {aparatur, events} = useDataContext();
  const {user} = useAuth();

  const StatCard = ({
    title,
    value,
    icon,
    bgColor,
    linkTo,
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    bgColor: string;
    linkTo: string;
  }) => {
    return (
      <Link to={linkTo} className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-2 ${bgColor}`}>
              {icon}
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (user?.role === "dosen") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dashboard Aparatur
        </h1>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Data Aparatur
              </h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {aparatur.map((a) => (
                  <li key={a._id} className="py-3">
                    <Link
                      to={`/aparatur/${a._id}`}
                      className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {a.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {a.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {a.fields.join(", ")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link
                  to="/aparatur/new"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Tambah Data Aparatur
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Aparatur"
          value={aparatur.length}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-100"
          linkTo="/aparatur"
        />
        <StatCard
          title="Total Kegiatan"
          value={events.length}
          icon={<Calendar className="h-6 w-6 text-purple-600" />}
          bgColor="bg-purple-100"
          linkTo="/events"
        />
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Aparatur Terbaru
            </h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {aparatur.slice(0, 5).map((a) => (
                <li key={a._id} className="py-3">
                  <Link
                    to={`/aparatur/${a._id}`}
                    className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {a.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {a.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {a.fields.join(", ")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link
                to="/aparatur"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Lihat Semua Aparatur
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
