"use client";

export default function FAB({ onClick, text}) {
  return (
    <button
      className="fixed bottom-20 align-center right-0 left-0 mr-12 ml-12 bg-blue-600 rounded-lg text-white p-3 text-xl font-bold flex items-center justify-center"
      onClick={onClick}
    >
     { text }
    </button>
  );
}


  {/* <button 
        onClick={handleSubmit} 
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg text-xl font-semibold flex items-center justify-center"
      >
        <span className="mr-2">{totalAmount.toFixed(2)} ฿</span>
        เพิ่มลงตะกร้า
      </button> */}
