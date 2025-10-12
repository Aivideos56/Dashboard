import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User, Building2 } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Header({ title, stats = [] }) {
	const [showDropdown, setShowDropdown] = useState(false);
	const dropdownRef = useRef(null);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const { user, isAdmin } = useSelector((state) => state.auth);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleLogout = () => {
		dispatch(logout());
		toast.success('Çıxış edildi');
		navigate('/login');
	};

	return (
		<header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10'>
			<div className='px-6 py-4'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center space-x-4'>
						<div className='flex items-center space-x-3'>
							<Building2 className='w-8 h-8 text-blue-600' />
							<div>
								<h1 className='text-2xl font-bold text-gray-900'>{title}Z</h1>
								{isAdmin && <p className='text-sm text-gray-500'>Sistem İdarəçisi</p>}
							</div>
						</div>
					</div>

					<div className='flex items-center space-x-6'>
						{stats.map((stat, index) => (
							<div key={index} className='text-right'>
								<p className='text-sm text-gray-600'>{stat.label}</p>
								<p className='text-lg font-semibold text-gray-900'>{stat.value}</p>
							</div>
						))}

						<div className='relative' ref={dropdownRef}>
							<button
								onClick={() => setShowDropdown(!showDropdown)}
								className='flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition'
							>
								<div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
									<User className='w-5 h-5 text-white' />
								</div>
								<div className='text-left'>
									<p className='text-sm font-medium text-gray-900'>{user?.name || user?.username}</p>
									<p className='text-xs text-gray-500'>{isAdmin ? 'Admin' : 'Restoran'}</p>
								</div>
							</button>

							{showDropdown && (
								<div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1'>
									<button
										onClick={handleLogout}
										className='w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition'
									>
										<LogOut className='w-4 h-4 mr-2' />
										Çıxış
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
