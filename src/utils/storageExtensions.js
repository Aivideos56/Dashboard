import { supabase } from '../lib/supabase';

// Hall operations
export const getHalls = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('halls').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error('Get halls error:', error);
		return [];
	}
};

export const addHall = async (hallData) => {
	try {
		const { data, error } = await supabase.from('halls').insert([hallData]).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Add hall error:', error);
		return { success: false, error: error.message };
	}
};

export const updateHall = async (hallId, hallData) => {
	try {
		const { data, error } = await supabase.from('halls').update(hallData).eq('id', hallId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Update hall error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteHall = async (hallId) => {
	try {
		const { error } = await supabase.from('halls').delete().eq('id', hallId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Delete hall error:', error);
		return { success: false, error: error.message };
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

// Ingredient operations
export const getIngredients = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('ingredients').select('*').eq('restaurant_id', restaurantId).order('name', { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error('Get ingredients error:', error);
		return [];
	}
};

export const addIngredient = async (ingredientData) => {
	try {
		const { data, error } = await supabase.from('ingredients').insert([ingredientData]).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Add ingredient error:', error);
		return { success: false, error: error.message };
	}
};

export const updateIngredient = async (ingredientId, ingredientData) => {
	try {
		const { data, error } = await supabase.from('ingredients').update(ingredientData).eq('id', ingredientId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Update ingredient error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteIngredient = async (ingredientId) => {
	try {
		const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Delete ingredient error:', error);
		return { success: false, error: error.message };
	}
};

// Modifier operations
export const getModifiers = async (restaurantId) => {
	try {
		const { data, error } = await supabase.from('modifiers').select('*').eq('restaurant_id', restaurantId).order('name', { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error('Get modifiers error:', error);
		return [];
	}
};

export const addModifier = async (modifierData) => {
	try {
		const { data, error } = await supabase.from('modifiers').insert([modifierData]).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Add modifier error:', error);
		return { success: false, error: error.message };
	}
};

export const updateModifier = async (modifierId, modifierData) => {
	try {
		const { data, error } = await supabase.from('modifiers').update(modifierData).eq('id', modifierId).select().single();

		if (error) throw error;
		return { success: true, data };
	} catch (error) {
		console.error('Update modifier error:', error);
		return { success: false, error: error.message };
	}
};

export const deleteModifier = async (modifierId) => {
	try {
		const { error } = await supabase.from('modifiers').delete().eq('id', modifierId);

		if (error) throw error;
		return { success: true };
	} catch (error) {
		console.error('Delete modifier error:', error);
		return { success: false, error: error.message };
	}
};

// Get tables by hall
export const getTablesByHall = async (hallId) => {
	try {
		const { data, error } = await supabase.from('tables').select('*').eq('hall_id', hallId).order('table_number', { ascending: true });

		if (error) throw error;
		return data || [];
	} catch (error) {
		console.error('Get tables by hall error:', error);
		return [];
	}
};

// Get table count for hall
export const getHallTableCount = async (hallId) => {
	try {
		const { count, error } = await supabase.from('tables').select('*', { count: 'exact', head: true }).eq('hall_id', hallId);

		if (error) throw error;
		return count || 0;
	} catch (error) {
		console.error('Get hall table count error:', error);
		return 0;
	}
};
