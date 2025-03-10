'use client'

import { useState, useEffect } from "react";
import AddMenuModal from "./components/AddMenuModal";
import axios from "axios";
import { XCircle, CheckCircle } from "lucide-react";

export default function MenuManagement() {
  const [menus, setMenus] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await axios.get("https://api.pasitlab.com/menus");
        console.log("API Response:", response.data);
        setMenus(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching menus: ", error);
      }
    };
    fetchMenus();
  }, []);

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const addOrUpdateMenu = async (menu) => {
    if (!menu.menu_name) {
      alert("Menu name is required");
      return;
    }
    if (!menu.image) {
      alert("Image is required");
      return;
    }
    if (!menu.price) {
      menu.price = 0;
    }

    try {
      let response;
      if (editingMenu) {
        response = await axios.put(`https://api.pasitlab.com/menus/${editingMenu.menu_id}`, menu);
        setMenus(menus.map(m => (m.menu_id === editingMenu.menu_id ? response.data.data : m)));
        showSnackbar("Menu updated successfully!", "success");
      } else {
        response = await axios.post("https://api.pasitlab.com/menus", menu);
        setMenus([...menus, response.data.data]);
        showSnackbar("Menu added successfully!", "success");
      }
      setIsModalOpen(false);
      setEditingMenu(null);
    } catch (error) {
      console.error("Error saving menu: ", error);
      showSnackbar("Error saving menu", "error");
    }
  };

  const deleteMenu = async (menuId) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;
    try {
      const response = await axios.delete(`https://api.pasitlab.com/menus/${menuId}`);
      if (response.status === 200) {
        setMenus(menus.filter(menu => menu.menu_id !== menuId));
        showSnackbar("Menu deleted successfully!", "success");
      } else {
        showSnackbar("Failed to delete menu", "error");
      }
    } catch (error) {
      console.error("Error deleting menu: ", error);
      showSnackbar("Error deleting menu", "error");
    }
  };

  const filteredMenus = menus.filter(menu => 
    menu.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-black">Menu Management</h1>
        <input 
          type="text" 
          placeholder="Search menu..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="input text-black input-bordered w-full max-w-xs"
        />
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn bg-blue-600 hover:bg-blue-700 border-none text-white shadow-lg"
        >
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Menu
          </>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredMenus.map((menu) => (
          <div key={menu.menu_id} className="card bg-base-100 shadow-xl p-4">
            <img src={menu.image} alt={menu.menu_name} className="w-full h-40 object-cover rounded-lg mb-2" />
            <h2 className="text-lg text-black font-bold">{menu.menu_name}</h2>
            <p className="text-gray-600">${menu.price}</p>
            <span className={`badge ${menu.menu_status === "Available" ? "badge-success" : "badge-error"}`}>{menu.menu_status}</span>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-warning btn-sm" onClick={() => { setEditingMenu(menu); setIsModalOpen(true); }}>Edit</button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && <AddMenuModal onClose={() => { setIsModalOpen(false); setEditingMenu(null); }} onSave={addOrUpdateMenu} editingMenu={editingMenu} />}
      {snackbar.show && (
        <div className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 p-4 rounded-xl flex items-center gap-2 shadow-lg text-white ${snackbar.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
          {snackbar.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {snackbar.message}
        </div>
      )}
    </div>
  );
}