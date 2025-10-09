import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, CreditCard as Edit, Trash2, UserX, UserCheck } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import UserModal from '../components/modals/UserModal';
import { storageUtils } from '../utils/storage';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function UsersPage() {
	const { restaurant } = useSelector((state) => state.auth);
	const [users, setUsers] = useState([]);
	const [branches, setBranches] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [filterBranch, setFilterBranch] = useState('');
	const [filterRole, setFilterRole] = useState('');

	useEffect(() => {
		if (restaurant) {
			loadData();
		}
	}, [restaurant]);

	useEffect(() => {
		if (!restaurant) return;

		const channel = supabase
			.channel('users-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'users',
					filter: `restaurant_id=eq.${restaurant.id}`,
				},
				(payload) => {
					if (payload.eventType === 'INSERT') {
						setUsers((prev) => [payload.new, ...prev]);
					} else if (payload.eventType === 'UPDATE') {
						setUsers((prev) => prev.map((u) => (u.id === payload.new.id ? payload.new : u)));
					} else if (payload.eventType === 'DELETE') {
						setUsers((prev) => prev.filter((u) => u.id !== payload.old.id));
					}
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [restaurant]);

	const loadData = async () => {
		const [usersData, branchesData] = await Promise.all([storageUtils.getUsers(restaurant.id), storageUtils.getBranches(restaurant.id)]);
		setUsers(usersData);
		setBranches(branchesData);
	};

	const handleAddUser = (newUser) => {
		setUsers([newUser, ...users]);
	};

	const handleUpdateUser = (updatedUser) => {
		setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
	};

	const handleEditUser = (user) => {
		setSelectedUser(user);
		setShowModal(true);
	};

	const handleToggleActive = async (user) => {
		const result = await storageUtils.updateUser(user.id, {
			is_active: !user.is_active,
		});

		if (result.success) {
			setUsers(users.map((u) => (u.id === user.id ? result.data : u)));
			toast.success(user.is_active ? 'İstifadəçi deaktiv edildi' : 'İstifadəçi aktiv edildi');
		} else {
			toast.error(result.error || 'Xəta baş verdi');
		}
	};

	const handleDeleteUser = async (userId) => {
		if (window.confirm('İstifadəçini silmək istədiyinizdən əminsiniz?')) {
			const result = await storageUtils.deleteUser(userId);
			if (result.success) {
				setUsers(users.filter((u) => u.id !== userId));
				toast.success('İstifadəçi silindi');
			} else {
				toast.error(result.error || 'Xəta baş verdi');
			}
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setSelectedUser(null);
	};

	const getRoleText = (role) => {
		const roles = {
			cashier: 'Kassir',
			waiter: 'Ofisiant',
			kitchen: 'Mətbəx',
			manager: 'Menecer',
		};
		return roles[role] || role;
	};

	const getRoleColor = (role) => {
		const colors = {
			cashier: 'bg-blue-100 text-blue-800',
			waiter: 'bg-green-100 text-green-800',
			kitchen: 'bg-yellow-100 text-yellow-800',
			manager: 'bg-purple-100 text-purple-800',
		};
		return colors[role] || 'bg-gray-100 text-gray-800';
	};

	const filteredUsers = users.filter((user) => {
		const matchesBranch = !filterBranch || user.branch_id === filterBranch;
		const matchesRole = !filterRole || user.role === filterRole;
		return matchesBranch && matchesRole;
	});

	const activeUsers = users.filter((u) => u.is_active).length;

	return (
		<div className='min-h-screen bg-gray-50 flex'>
			<Sidebar />

			<div className='flex-1 ml-64'>
				<Header
					title='İstifadəçilər'
					stats={[
						{ label: 'Ümumi', value: users.length },
						{ label: 'Aktiv', value: activeUsers },
					]}
				/>

				<div className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<h2 className='text-2xl font-bold text-gray-900'>İstifadəçi İdarəetməsi</h2>
							<div className='flex items-center space-x-2'>
								<select
									value={filterRole}
									onChange={(e) => setFilterRole(e.target.value)}
									className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
								>
									<option value=''>Bütün rollar</option>
									<option value='cashier'>Kassir</option>
									<option value='waiter'>Ofisiant</option>
									<option value='kitchen'>Mətbəx</option>
									<option value='manager'>Menecer</option>
								</select>

								{branches.length > 0 && (
									<select
										value={filterBranch}
										onChange={(e) => setFilterBranch(e.target.value)}
										className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
									>
										<option value=''>Bütün filiallar</option>
										{branches.map((branch) => (
											<option key={branch.id} value={branch.id}>
												{branch.name}
											</option>
										))}
									</select>
								)}
							</div>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className='flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
						>
							<Plus className='w-5 h-5 mr-2' />
							Yeni İstifadəçi
						</button>
					</div>

					<div className='bg-white rounded-lg shadow-md overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='min-w-full'>
								<thead className='bg-gray-50'>
									<tr>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>İstifadəçi</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Username</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Rol</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Filial</th>
										<th className='px-6 py-3 text-left text-sm font-medium text-gray-600'>Status</th>
										<th className='px-6 py-3 text-right text-sm font-medium text-gray-600'>Əməliyyatlar</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200'>
									{filteredUsers.map((user) => (
										<tr key={user.id} className='hover:bg-gray-50'>
											<td className='px-6 py-4 text-sm font-medium text-gray-900'>{user.full_name}</td>
											<td className='px-6 py-4 text-sm text-gray-600 font-mono'>{user.username}</td>
											<td className='px-6 py-4 text-sm'>
												<span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
													{getRoleText(user.role)}
												</span>
											</td>
											<td className='px-6 py-4 text-sm text-gray-900'>{user.branches?.name || '-'}</td>
											<td className='px-6 py-4 text-sm'>
												<span
													className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
														user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
													}`}
												>
													{user.is_active ? 'Aktiv' : 'Deaktiv'}
												</span>
											</td>
											<td className='px-6 py-4 text-sm text-right'>
												<div className='flex items-center justify-end space-x-2'>
													<button
														onClick={() => handleToggleActive(user)}
														className={`p-2 rounded-lg transition ${
															user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
														}`}
														title={user.is_active ? 'Deaktiv et' : 'Aktiv et'}
													>
														{user.is_active ? <UserX className='w-4 h-4' /> : <UserCheck className='w-4 h-4' />}
													</button>
													<button onClick={() => handleEditUser(user)} className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition'>
														<Edit className='w-4 h-4' />
													</button>
													<button onClick={() => handleDeleteUser(user.id)} className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition'>
														<Trash2 className='w-4 h-4' />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							{filteredUsers.length === 0 && (
								<div className='text-center py-12'>
									<p className='text-gray-500 mb-4'>
										{filterRole || filterBranch ? 'Filtrə uyğun istifadəçi tapılmadı' : 'Hələ istifadəçi əlavə edilməyib'}
									</p>
									{!filterRole && !filterBranch && (
										<button
											onClick={() => setShowModal(true)}
											className='px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition'
										>
											İlk İstifadəçini Əlavə Et
										</button>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			<UserModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSuccess={selectedUser ? handleUpdateUser : handleAddUser}
				restaurantId={restaurant?.id}
				branches={branches}
				user={selectedUser}
			/>
		</div>
	);
}
