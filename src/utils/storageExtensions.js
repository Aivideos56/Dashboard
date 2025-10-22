import { supabase } from '../lib/supabase';

export const getHalls = async (restaurantId) => {
  try {
    const { data, error } = await supabase
      .from('halls')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting halls:', error);
    return [];
  }
};

export const addHall = async (hallData) => {
  try {
    const { data, error } = await supabase
      .from('halls')
      .insert([hallData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding hall:', error);
    return { success: false, error: error.message };
  }
};

export const updateHall = async (hallId, hallData) => {
  try {
    const { data, error } = await supabase
      .from('halls')
      .update(hallData)
      .eq('id', hallId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating hall:', error);
    return { success: false, error: error.message };
  }
};

export const deleteHall = async (hallId) => {
  try {
    const { error: tablesError } = await supabase
      .from('tables')
      .delete()
      .eq('hall_id', hallId);

    if (tablesError) throw tablesError;

    const { error } = await supabase
      .from('halls')
      .delete()
      .eq('id', hallId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting hall:', error);
    return { success: false, error: error.message };
  }
};

export const getHallTableCount = async (hallId) => {
  try {
    const { count, error } = await supabase
      .from('tables')
      .select('*', { count: 'exact', head: true })
      .eq('hall_id', hallId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting hall table count:', error);
    return 0;
  }
};
