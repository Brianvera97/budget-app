import { Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    createdAt: Date;
}

export interface IClient extends Document {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    ruc?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMaterial extends Document {
    name: string;
    description?: string;
    unit: string;
    price: number;
    category?: string;
    lastUpdated: Date;
    createdAt: Date;
}

export interface IBudgetItem {
    materialId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    subtotal: number;
}

export interface IBudget extends Document {
    budgetNumber: string;
    clientId: string;
    projectName?: string;
    projectDescription?: string;
    items: IBudgetItem[];
    subtotal: number;
    iva?: number;
    total: number;
    status: 'draft' | 'sent' | 'approved' | 'rejected';
    validUntil?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

// DTOs para Auth
export interface RegisterDTO {
    email: string;
    password: string;
    name: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

// DTOs para Client
export interface CreateClientDTO {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    ruc?: string;
}

export interface UpdateClientDTO {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    ruc?: string;
}

// DTOs para Material
export interface CreateMaterialDTO {
    name: string;
    description?: string;
    unit: string;
    price: number;
    category?: string;
}

export interface UpdateMaterialDTO {
    name?: string;
    description?: string;
    unit?: string;
    price?: number;
    category?: string;
}

// DTOs para Budget
export interface CreateBudgetItemDTO {
    materialId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
}

export interface CreateBudgetDTO {
    clientId: string;
    projectName?: string;
    projectDescription?: string;
    items: CreateBudgetItemDTO[];
    validUntil?: Date;
    notes?: string;
}
// ==================== CATEGORIES ====================

export interface ICategory extends Document {
    name: string;
    description?: string;
    defaultMargin: number; // percentage
    color?: string; // for UI
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoryDTO {
    name: string;
    description?: string;
    defaultMargin: number;
    color?: string;
    order?: number;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    defaultMargin?: number;
    color?: string;
    order?: number;
    active?: boolean;
}

// ==================== RESOURCES ====================

export type ResourceType = 'material' | 'labor' | 'equipment';

export interface IResource extends Document {
    name: string;
    description?: string;
    type: ResourceType;
    unit: string;
    price: number;
    categoryId?: string;
    lastUpdated: Date;
    createdAt: Date;
}

export interface CreateResourceDTO {
    name: string;
    description?: string;
    type: ResourceType;
    unit: string;
    price: number;
    categoryId?: string;
}

export interface UpdateResourceDTO {
    name?: string;
    description?: string;
    type?: ResourceType;
    unit?: string;
    price?: number;
    categoryId?: string;
}
// ==================== COMPOSITE ITEMS ====================

export interface ICompositeItemComponent {
    resourceId: string;
    quantity: number;
}

export interface ICompositeItem extends Document {
    name: string;
    description?: string;
    unit: string;
    categoryId: string;
    composition: ICompositeItemComponent[];
    customMargin?: number; // Override category default
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCompositeItemDTO {
    name: string;
    description?: string;
    unit: string;
    categoryId: string;
    composition: Array<{
        resourceId: string;
        quantity: number;
    }>;
    customMargin?: number;
}

export interface UpdateCompositeItemDTO {
    name?: string;
    description?: string;
    unit?: string;
    categoryId?: string;
    composition?: Array<{
        resourceId: string;
        quantity: number;
    }>;
    customMargin?: number;
    active?: boolean;
}

export interface CompositeItemCalculation {
    id: string;
    name: string;
    description?: string;
    unit: string;
    category: any;
    composition: Array<{
        resource: any;
        quantity: number;
        subtotal: number;
    }>;
    costBreakdown: {
        materials: number;
        labor: number;
        equipment: number;
        total: number;
    };
    margin: number;
    finalPrice: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}