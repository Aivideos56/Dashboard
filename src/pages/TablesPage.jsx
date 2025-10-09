import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, CreditCard as Edit, Trash2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import TableModal from '../components/modals/TableModal';
import { setTables, addTable as addTableAction, updateTable as updateTableAction, removeTable } from '../store/slices/tableSlice';
import { storageUtils } from '../utils/storage';
import { getTableStatusText, getTableStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function TablesPage() {
	const dispatch = useDispatch();
	const { restaurant } = useSelector((state) => state.auth);
	const { tables } = useSelector((state) => state.table);
	const [showModal, setShowModal] = useState(false);
	const [selectedTable, setSelectedTable] = useState(null);

	useEffect(() => {
		if (restaurant) {
			loadTables();
		}
	}, [restaurant]);

	const loadTables = async () => {
		const data = await storageUtils.getTables(restaurant.id);
		dispatch(setTables(data));
	};

	const handleAddTable = (newTable) => {
		dispatch(addTableAction(newTable));
	};

	const handleUpdateTable = (updatedTable) => {
		dispatch(updateTableAction(updatedTable));
	};

	const handleEditTable = (table) => {
		setSelectedTable(table);
		setShowModal(true);
	};

	const handleDeleteTable = async (tableId) => {
		if (window.confirm('Masanı silmək istədiyinizdən əminsiniz?')) {
			const result = await storageUtils.deleteTable(tableId);
			if (result.success) {
				dispatch(removeTable(tableId));
				toast.success('Masa silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedTable(null);
	};

	const activeTables = tables.filter((t) => t.status === 'occupied').length;

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='Masalar'
					stats={[
						{ label: 'Ümumi Masalar', value: tables.length },
						{ label: 'Aktiv Masalar', value: activeTables },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<div>
							<h2 className='text-2xl font-bold text-gray-900 mb-2'>Masa İdarəetməsi</h2>
							<p className='text-gray-600'>Masaları idarə edin və redaktə edin</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
						>
							<Plus className='w-5 h-5 mr-2' />
							Yeni Masa
						</button>
					</div>

					<div className='bg-white rounded-lg shadow-md overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='min-w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Masa №</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Tutum</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Zona</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Status</th>
										<th className='px-6 py-3 text-right text-sm font-medium text-gray-600'>Əməliyyatlar</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{tables.map((table) => (
										<tr key={table.id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 text-sm font-medium text-gray-900'>Masa {table.number}</td>
											<td className='px-6 py-4 text-sm text-gray-900'>{table.capacity} nəfərlik</td>
											<td className='px-6 py-4 text-sm text-gray-900'>{table.zone}</td>
											<td className='px-6 py-4 text-sm'>
												<span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTableStatusColor(table.status)}`}>
													{getTableStatusText(table.status)}
												</span>
											</td>
											<td className='px-6 py-4 text-sm text-right'>
												<div className='flex items-center justify-end space-x-2'>
													<button onClick={() => handleEditTable(table)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'>
														<Edit className='w-4 h-4' />
													</button>
													<button onClick={() => handleDeleteTable(table.id)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition'>
														<Trash2 className='w-4 h-4' />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{tables.length === 0 && (
								<div className='text-center py-12'>
									<p className='text-gray-500 mb-4'>Hələ masa əlavə edilməyib</p>
									<button
										onClick={() => setShowModal(true)}
										className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
									>
										İlk Masanı Əlavə Et
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<TableModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSuccess={selectedTable ? handleUpdateTable : handleAddTable}
				restaurantId={restaurant?.id}
				table={selectedTable}
				existingTables={tables}
			/>
		</div>
	);
}
