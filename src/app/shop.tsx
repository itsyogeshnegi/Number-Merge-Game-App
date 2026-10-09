import React from 'react';
import { router } from 'expo-router';
import { ShopModal } from '../features/shop/screens/ShopModal';

export default function ShopPage() {
  return <ShopModal visible={true} onClose={() => router.back()} />;
}
