export interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  image: string;
  stock: number;
  status: string;
}

export interface ProductCategory {
  id: number;
  name: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}



