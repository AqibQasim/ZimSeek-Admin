import React from "react";
import Link from "next/link";

export default function Sidenav() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 fixed h-full">
      <h2 className="text-2xl font-bold mb-6">ZimSeek </h2>
      <nav>
        <ul>
          <li className="mb-4">
            {/* <a href="#" className="hover:text-gray-300">
              Dashboard
            </a> */}
            <Link href="/">Dashboard</Link>
          </li>
          <li className="mb-4">
            {/* <a href="/sellers" className="hover:text-gray-300">
              Sellers
            </a> */}
            <Link href="/sellers">Sellers</Link>
          </li>
          <li className="mb-4">
            {/* <a href="/buyers" className="hover:text-gray-300">
              Buyers
            </a> */}
            <Link href="/buyers">Buyers</Link>
          </li>
          <li className="mb-4">
            {/* <a href="/products" className="hover:text-gray-300">
              Products
            </a> */}
            <Link href="/products">Products</Link>
          </li>
          <li className="mb-4">
            {/* <a href="/orders" className="hover:text-gray-300">
              Orders
            </a> */}
            <Link href="/orders">Orders</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
