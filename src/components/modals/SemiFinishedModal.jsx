import { useForm } from 'react-hook-form';
import { X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export default function SemiFinishedModal({ isOpen, onClose, onSuccess, restaurantId, item = null }) {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredientsPanel, setShowIngredientsPanel] = useState(false);
  const [deleteMethod, setDeleteMethod] = useState('ingredient');
  const [outputAmount, setOutputAmount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      is_active: true,
      unit: 'kg',
    },
  });

  useEffect(() => {
    if (restaurantId) {
      loadIngredients();
      loadCategories();
    }
    if (item) {
      setValue('name', item.name);
      setValue('unit', item.unit);
      setValue('category_id', item.category_id);
      setValue('is_active', item.is_active);
      setOutputAmount(item.output_amount || 0);
      if (item.ingredients) {
        setSelectedIngredients(item.ingredients);
      }
    }
  }, [item, restaurantId, setValue]);

  const loadIngredients = async () => {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setIngredients(data || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      toast.error('Tərkibləri yükləmək mümkün olmadı');
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAddIngredient = () => {
    setShowIngredientsPanel(true);
  };

  const handleIngredientSelect = (ingredient, selectionType = 'single') => {
    if (selectionType === 'single') {
      const exists = selectedIngredients.find((i) => i.ingredient_id === ingredient.id);
      if (exists) {
        toast.error('Bu tərkib artıq əlavə edilib');
        return;
      }
      setSelectedIngredients([
        ...selectedIngredients,
        {
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit,
          cost_price: ingredient.cost_price || 0,
        },
      ]);
    } else {
      const newIngredients = ingredients
        .filter((ing) => !selectedIngredients.find((si) => si.ingredient_id === ing.id))
        .map((ing) => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          quantity: 0,
          unit: ing.unit,
          cost_price: ing.cost_price || 0,
        }));
      setSelectedIngredients([...selectedIngredients, ...newIngredients]);
    }
  };

  const handleRemoveIngredient = (ingredientId) => {
    if (deleteMethod === 'ingredient') {
      setSelectedIngredients(
        selectedIngredients.filter((i) => i.ingredient_id !== ingredientId)
      );
    }
  };

  const handleIngredientChange = (ingredientId, field, value) => {
    setSelectedIngredients(
      selectedIngredients.map((i) =>
        i.ingredient_id === ingredientId ? { ...i, [field]: value } : i
      )
    );
  };

  const calculateTotalCost = () => {
    return selectedIngredients.reduce((sum, ing) => {
      return sum + (parseFloat(ing.quantity) || 0) * (parseFloat(ing.cost_price) || 0);
    }, 0);
  };

  const onSubmit = async (data) => {
    if (selectedIngredients.length === 0) {
      toast.error('Ən azı bir tərkib əlavə edin');
      return;
    }

    const hasEmptyQuantity = selectedIngredients.some((i) => !i.quantity || parseFloat(i.quantity) <= 0);
    if (hasEmptyQuantity) {
      toast.error('Bütün tərkiblərin miqdarını daxil edin');
      return;
    }

    if (!outputAmount || parseFloat(outputAmount) <= 0) {
      toast.error('Ümumi çıxış miqdarını daxil edin');
      return;
    }

    setLoading(true);

    try {
      const totalCost = calculateTotalCost();
      const itemData = {
        ...data,
        restaurant_id: restaurantId,
        is_active: data.is_active === true || data.is_active === 'true',
        output_amount: parseFloat(outputAmount),
        total_cost: totalCost,
        ingredients: selectedIngredients.map((i) => ({
          ...i,
          quantity: parseFloat(i.quantity),
        })),
      };

      if (item) {
        itemData.id = item.id;
      }

      toast.success(item ? 'Yarımfabrikat yeniləndi' : 'Yarımfabrikat əlavə edildi');
      reset();
      setSelectedIngredients([]);
      setOutputAmount(0);
      onSuccess(itemData);
      onClose();
    } catch (error) {
      toast.error('Yarımfabrikat əməliyyatı zamanı xəta baş verdi');
      console.error('Semi-finished operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalCost = calculateTotalCost();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Yarımfabrikatı Redaktə Et' : 'Yeni Yarımfabrikat'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yarımfabrikat Adı *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Ad tələb olunur' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="məs: Hazır xəmir"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kateqoriya *
              </label>
              <select
                {...register('category_id', { required: 'Kateqoriya tələb olunur' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seçin</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ölçü vahidi *
            </label>
            <select
              {...register('unit', { required: 'Ölçü vahidi tələb olunur' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="kg">Kiloqram (kg)</option>
              <option value="l">Litr (l)</option>
              <option value="pcs">Ədəd</option>
              <option value="m">Metr (m)</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Tərkiblər *
              </label>
              <div className="flex items-center space-x-2">
                <select
                  value={deleteMethod}
                  onChange={(e) => setDeleteMethod(e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded"
                >
                  <option value="ingredient">Tərkibdən sil</option>
                  <option value="all">Hamısını sil</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleIngredientSelect(null, 'all')}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Hamısını əlavə et
                </button>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Tərkib əlavə et
                </button>
              </div>
            </div>

            {showIngredientsPanel && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Tərkib seçin</h4>
                  <button
                    type="button"
                    onClick={() => setShowIngredientsPanel(false)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Bağla
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {ingredients
                    .filter((ing) => !selectedIngredients.find((si) => si.ingredient_id === ing.id))
                    .map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => {
                          handleIngredientSelect(ingredient, 'single');
                          setShowIngredientsPanel(false);
                        }}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition text-sm text-left"
                      >
                        {ingredient.name} ({ingredient.unit})
                      </button>
                    ))}
                </div>
              </div>
            )}

            {selectedIngredients.length > 0 && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                {selectedIngredients.map((ingredient) => (
                  <div key={ingredient.ingredient_id} className="flex items-center space-x-2">
                    <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm">
                      {ingredient.ingredient_name}
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleIngredientChange(ingredient.ingredient_id, 'quantity', e.target.value)
                      }
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Miqdar"
                    />
                    <span className="text-sm text-gray-600 w-12">{ingredient.unit}</span>
                    <span className="text-sm text-gray-600 w-20">
                      {((parseFloat(ingredient.quantity) || 0) * (parseFloat(ingredient.cost_price) || 0)).toFixed(2)} ₼
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(ingredient.ingredient_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ümumi Maya Dəyəri (Dəyişdirilə bilməz)
              </label>
              <input
                type="text"
                value={`${totalCost.toFixed(2)} ₼`}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ümumi Çıxış Miqdarı *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{totalCost.toFixed(2)} ₼ =</span>
                <input
                  type="number"
                  step="0.01"
                  value={outputAmount}
                  onChange={(e) => setOutputAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Miqdar"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('is_active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">Aktiv</label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Əməliyyat...' : 'Yadda saxla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
