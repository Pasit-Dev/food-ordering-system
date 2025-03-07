'use client';
import TableItem from './TableItem';
import useTableStore from '../../../store/useTableStore'; // นำเข้า useTableStore

export default function TableGrid() {
  const { tables } = useTableStore(); // ใช้ tables จาก store

  if (tables.length === 0) {
    return <p>No tables available. Please add a new table.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {tables.map((table) => (
        <TableItem key={table.table_id} table={table} />
      ))}
    </div>
  );
}
