import { useState, useEffect } from "react";
import { X, Plus, Trash, Upload } from "lucide-react";

export default function AddMenuModal({ onClose, onSave, editingMenu }) {
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Available");
  const [image, setImage] = useState(null);
  const [sections, setSections] = useState([]);

  // Set initial values when editing a menu
  useEffect(() => {
    if (editingMenu) {
      setMenuName(editingMenu.menu_name || "");
      setPrice(editingMenu.price || "");
      setStatus(editingMenu.menu_status || "Available");
      setImage(editingMenu.image || null);
      setSections(
        editingMenu.groups?.map(group => ({
          group_name: group.group_name,
          is_required: group.is_required ?? true,
          is_multiple: group.is_multiple ?? false, // Add is_multiple property
          options: group.options.map(option => ({
            menu_option_id: option.menu_option_id,
            option_name: option.option_name,
            additional_price: option.additional_price,
            option_status: option.option_status // Include option_status
          }))
        })) || []
      );
    }
  }, [editingMenu]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 720; // ปรับขนาดสูงสุด
          let width = img.width;
          let height = img.height;
  
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
  
          // แปลงเป็น WebP เพื่อลดขนาด
          canvas.toBlob(
            (blob) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => {
                setImage(reader.result); // เก็บภาพที่ถูกบีบอัด
              };
            },
            "image/webp",
            0.7 // กำหนดคุณภาพของรูป (0.0 - 1.0)
          );
        };
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleSubmit = () => {
    const formattedData = {
      id: editingMenu?.id || null,
      menu_name: menuName,
      price: price.toString(),
      menu_status: status,
      image: image || "",
      groups: sections.map(section => ({
        group_name: section.group_name,
        is_required: section.is_required,
        is_multiple: section.is_multiple, // Include is_multiple in submission
        options: section.options.map(option => ({
          menu_option_id: option.menu_option_id,
          option_name: option.option_name,
          additional_price: option.additional_price.toString(),
          option_status: option.option_status // Include option_status in submission
        }))
      }))
    };

    onSave(formattedData);
  };

  return (
    <dialog className="modal modal-open text-black">
      <div className="modal-box w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-lg font-bold mb-2">{editingMenu ? "Edit Menu" : "Add New Menu"}</h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 flex-grow">
          {/* Left Section */}
          <div className="w-full md:w-1/2 space-y-2">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Menu Name"
                className="input input-bordered w-full"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                className="input input-bordered w-full"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <select
                className="select select-bordered w-full"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>
            <div className="mt-2 mb-2">
           <div className="relative w-full">
  <input
    type="file"
    accept="image/*"
    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
    onChange={handleImageUpload}
  />
  <button type="button" className="btn btn-outline flex items-center w-full py-6">
    <Upload size={16} /> Upload Image
  </button>
</div>


              <div className="mt-12 w-full flex justify-center">
                <img
                  src={image || "https://picsum.photos/200/300"}
                  alt="Preview"
                  className="w-48 h-48 md:w-64 md:h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Right Section (Menu Sections) */}
          <div className="w-full md:w-1/2 flex flex-col overflow-y-auto max-h-[60vh]">
            <h3 className="font-bold">Menu Sections</h3>
            <div>
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border p-2 mb-2 rounded">
                  <div className="flex justify-between items-center gap-2">
                    <input
                      type="text"
                      placeholder="Section Name"
                      className="input focus:outline-none w-full max-w-md"
                      value={section.group_name}
                      onChange={(e) => {
                        const newSections = [...sections];
                        newSections[sectionIndex].group_name = e.target.value;
                        setSections(newSections);
                      }}
                    />
                    <button
                      className="btn btn-error btn-sm bg-red-500 hover:bg-red-600 text-white "
                      onClick={() => {
                        setSections(sections.filter((_, i) => i !== sectionIndex));
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  {/* Toggle is_required */}
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm">Required</label>
                    <input
                      type="checkbox"
                      checked={section.is_required}
                      onChange={() => {
                        const newSections = [...sections];
                        newSections[sectionIndex].is_required = !section.is_required;
                        setSections(newSections);
                      }}
                      className="toggle"
                    />
                  </div>

                  {/* Toggle is_multiple */}
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm">Allow Multiple Options</label>
                    <input
                      type="checkbox"
                      checked={section.is_multiple}
                      onChange={() => {
                        const newSections = [...sections];
                        newSections[sectionIndex].is_multiple = !section.is_multiple;
                        setSections(newSections);
                      }}
                      className="toggle"
                    />
                  </div>

                  <div className="mt-2 max-h-32 overflow-y-auto">
                    {section.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 mb-1 items-center">
                        <input
                          type="text"
                          placeholder="Option Name"
                          className="input focus:outline-none w-full max-w-md"
                          value={option.option_name}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].options[optionIndex].option_name = e.target.value;
                            setSections(newSections);
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          className="input input-bordered w-20 max-w-md"
                          value={option.additional_price}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].options[optionIndex].additional_price = e.target.value;
                            setSections(newSections);
                          }}
                        />
                        <select
                          className="select select-bordered w-20 max-w-md"
                          value={option.option_status}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].options[optionIndex].option_status = e.target.value;
                            setSections(newSections);
                          }}
                        >
                          <option value="Available">Available</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                        <button
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white "
                          onClick={() => {
                            const newSections = [...sections];
                            newSections[sectionIndex].options = newSections[sectionIndex].options.filter(
                              (_, i) => i !== optionIndex
                            );
                            setSections(newSections);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="btn btn-sm btn-outline mt-1"
                    onClick={() => {
                      const newSections = [...sections];
                      newSections[sectionIndex].options.push({ option_name: "", additional_price: "", option_status: "Available" });
                      setSections(newSections);
                    }}
                  >
                    <Plus size={16} /> Add Option
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-2 btn btn-sm bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-lg"
              onClick={() => {
                setSections([...sections, { group_name: "", is_required: true, is_multiple: false, options: [] }]);
              }}
            >
              <Plus size={16} /> Add Section
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-action flex justify-end p-4 bg-white">
          <button className="btn bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg" onClick={onClose}>Cancel</button>
          <button className="btn bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg" onClick={handleSubmit}>Save</button>
        </div>
      </div>

      {/* Close button */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} >close</button>
      </form>
    </dialog>
  );
}
