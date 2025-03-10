"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MenuDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuData, setMenuData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [error, setError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [note, setNote] = useState("");
  const [tableId, setTableId] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Get tableId and orderId from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setTableId(urlParams.get("tableId"));
      setOrderId(urlParams.get("orderId"));
    }
  }, []);

  // Load menu data based on URL
  useEffect(() => {
    const menuId = pathname.split("/")[3]; // Extract the menu_id from the URL

    console.log("Menu ID:", menuId);
    axios
      .get(`https://api.pasitlab.com/menus/${menuId}`)
      .then((response) => {
        const data = response.data;
        console.log(response.data);
        setMenuData(data);
        setTotalAmount(data.price);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลเมนู");
      });
  }, [pathname]);

  // Recalculate total when selected options change
  useEffect(() => {
    if (menuData && selectedOptions) {
      calculateTotal();
    }
  }, [selectedOptions]);

  // Calculate total amount based on selected options
  const calculateTotal = () => {
    console.log("Calculate Total.");
    let total = parseFloat(menuData.price);

    Object.values(selectedOptions).forEach((option) => {
      if (option !== null) {
        if (Array.isArray(option)) {
          option.forEach((o) => {
            total += parseFloat(o.additional_price);
          });
        } else {
          total += parseFloat(option.additional_price);
        }
      }
    });
    setTotalAmount(total);
  };

  // Handle option selection
  const handleOptionSelect = (
    groupName,
    optionName,
    additionalPrice,
    isRequired,
    groupId,
    optionId,
    isMultiple,
    optionStatus
  ) => {
    if (optionStatus === "disabled" || optionStatus === "Unavailable") {
      return; // Ignore disabled options
    }

    setSelectedOptions((prev) => {
      let currentSelection = prev[groupName] || (isMultiple ? [] : null);
      let newSelection;

      if (isMultiple) {
        if (!Array.isArray(currentSelection)) {
          currentSelection = [];
        }

        if (currentSelection.some((o) => o.option_name === optionName)) {
          newSelection = currentSelection.filter(
            (o) => o.option_name !== optionName
          );
        } else {
          newSelection = [
            ...currentSelection,
            {
              option_name: optionName,
              additional_price: additionalPrice,
              group_id: groupId,
              option_id: optionId,
            },
          ];
        }
      } else {
        newSelection = {
          option_name: optionName,
          additional_price: additionalPrice,
          group_id: groupId,
          option_id: optionId,
        };
      }

      console.log("Updated selection for", groupName, ":", newSelection);

      return {
        ...prev,
        [groupName]: newSelection,
      };
    });
  };

  // Handle form submission (add to cart)
  const handleSubmit = () => {
    // Check if all required options are selected
    const missingRequiredGroups = menuData.groups
      .filter(
        (group) => group.is_required && !selectedOptions[group.group_name]
      )
      .map((group) => group.group_name);
  
    const missingMultipleGroups = menuData.groups
      .filter(
        (group) =>
          group.is_multiple &&
          (!selectedOptions[group.group_name] ||
            selectedOptions[group.group_name]?.length === 0)
      )
      .map((group) => group.group_name);
  
    if (missingRequiredGroups.length > 0) {
      setError(`โปรดเลือกตัวเลือกสำหรับ: ${missingRequiredGroups.join(", ")}`);
      return;
    }
  
    if (missingMultipleGroups.length > 0) {
      setError(
        `โปรดเลือกอย่างน้อย 1 ตัวเลือกสำหรับ: ${missingMultipleGroups.join(
          ", "
        )}`
      );
      return;
    }
  
    setError(""); // Clear error if everything is selected
  
    // Calculate total price (base price + additional options)
    let addOnPrice = 0;
  
    // Ensure selectedOptions is an object, and then iterate through its values
    Object.values(selectedOptions).forEach((opt) => {
      addOnPrice += parseFloat(opt.additional_price || 0);
    });
    
    // const totalAmount = (menuData.price + addOnPrice); // Initially 1 item
    const orderItem = {
      menu_id: menuData.menu_id,
      menu_name: menuData.menu_name,
      base_price: menuData.price,
      quantity: 1,
      selected_options: Object.entries(selectedOptions)
        .filter(([_, option]) => option !== null)
        .flatMap(([group, option]) =>
          Array.isArray(option)
            ? option.map((o) => ({
                group_name: group,
                option_name: o.option_name,
                additional_price: o.additional_price,
                group_id: o.group_id,
                option_id: o.option_id,
              }))
            : [
                {
                  group_name: group,
                  option_name: option.option_name,
                  additional_price: option.additional_price,
                  group_id: option.group_id,
                  option_id: option.option_id,
                },
              ]
        ),
      total_price: totalAmount,
      note: note, // Additional note
      image: menuData.image,
    };
  
    console.log("? Data saved to LocalStorage:", orderItem);
  
    // Retrieve existing cart data from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
  
    // Check if this menu item already exists in the cart (compare menu_id and selected_options)
    const existingItemIndex = existingCart.findIndex(
      (item) =>
        item.menu_id === orderItem.menu_id &&
        JSON.stringify(item.selected_options) === JSON.stringify(orderItem.selected_options)
    );
  
    if (existingItemIndex !== -1) {
      // If item exists, update its quantity and total price
      existingCart[existingItemIndex].quantity += 1;
      existingCart[existingItemIndex].total_price =
        existingCart[existingItemIndex].quantity *
        (menuData.price + addOnPrice);
    } else {
      // If item doesn't exist, add it as a new item
      existingCart.push(orderItem);
    }
  
    // Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart));
  
    alert("เพิ่มลงตะกร้าเรียบร้อยแล้ว!");
  
    // Navigate back to order page with tableId and orderId params
    if (tableId && orderId) {
      router.push(`/order?tableId=${tableId}&orderId=${orderId}`);
    } else {
      router.back();
    }
  };
  
  


  if (!menuData) {
    return (
      <div className="bg-base-100 min-h-screen p-4 flex items-center justify-center pb-16">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4 text-black">
      <div className="max-w-md mx-auto bg-white rounded-box p-4 mb-16">
        {/* Header with navigation */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => {
              if (tableId && orderId) {
                router.push(`/order?tableId=${tableId}&orderId=${orderId}`);
              } else {
                router.back();
              }
            }} 
            className="btn btn-ghost btn-circle"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center text-lg font-medium">{menuData.menu_name}</div>
          <div className="btn btn-ghost btn-circle invisible">
            {/* Invisible button to balance layout */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {/* Option groups */}
        {menuData.groups.map((group) => (
          <div key={group.menu_group_id} className="mb-6">
            <div className="flex justify-between mb-2">
              <h2 className="text-lg font-medium">{group.group_name}</h2>
              <span className="badge badge-success badge-outline">
                {group.is_multiple ? "เลือกอย่างน้อย 1" : "เลือก 1"}
                {group.is_required && "*"}
              </span>
            </div>
            <div className="space-y-2">
              {group.options.map((option) => {
                const isSelected = group.is_multiple
                  ? Array.isArray(selectedOptions[group.group_name]) &&
                    selectedOptions[group.group_name].some(
                      (o) => o.option_name === option.option_name
                    )
                  : selectedOptions[group.group_name]?.option_name ===
                    option.option_name;
                
                const isDisabled = option.option_status === "Unavailable";

                return (
                  <div 
                    key={option.menu_option_id} 
                    className={`flex items-center justify-between border rounded-lg p-3 ${isDisabled ? 'opacity-50' : ''}`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      {group.is_multiple ? (
                        <input
                          type="checkbox"
                          className="checkbox"
                          disabled={isDisabled}
                          checked={isSelected}
                          onChange={() =>
                            handleOptionSelect(
                              group.group_name,
                              option.option_name,
                              option.additional_price,
                              group.is_required,
                              group.menu_group_id,
                              option.menu_option_id,
                              group.is_multiple,
                              option.option_status
                            )
                          }
                        />
                      ) : (
                        <input
                          type="radio"
                          name={`group-${group.menu_group_id}`}
                          className="radio"
                          disabled={isDisabled}
                          checked={isSelected}
                          onChange={() =>
                            handleOptionSelect(
                              group.group_name,
                              option.option_name,
                              option.additional_price,
                              group.is_required,
                              group.menu_group_id,
                              option.menu_option_id,
                              group.is_multiple,
                              option.option_status
                            )
                          }
                        />
                      )}
                      <span>
                        {option.option_name}
                      </span>
                      {isDisabled && (
                        <span className="text-sm text-gray-400">ไม่พร้อมให้บริการ</span>
                      )}
                    </label>
                    {option.additional_price > 0 && (
                      <span className="text-right">+{option.additional_price}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Show error if required options are not selected */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {/* Additional note input */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-medium">หมายเหตุเพิ่มเติม</h2>
            <span className="badge badge-outline">ไม่บังคับ</span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="textarea textarea-bordered w-full h-24"
            placeholder="กรอกหมายเหตุที่นี่ เช่น ไม่ใส่หอม ไม่ใส่ผักชี"
          ></textarea>
        </div>

        {/* Submit button with total price */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">ราคาเริ่มต้น {menuData.price} บาท</span>
          </div>
          <button 
            onClick={handleSubmit} 
            className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 border-none"
          >
            เพิ่มไปยังตะกร้า - {totalAmount.toFixed(2)} บาท
          </button>
        </div>
      </div>
      
    </div>
  );
}