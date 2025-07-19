"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, get } from "firebase/database";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  city: string;
  sellerId: string;
  [key: string]: any;
}

interface Seller {
  id: string;
  storeName: string;
  sellerName: string;
  phone: string;
  location: { city: string; suburb: string };
  email: string;
  businessType: string;
}

export default function SellerProducts() {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [sellers, setSellers] = useState<{ [key: string]: Seller }>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const productsRef = ref(database, "products");
    const sellerRef = ref(database, "sellers/" + id);
    const sellersRef = ref(database, "sellers");

    onValue(
      productsRef,
      (snapshot) => {
        const productsData: Product[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            if (data.sellerId === id) {
              productsData.push({
                id: childSnapshot.key || "",
                name: data.name || "Unknown",
                category: data.category || "Unknown",
                price: data.price || 0,
                unit: data.unit || "USD",
                city: data.city || "Unknown",
                sellerId: data.sellerId || "",
                ...data,
              });
            }
          });
        }
        setProducts(productsData);
      },
      (error) => console.error("Products error:", error)
    );

    get(sellerRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSeller({
          id: snapshot.key || "",
          storeName: data.storeName || "Unknown",
          sellerName: data.sellerName || "Unknown",
          phone: data.phone || "",
          location: data.location || { city: "Unknown", suburb: "Unknown" },
          email: data.email || "",
          businessType: data.businessType || "Unknown",
        });
      }
    });

    onValue(
      sellersRef,
      (snapshot) => {
        const sellersData: { [key: string]: Seller } = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            sellersData[childSnapshot.key || ""] = {
              id: childSnapshot.key || "",
              storeName: data.storeName || "Unknown",
              sellerName: data.sellerName || "Unknown",
              phone: data.phone || "",
              location: data.location || { city: "Unknown", suburb: "Unknown" },
              email: data.email || "",
              businessType: data.businessType || "Unknown",
            };
          });
        }
        setSellers(sellersData);
      },
      (error) => console.error("Sellers error:", error)
    );
  }, [id?.toString()]);

  const sellerName = seller
    ? seller.sellerName
    : (id && sellers[id.toString()]?.sellerName) || "Unknown";

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name={`All Products of ${sellerName}`} />

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Unit</th>
                <th className="p-3">City</th>
                <th className="p-3">Seller Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.price || "N/A"}</td>
                  <td className="p-3">{product.unit}</td>
                  <td className="p-3">{product.city}</td>
                  <td className="p-3">{sellerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <p className="text-center text-gray-500 p-4">
              No products found for this seller.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
