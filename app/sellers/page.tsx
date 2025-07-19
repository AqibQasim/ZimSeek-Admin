"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";

interface Location {
  city: string;
  suburb: string;
}

interface Seller {
  id: string;
  storeName: string;
  sellerName: string;
  phone: string;
  location: Location;
  email: string;
  businessType: string;
  [key: string]: unknown; // Allow additional fields
}

export default function Sellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStoreName, setSearchStoreName] = useState(""); // For store name
  const [searchSellerName, setSearchSellerName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const sellersRef = ref(database, "sellers");
    onValue(
      sellersRef,
      (snapshot) => {
        const sellersData: Seller[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            sellersData.push({
              id: childSnapshot.key || "",
              storeName: data.storeName || "Unknown",
              sellerName: data.sellerName || "Unknown",
              phone: data.phone || "",
              location: data.location || { city: "Unknown", suburb: "Unknown" },
              email: data.email || "",
              businessType: data.businessType || "Unknown",
              ...data, // Include all other fields
            });
          });
        }
        setSellers(sellersData);
      },
      (error) => console.error("Sellers error:", error)
    );
  }, []);

  const filteredSellers = sellers.filter(
    (seller) =>
      seller.phone.toLowerCase().includes(searchTerm.toLowerCase()) &&
      seller.storeName.toLowerCase().includes(searchStoreName.toLowerCase()) &&
      seller.sellerName.toLowerCase().includes(searchSellerName.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name="Sellers" />

        {/* Search Bar */}
        {/* Search Bars */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by store name..."
            value={searchStoreName}
            onChange={(e) => setSearchStoreName(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by seller name..."
            value={searchSellerName}
            onChange={(e) => setSearchSellerName(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sellers Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Store Name</th>
                <th className="p-3">Seller Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Email</th>
                <th className="p-3">Business Type</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/sellers/${seller.id}`)}
                >
                  <td className="p-3">{seller.storeName}</td>
                  <td className="p-3">{seller.sellerName}</td>
                  <td className="p-3">{seller.phone}</td>
                  <td className="p-3">
                    {seller.location.city && seller.location.suburb
                      ? `${seller.location.city}, ${seller.location.suburb}`
                      : "Unknown"}
                  </td>
                  <td className="p-3">{seller.email}</td>
                  <td className="p-3">{seller.businessType}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSellers.length === 0 && (
            <p className="text-center text-gray-500 p-4">No sellers found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
