export const seedSampleData = async (storageUtils, restaurantId) => {
  const categories = [
    { name: 'İçkilər', sort_order: 1, is_active: true, restaurant_id: restaurantId },
    { name: 'Yemək', sort_order: 2, is_active: true, restaurant_id: restaurantId },
    { name: 'Desert', sort_order: 3, is_active: true, restaurant_id: restaurantId },
  ];

  const addedCategories = [];
  for (const cat of categories) {
    const result = await storageUtils.addCategory(cat);
    if (result.success) {
      addedCategories.push(result.data);
    }
  }

  if (addedCategories.length > 0) {
    const subCategories = [
      { name: 'Isti içkilər', category_id: addedCategories[0].id, restaurant_id: restaurantId, sort_order: 1, is_active: true },
      { name: 'Soyuq içkilər', category_id: addedCategories[0].id, restaurant_id: restaurantId, sort_order: 2, is_active: true },
    ];

    const addedSubCategories = [];
    for (const sub of subCategories) {
      const result = await storageUtils.addSubCategory(sub);
      if (result.success) {
        addedSubCategories.push(result.data);
      }
    }

    const products = [
      { name: 'Espresso', price: 3.50, cost: 1.20, category_id: addedCategories[0].id, sub_category_id: addedSubCategories[0].id, restaurant_id: restaurantId, is_active: true },
      { name: 'Cappuccino', price: 4.50, cost: 1.50, category_id: addedCategories[0].id, sub_category_id: addedSubCategories[0].id, restaurant_id: restaurantId, is_active: true },
      { name: 'Cola', price: 2.50, cost: 0.80, category_id: addedCategories[0].id, sub_category_id: addedSubCategories[1].id, restaurant_id: restaurantId, is_active: true },
      { name: 'Pizza Marqarita', price: 12.00, cost: 5.00, category_id: addedCategories[1].id, restaurant_id: restaurantId, is_active: true },
      { name: 'Burger', price: 8.50, cost: 3.50, category_id: addedCategories[1].id, restaurant_id: restaurantId, is_active: true },
      { name: 'Tiramisu', price: 6.50, cost: 2.50, category_id: addedCategories[2].id, restaurant_id: restaurantId, is_active: true },
    ];

    for (const product of products) {
      await storageUtils.addProduct(product);
    }
  }

  const tables = [
    { number: 1, capacity: 4, zone: 'Daxili', status: 'available', restaurant_id: restaurantId },
    { number: 2, capacity: 2, zone: 'Daxili', status: 'available', restaurant_id: restaurantId },
    { number: 3, capacity: 6, zone: 'Xarici', status: 'available', restaurant_id: restaurantId },
    { number: 4, capacity: 8, zone: 'VIP', status: 'available', restaurant_id: restaurantId },
    { number: 5, capacity: 4, zone: 'Daxili', status: 'available', restaurant_id: restaurantId },
  ];

  for (const table of tables) {
    await storageUtils.addTable(table);
  }

  const sampleOrders = [
    {
      restaurant_id: restaurantId,
      table_number: 1,
      items: [
        { name: 'Espresso', price: 3.50, quantity: 2 },
        { name: 'Tiramisu', price: 6.50, quantity: 1 },
      ],
      subtotal: 13.50,
      discount: 0,
      tax: 2.43,
      total: 15.93,
      payment_method: 'cash',
      completed_at: new Date().toISOString(),
      completed_by: 'System',
    },
    {
      restaurant_id: restaurantId,
      table_number: 2,
      items: [
        { name: 'Pizza Marqarita', price: 12.00, quantity: 1 },
        { name: 'Cola', price: 2.50, quantity: 2 },
      ],
      subtotal: 17.00,
      discount: 0,
      tax: 3.06,
      total: 20.06,
      payment_method: 'card',
      completed_at: new Date().toISOString(),
      completed_by: 'System',
    },
  ];

  for (const order of sampleOrders) {
    await storageUtils.addOrder(order);
  }

  return true;
};
