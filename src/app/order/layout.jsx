import BottomNav from "../components/BottomNavBar"

export default function OrderLayout({ children }) {
    return (
        <>
        {children}
            <BottomNav /> {/* แสดง Bottom Nav ทุกหน้า */}
        </>
    )
}