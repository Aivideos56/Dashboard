import { supabase } from '../lib/supabase';

const STORAGE_KEYS = {
	ADMIN_USER: 'admin_user',
	RESTAURANT_ID: 'restaurant_id',
	BRANCH_ID: 'branch_id',
	TOKEN: 'auth_token',
};

export const setUser = (userData, type = 'restaurant') => {
  console.log(userData)
	try {
		if (type === 'admin') {
			localStorage.setItem('admin_user', JSON.stringify(userData));
		}

		if (type === 'restaurant') {
			localStorage.setItem('restaurant_id', userData.id) ;
			localStorage.setItem('branch_id', userData.branch_id);
		}
    
	} catch (error) {
		console.error('setUser error:', error);
	}
};

export const getUser = () => {
	try {
		const userData = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
		return userData ? JSON.parse(userData) : null;
	} catch (error) {
		console.error('getUser error:', error);
		return null;
	}
};

export const getRestaurantId = () => localStorage.getItem(STORAGE_KEYS.RESTAURANT_ID);
export const getBranchId = () => localStorage.getItem(STORAGE_KEYS.BRANCH_ID);

export const isAuthenticated = () => {
	const user = getUser();
	return user !== null && user?.id;
};

export const isAdmin = () => {
	const user = getUser();
	return user?.role === 'admin';
};

export const logout = () => {
	try {
		localStorage.clear();
	} catch (error) {
		console.error('logout error:', error);
	}
};

