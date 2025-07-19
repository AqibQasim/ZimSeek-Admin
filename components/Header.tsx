import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Header = (props: { name?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" }); // Call logout API
    router.push("/login"); // Redirect to login page
  };

  return (
    <header className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
      <h1 className="text-3xl font-bold">{props.name}</h1>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
        >
          Admin
        </button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
            <button
              onClick={handleLogout}
              className="w-full text-left p-2 hover:bg-gray-200 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
