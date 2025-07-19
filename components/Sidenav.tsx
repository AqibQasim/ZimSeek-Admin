import React from "react";

export default function Sidenav() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 fixed h-full">
      <h2 className="text-2xl font-bold mb-6">ZimSeek </h2>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="hover:text-gray-300">
              Dashboard
            </a>
          </li>
          <li className="mb-4">
            <a href="/sellers" className="hover:text-gray-300">
              Sellers
            </a>
          </li>
          <li className="mb-4">
            <a href="/buyers" className="hover:text-gray-300">
              Buyers
            </a>
          </li>
          <li className="mb-4">
            <a href="/products" className="hover:text-gray-300">
              Products
            </a>
          </li>
          <li className="mb-4">
            <a href="/orders" className="hover:text-gray-300">
              Orders
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
