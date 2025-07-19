"use client";

import { useEffect, useState } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";
import Header from "@/components/Header";
import Sidenav from "@/components/Sidenav";
interface Order {
  id: string;
  sellerId: string;
  buyerId: string;
  productId: string;
  deliveryInfo: string;
  createdAt: string;
  status: string;
  [key: string]: unknown; // Allow additional fields
}

interface Seller {
  id: string;
  sellerName: string;
  phone: string;
}

interface Buyer {
  id: string;
  name: string;
  phone: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<{ [key: string]: Seller }>({});
  const [buyers, setBuyers] = useState<{ [key: string]: Buyer }>({});
  const [searchSeller, setSearchSeller] = useState("");
  const [searchBuyer, setSearchBuyer] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [statuses, setStatuses] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [products, setProducts] = useState<{
    [key: string]: { name: string; [key: string]: unknown };
  }>({});

  // Define status options
  const statusOptions = [
    "Pending",
    "Approved",
    "Dispatched",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    const ordersRef = ref(database, "orders");
    const sellersRef = ref(database, "sellers");
    const buyersRef = ref(database, "buyers");
    const productsRef = ref(database, "products");

    onValue(
      ordersRef,
      (snapshot) => {
        const ordersData: Order[] = [];
        const initialStatuses: { [key: string]: string } = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            console.log("Order data:", data);
            ordersData.push({
              id: childSnapshot.key || "",
              sellerId: data.sellerId || "",
              buyerId: data.buyerId || "",
              product: data.product || "Unknown",
              deliveryInfo: data.deliveryInfo || { address: "Unknown" },
              createdAt: data.createdAt || "",
              status: data.status || "Unknown",
              ...data,
            });
            initialStatuses[childSnapshot.key || ""] = data.status || "Unknown";
          });
        }
        setOrders(ordersData);
        setStatuses(initialStatuses);
      },
      (error) => console.error("Orders error:", error)
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
              phone: data.phone || "",
            };
          });
        }
        setSellers(sellersData);
      },
      (error) => console.error("Sellers error:", error)
    );

    onValue(
      buyersRef,
      (snapshot) => {
        const buyersData: { [key: string]: Buyer } = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            buyersData[childSnapshot.key || ""] = {
              id: childSnapshot.key || "",
              name: data.name || "Unknown",
              phone: data.phone || "",
            };
          });
        }
        setBuyers(buyersData);
      },
      (error) => console.error("Buyers error:", error)
    );

    onValue(
      productsRef,
      (snapshot) => {
        const productsData: {
          [key: string]: { name: string; [key: string]: unknown };
        } = {};
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            productsData[childSnapshot.key || ""] = {
              name: data.name || "Unknown",
              ...data,
            };
          });
        }
        setProducts(productsData); // Add this state (define below)
      },
      (error) => console.error("Products error:", error)
    );
  }, []);

  // Add function to update status
  const updateStatus = (orderId: string, newStatus: string) => {
    setIsLoading((prev) => ({ ...prev, [orderId]: true }));
    const orderRef = ref(database, `orders/${orderId}`);
    set(orderRef, {
      ...orders.find((o) => o.id === orderId),
      status: newStatus,
    })
      .then(() => setStatuses((prev) => ({ ...prev, [orderId]: newStatus })))
      .catch((error: Error) => console.error("Status update error:", error))
      .finally(() => setIsLoading((prev) => ({ ...prev, [orderId]: false })));
  };

  const filteredOrders = orders.filter((order) => {
    const seller = sellers[order.sellerId] || { sellerName: "", phone: "" };
    const buyer = buyers[order.buyerId] || { name: "", phone: "" };
    return (
      seller.sellerName.toLowerCase().includes(searchSeller.toLowerCase()) &&
      buyer.name.toLowerCase().includes(searchBuyer.toLowerCase()) &&
      order.status.toLowerCase().includes(searchStatus.toLowerCase())
    );
  });

  // Map seller and buyer details
  const ordersWithDetails = filteredOrders.map((order) => {
    const product = products[order.productId] || { name: "Unknown" };
    return {
      ...order,
      sellerName: sellers[order.sellerId]?.sellerName || "Unknown",
      sellerPhone: sellers[order.sellerId]?.phone || "Unknown",
      buyerName: buyers[order.buyerId]?.name || "Unknown",
      buyerPhone: buyers[order.buyerId]?.phone || "Unknown",
      product: product.name, // Use product name from productsData
      deliveryAddress: order.deliveryInfo || "Unknown",
      orderDate: order.createdAt || "N/A",
    };
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidenav />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Header */}
        <Header name="Orders" />

        {/* Search Bars */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by seller name..."
            value={searchSeller}
            onChange={(e) => setSearchSeller(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by buyer name..."
            value={searchBuyer}
            onChange={(e) => setSearchBuyer(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Search by status..."
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            className="w-full md:w-1/3 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3">Order ID</th>
                <th className="p-3">Seller Name</th>
                <th className="p-3">Seller Phone</th>
                <th className="p-3">Buyer Name</th>
                <th className="p-3">Buyer Phone</th>
                <th className="p-3">Product</th>
                <th className="p-3">Delivery Address</th>
                <th className="p-3">Order Date</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersWithDetails.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{order.id}</td>
                  <td className="p-3">{order.sellerName}</td>
                  <td className="p-3">{order.sellerPhone}</td>
                  <td className="p-3">{order.buyerName}</td>
                  <td className="p-3">{order.buyerPhone}</td>
                  <td className="p-3">{order.product}</td>
                  <td className="p-3">{order.deliveryAddress}</td>
                  <td className="p-3">{order.orderDate}</td>
                  <td className="p-3">
                    {isLoading[order.id] ? (
                      <div className="flex justify-center items-center">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <select
                        value={statuses[order.id] || "Unknown"}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="w-full p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ordersWithDetails.length === 0 && (
            <p className="text-center text-gray-500 p-4">No orders found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
