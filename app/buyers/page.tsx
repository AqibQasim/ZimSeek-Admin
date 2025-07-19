"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";

interface Buyer {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
  [key: string]: any; // Allow additional fields
}

export default function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchName, setSearchName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const buyersRef = ref(database, "buyers");
    onValue(
      buyersRef,
      (snapshot) => {
        const buyersData: Buyer[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            console.log("Buyer data:", data);
            buyersData.push({
              id: childSnapshot.key || "",
              name: data.name || "Unknown",
              phone: data.phone || "",
              createdAt: data.createdAt || "",
              ...data, // Include all other fields
            });
          });
        }
        setBuyers(buyersData);
      },
      (error) => console.error("Buyers error:", error)
    );
  }, []);

  const filteredBuyers = buyers.filter(
    (buyer) =>
      buyer.phone.toLowerCase().includes(searchTerm.toLowerCase()) &&
      buyer.name.toLowerCase().includes(searchName.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name="Buyers" />

        {/* Search Bar */}
        <div className="mb-6  flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Buyers Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer) => (
                <tr
                  key={buyer.id}
                  className="border-b hover:bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/buyers/${buyer.id}`)}
                >
                  <td className="p-3">{buyer.name}</td>
                  <td className="p-3">{buyer.phone}</td>
                  <td className="p-3">
                    {buyer.createdAt
                      ? new Date(buyer.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }) || "Invalid Date"
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBuyers.length === 0 && (
            <p className="text-center text-gray-500 p-4">No buyers found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
