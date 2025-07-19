"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Stats {
  sellers: number;
  buyers: number;
  products: number;
  orders: number;
}

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  tension: number;
}

interface TrendData {
  labels: string[];
  datasets: Dataset[];
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    sellers: 0,
    buyers: 0,
    products: 0,
    orders: 0,
  });
  const [trends, setTrends] = useState<{
    sellers: TrendData;
    buyers: TrendData;
    products: TrendData;
    orders: TrendData;
  }>({
    sellers: {
      labels: [],
      datasets: [
        {
          label: "Sellers",
          data: [],
          borderColor: "rgb(54, 162, 235)",
          tension: 0.1,
        },
      ],
    },
    buyers: {
      labels: [],
      datasets: [
        {
          label: "Buyers",
          data: [],
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    products: {
      labels: [],
      datasets: [
        {
          label: "Products",
          data: [],
          borderColor: "rgb(255, 205, 86)",
          tension: 0.1,
        },
      ],
    },
    orders: {
      labels: [],
      datasets: [
        {
          label: "Orders",
          data: [],
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
        },
      ],
    },
  });

  useEffect(() => {
    const sellersRef = ref(database, "sellers");
    const buyersRef = ref(database, "buyers");
    const productsRef = ref(database, "products");
    const ordersRef = ref(database, "orders");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const processData = (snapshot: any, type: keyof Stats) => {
      let totalCount = 0;
      let dailyCounts: number[] = new Array(7).fill(0);
      let labels: string[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot: any) => {
          totalCount++; // Count total children
          const data = childSnapshot.val();
          const createdAt = data.createdAt ? new Date(data.createdAt) : null;
          if (createdAt && createdAt >= sevenDaysAgo) {
            const daysAgo = Math.floor(
              (new Date().getTime() - createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (daysAgo < 7) dailyCounts[6 - daysAgo]++; // Count for past 7 days
          }
        });
        console.log(`Total ${type}: ${totalCount}`); // Debug log
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString());
        }
      }
      setStats((prev) => ({ ...prev, [type]: totalCount }));
      setTrends((prev) => ({
        ...prev,
        [type]: {
          labels,
          datasets: [{ ...prev[type].datasets[0], data: dailyCounts }],
        },
      }));
    };

    onValue(
      sellersRef,
      (snapshot) => processData(snapshot, "sellers"),
      (error) => console.error("Sellers error:", error)
    );
    onValue(
      buyersRef,
      (snapshot) => processData(snapshot, "buyers"),
      (error) => console.error("Buyers error:", error)
    );
    onValue(
      productsRef,
      (snapshot) => processData(snapshot, "products"),
      (error) => console.error("Products error:", error)
    );
    onValue(
      ordersRef,
      (snapshot) => processData(snapshot, "orders"),
      (error) => console.error("Orders error:", error)
    );
  }, []);

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name="Dashboard" />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <a href="/sellers">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Sellers
              </h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.sellers}
              </p>
            </div>
          </a>
          <a href="/buyers">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Buyers
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.buyers}
              </p>
            </div>
          </a>
          <a href="/products">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Products
              </h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.products}
              </p>
            </div>
          </a>
          <a href="/orders">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {stats.orders}
              </p>
            </div>
          </a>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Sellers (Past 7 Days)
            </h2>
            <div className="h-48">
              <Line data={trends.sellers} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Buyers (Past 7 Days)
            </h2>
            <div className="h-48">
              <Line data={trends.buyers} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Products (Past 7 Days)
            </h2>
            <div className="h-48">
              <Line data={trends.products} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Orders (Past 7 Days)
            </h2>
            <div className="h-48">
              <Line data={trends.orders} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
