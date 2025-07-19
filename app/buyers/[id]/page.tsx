"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";

interface Inquiry {
  id: string;
  buyerId: string;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

interface Buyer {
  id: string;
  name: string;
  phone: string;
  joinedDate?: string;
}

export default function BuyerInquiries() {
  const { id } = useParams();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [buyer, setBuyer] = useState<Buyer | null>(null);

  useEffect(() => {
    const inquiriesRef = ref(database, "inquiries");
    const buyerRef = ref(database, "buyers/" + id);

    onValue(
      inquiriesRef,
      (snapshot) => {
        const inquiriesData: Inquiry[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.buyerId === id) {
              inquiriesData.push({
                id: childSnapshot.key || "",
                buyerId: data.buyerId || "",
                message: data.message || "Unknown",
                timestamp: data.timestamp || "",
                ...data,
              });
            }
          });
        }
        setInquiries(inquiriesData);
      },
      (error) => console.error("Inquiries error:", error)
    );

    get(buyerRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBuyer({
          id: snapshot.key || "",
          name: data.name || "Unknown",
          phone: data.phone || "",
          joinedDate: data.joinedDate || "",
        });
      }
    });
  }, [id]);

  const buyerName = buyer ? buyer.name : "Unknown";

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name={`All Inquiries of ${buyerName}`} />
        {/* Inquiries Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Message</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Buyer Name</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{inquiry.message}</td>
                  <td className="p-3">
                    {inquiry.timestamp
                      ? new Date(
                          parseInt(inquiry.timestamp)
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        })
                      : "N/A"}
                  </td>
                  <td className="p-3">{buyerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 && (
            <p className="text-center text-gray-500 p-4">
              No inquiries found for this buyer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
