// Helper functions to safely serialize/deserialize cart with BigInt fields
export function serializeCart(cart: any[]): string {
  return JSON.stringify(cart, (key, value) => {
    // Convert BigInt to string for storage
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
}

export function deserializeCart(json: string): any[] {
  try {
    return JSON.parse(json, (key, value) => {
      // Convert string back to BigInt for specific fields
      if (key === 'id' || key === 'price' || key === 'preparationTimeMinutes' || key === 'createdAt') {
        return typeof value === 'string' && /^\d+$/.test(value) ? BigInt(value) : value;
      }
      return value;
    });
  } catch {
    return [];
  }
}
