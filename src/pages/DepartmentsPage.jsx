import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import { supabase } from '../lib/supabase';

function DepartmentModal({ isOpen, onClose, department = null, refresh }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (department) {
      setValue('name', department.name);
      setValue('code', department.code);
      setValue('description', department.description);
    } else {
      reset();
    }
  }, [department, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (department) {
        const { data: updated, error } = await supabase
          .from('departments')
          .update(data)
          .eq('id', department.id)
          .select()
          .single();
        if (error) throw error;
        toast.success('Departament yeniləndi');
      } else {
        const { data: created, error } = await supabase
          .from('departments')
          .insert([data])
          .select()
          .single();
        if (error) throw error;
        toast.success('Departament əlavə edildi');
      }
      refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">{department ? 'Departament Redaktə' : 'Yeni Departament'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
            <input
              type="text"
              {...register('name', { required: 'Ad tələb olunur' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kod *</label>
            <input
              type="text"
              {...register('code', { required: 'Kod tələb olunur' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qeyd</label>
            <textarea
              {...register('description')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Ləğv et
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Əməliyyat...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('departments').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDepartments(data);
    } catch (error) {
      console.error(error);
      toast.error('Departamentləri yükləmək mümkün olmadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Departamenti silmək istədiyinizdən əminsiniz?')) return;
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      toast.success('Departament silindi');
      fetchDepartments();
    } catch (error) {
      console.error(error);
      toast.error('Departamenti silmək mümkün olmadı');
    }
  };

  return (
    <div>
      <Sidebar />
    <div className="p-6">
      <Header
					title='Filiallar'
					stats={[
						{ label: 'Ümumi', value: branches.length },
						{ label: 'Aktiv', value: activeBranches },
					]}
				/>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Departamentlər</h1>
        <button
          onClick={() => { setSelectedDept(null); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Departament</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qeyd</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dept.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button onClick={() => { setSelectedDept(dept); setModalOpen(true); }} className="text-blue-600 hover:text-blue-700 inline-flex items-center">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="text-red-600 hover:text-red-700 inline-flex items-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">Departament tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && <DepartmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} department={selectedDept} refresh={fetchDepartments} />}
    </div>
    </div>
  );
}
