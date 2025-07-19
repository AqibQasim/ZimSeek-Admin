"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
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
  [key: string]: unknown; // Allow additional fields
}

interface Seller {
  id: string;
  sellerName: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<{ [key: string]: Seller }>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const productsRef = ref(database, "products");
    const sellersRef = ref(database, "sellers");

    onValue(
      productsRef,
      (snapshot) => {
        const productsData: Product[] = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
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
          });
        }
        setProducts(productsData);
      },
      (error) => console.error("Products error:", error)
    );

    onValue(
      sellersRef,
      (snapshot) => {
        const sellersData: { [key: string]: Seller } = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            sellersData[childSnapshot.key || ""] = {
              id: childSnapshot.key || "",
              sellerName: data.sellerName || "Unknown",
            };
          });
        }
        setSellers(sellersData);
      },
      (error) => console.error("Sellers error:", error)
    );
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map sellerId to sellerName
  const productsWithSellerName = filteredProducts.map((product) => ({
    ...product,
    sellerName: sellers[product.sellerId]?.sellerName || "Unknown",
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name="Products" />

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
              {productsWithSellerName.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.price || "N/A"}</td>
                  <td className="p-3">{product.unit}</td>
                  <td className="p-3">{product.city}</td>
                  <td className="p-3">{product.sellerName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {productsWithSellerName.length === 0 && (
            <p className="text-center text-gray-500 p-4">No products found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