export const setCacheData = (key, data) => {
	try {
		localStorage.setItem(`cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
	} catch (error) {
		console.error('setCacheData error:', error);
	}
};

export const getCacheData = (key, maxAge = 300000) => {
	try {
		const cached = localStorage.getItem(`cache_${key}`);
		if (!cached) return null;

		const { data, timestamp } = JSON.parse(cached);
		if (Date.now() - timestamp > maxAge) {
			localStorage.removeItem(`cache_${key}`);
			return null;
		}
		return data;
	} catch (error) {
		console.error('getCacheData error:', error);
		return null;
	}
};

export const clearCache = () => {
	try {
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith('cache_')) localStorage.removeItem(key);
		});
	} catch (error) {
		console.error('clearCache error:', error);
	}
};

// ——— Supabase login funksiyaları ———
export const checkAdmin = async (username, password) => {
	try {
		const { data, error } = await supabase.from('admin_users').select('*').eq('username', username).eq('password', password).maybeSingle();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('checkAdmin error:', error);
		return null;
	}
};

export const findRestaurant = async (username, password) => {
	try {
		const { data, error } = await supabase
			.from('restaurants')
			.select('*')
			.eq('username', username)
			.eq('password', password)
			.eq('is_active', true)
			.maybeSingle();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('findRestaurant error:', error);
		return null;
	}
};

export const getAllRestaurants = async () => {
	try {
		const { data, error } = await supabase.from('restaurants').select('*');

		if (error) {
			console.error('getAllRestaurants error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getAllRestaurants error:', error);
		return [];
	}
};

export const addRestaurant = async (restaurantData) => {
	try {
		const { data, error } = await supabase.from('restaurants').insert([restaurantData]).select().single();

		if (error) {
			console.error('addRestaurant error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addRestaurant catch error:', error);
		return { success: false, error: error.message };
	}
};

export const getRestaurantStats = async (restaurantId, period = 'today') => {
	try {
		const { data: orders, error } = await supabase.from('completed_orders').select('total, completed_at').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getRestaurantStats error:', error);
			return { totalRevenue: 0, orderCount: 0 };
		}

		let filteredOrders = orders || [];
		const now = new Date();

		if (period === 'today') {
			filteredOrders = filteredOrders.filter((o) => new Date(o.completed_at).toDateString() === now.toDateString());
		} else if (period === 'month') {
			filteredOrders = filteredOrders.filter(
				(o) => new Date(o.completed_at).getMonth() === now.getMonth() && new Date(o.completed_at).getFullYear() === now.getFullYear()
			);
		} else if (period === 'year') {
			filteredOrders = filteredOrders.filter((o) => new Date(o.completed_at).getFullYear() === now.getFullYear());
		}

		const totalRevenue = filteredOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

		return {
			totalRevenue,
			orderCount: filteredOrders.length,
		};
	} catch (err) {
		console.error('getRestaurantStats error:', err);
		return { totalRevenue: 0, orderCount: 0 };
	}
};

export const getUsers = async (restaurantId) => {
	try {
		const { data, error } = await supabase
			.from('users')
			.select(
				`
        id,
        username,
        full_name,
        role,
        is_active,
        branch_id,
        branches(name)
      `
			)
			.eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getUsers error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getUsers error:', error);
		return [];
	}
};

export const getTables = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('tables').select('*').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getTables error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getTables error:', error);
		return [];
	}
};

export const getBranches = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('branches').select('*').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getBranches error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getBranches error:', error);
		return [];
	}
};

export const getOrders = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('completed_orders').select('*').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getOrders error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getOrders error:', error);
		return [];
	}
};

export const getCategories = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('categories').select('*').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getCategories error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getCategories error:', error);
		return [];
	}
};

export const addUser = async (userData) => {
	try {
		const { data, error } = await supabase.from('users').insert([userData]).select().single(); // single() → insert uğurlu olarsa bir object qaytarır

		if (error) {
			console.error('addUser error:', error);
			return { success: false, error: error.message };
		}

		if (!data) {
			return { success: false, error: 'User data is null' };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addUser catch error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteUser = async (userId) => {
	try {
		const { data, error } = await supabase.from('users').delete().eq('id', userId);

		if (error) {
			console.error('deleteUser error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('deleteUser catch error:', error);
		return { success: false, error: error.message };
	}
};

export const addBranch = async (branchData) => {
	try {
		// Insert və select ilə yeni əlavə edilmiş row-u qaytar
		const { data, error } = await supabase.from('branches').insert([branchData]).select().single();

		if (error) {
			console.error('addBranch error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data }; // data -> əlavə edilmiş filial
	} catch (error) {
		console.error('addBranch catch error:', error);
		return { success: false, error: error.message };
	}
};

export const addTable = async (tableData) => {
	try {
		const { data, error } = await supabase.from('tables').insert([tableData]).select().single();

		if (error) {
			console.error('addTable error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addTable error:', error);
		return { success: false, error: error.message };
	}
};

export const updateTable = async (tableId, tableData) => {
	try {
		const { data, error } = await supabase.from('tables').update(tableData).eq('id', tableId).select().single();

		if (error) {
			console.error('updateTable error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('updateTable error:', error);
		return { success: false, error: error.message };
	}
};

export const getProducts = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('products').select('*').eq('restaurant_id', restaurantId);

		if (error) {
			console.error('getProducts error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getProducts error:', error);
		return [];
	}
};

export const deleteTable = async (tableId) => {
	try {
		const { data, error } = await supabase.from('tables').delete().eq('id', tableId).select().single();

		if (error) {
			console.error('deleteTable error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('deleteTable error:', error);
		return { success: false, error: error.message };
	}
};

export const updateUser = async (userId, userData) => {
	try {
		const { data, error } = await supabase.from('users').update(userData).eq('id', userId).select().single();

		if (error) {
			console.error('updateUser error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('updateUser catch error:', error);
		return { success: false, error: error.message };
	}
};

export const updateBranch = async (branchId, branchData) => {
	try {
		const { data, error } = await supabase.from('branches').update(branchData).eq('id', branchId).select().single();

		if (error) {
			console.error('updateBranch error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('updateBranch catch error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteBranch = async (branchId) => {
	try {
		const { data, error } = await supabase.from('branches').delete().eq('id', branchId).select();

		if (error) {
			console.error('deleteBranch error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('deleteBranch catch error:', error);
		return { success: false, error: error.message };
	}
};

export const addCategory = async (categoryData) => {
	try {
		// Yeni kateqoriyanı əlavə et və əlavə edilmiş row-u qaytar
		const { data, error } = await supabase.from('categories').insert([categoryData]).select().single();

		if (error) {
			console.error('addCategory error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addCategory catch error:', error);
		return { success: false, error: error.message };
	}
};

export const addSubCategory = async (subCategoryData) => {
	try {
		const { data, error } = await supabase.from('sub_categories').insert([subCategoryData]).select().single();

		if (error) {
			console.error('addSubCategory error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addSubCategory catch error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteCategory = async (id) => {
	try {
		const { data, error } = await supabase.from('categories').delete().eq('id', id).select().maybeSingle(); // .maybeSingle() ilə 0 sıra problemi həll olunur

		if (error) {
			console.error('deleteCategory error:', error);
			return { success: false, error: error.message };
		}

		if (!data) {
			return { success: false, error: 'Category tapılmadı və ya artıq silinib' };
		}

		return { success: true, data };
	} catch (error) {
		console.error('deleteCategory error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteSubCategory = async (id) => {
	try {
		const { data, error } = await supabase.from('sub_categories').delete().eq('id', id).select().maybeSingle(); // <- burada .maybeSingle() istifadə et

		if (error) {
			console.error('deleteSubCategory error:', error);
			return { success: false, error: error.message };
		}

		if (!data) {
			return { success: false, error: 'Sub-category tapılmadı və ya artıq silinib' };
		}

		return { success: true, data };
	} catch (error) {
		console.error('deleteSubCategory error:', error);
		return { success: false, error: error.message };
	}
};

export const getSubCategories = async (categoryId) => {
	try {
		const { data, error } = await supabase.from('sub_categories').select('*').eq('category_id', categoryId);

		if (error) {
			console.error('getSubCategories error:', error);
			return [];
		}

		return data;
	} catch (error) {
		console.error('getSubCategories error:', error);
		return [];
	}
};

export const addProduct = async (productData) => {
	try {
		const { data, error } = await supabase.from('products').insert([productData]).select().maybeSingle(); // 0 row problemi üçün maybeSingle()

		if (error) {
			console.error('addProduct error:', error);
			return { success: false, error: error.message };
		}

		return { success: true, data };
	} catch (error) {
		console.error('addProduct error:', error);
		return { success: false, error: error.message };
	}
};

export const updateProduct = async (productId, productData) => {
	try {
		const { data, error } = await supabase.from('products').update(productData).eq('id', productId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('updateProduct error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteProduct = async (productId) => {
	try {
		const { error } = await supabase.from('products').delete().eq('id', productId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('deleteProduct error:', error);
		return { success: false, error: error.message };
	}
};

export const updateCategory = async (categoryId, categoryData) => {
	try {
		const { data, error } = await supabase.from('categories').update(categoryData).eq('id', categoryId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('updateCategory error:', error);
		return { success: false, error: error.message };
	}
};

export const updateSubCategory = async (subCategoryId, subCategoryData) => {
	try {
		const { data, error } = await supabase.from('sub_categories').update(subCategoryData).eq('id', subCategoryId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('updateSubCategory error:', error);
		return { success: false, error: error.message };
	}
};

export const updateRestaurant = async (restaurantId, restaurantData) => {
	try {
		const { data, error } = await supabase.from('restaurants').update(restaurantData).eq('id', restaurantId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('updateRestaurant error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteRestaurant = async (restaurantId) => {
	try {
		const { error } = await supabase.from('restaurants').delete().eq('id', restaurantId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('deleteRestaurant error:', error);
		return { success: false, error: error.message };
	}
};

export const addOrder = async (orderData) => {
	try {
		const { data, error } = await supabase.from('orders').insert([orderData]).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('addOrder error:', error);
		return { success: false, error: error.message };
	}
};

export const findUser = async (username, password) => {
	try {
		const { data, error } = await supabase
			.from('users')
			.select('*, restaurants(name, currency), branches(name)')
			.eq('username', username)
			.eq('password', password)
			.eq('is_active', true)
			.maybeSingle();

		if (error) throw error;
		return data;
	} catch (error) {
		console.error('findUser error:', error);
		return null;
	}
};

// Department operations
export const getDepartments = async (restaurantId) => {
	try {
		const { data, error } = await supabase
			.from('departments')
			.select('*')
			.eq('restaurant_id', restaurantId)
			.order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error('Get departments error:', error);
		return [];
	}
};

export const addDepartment = async (departmentData) => {
	try {
		const { data, error } = await supabase.from('departments').insert([departmentData]).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Add department error:', error);
		return { success: false, error: error.message };
	}
};

export const updateDepartment = async (departmentId, departmentData) => {
	try {
		const { data, error } = await supabase.from('departments').update(departmentData).eq('id', departmentId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Update department error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteDepartment = async (departmentId) => {
	try {
		const { error } = await supabase.from('departments').delete().eq('id', departmentId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Delete department error:', error);
		return { success: false, error: error.message };
	}
};

export const storageUtils = {
	setUser,
	getUser,
	getRestaurantId,
	getBranchId,
	isAuthenticated,
	isAdmin,
	logout,
	setCacheData,
	getCacheData,
	clearCache,
	checkAdmin,
	findRestaurant,
	getAllRestaurants,
	addRestaurant,
	updateRestaurant,
	deleteRestaurant,
	getRestaurantStats,
	getUsers,
	addUser,
	updateUser,
	deleteUser,
	getBranches,
	addBranch,
	updateBranch,
	deleteBranch,
	getTables,
	addTable,
	updateTable,
	deleteTable,
	getCategories,
	addCategory,
	updateCategory,
	deleteCategory,
	getSubCategories,
	addSubCategory,
	updateSubCategory,
	deleteSubCategory,
	getProducts,
	addProduct,
	updateProduct,
	deleteProduct,
	getOrders,
	addOrder,
	findUser,
};
