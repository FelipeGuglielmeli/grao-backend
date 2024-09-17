export class MenuItemDto {
    id: number;
    description: string;
    price: number;
    name: string;
  }
  
  export class MenuDto {
    dishes: MenuItemDto[];
    drinks: MenuItemDto[];
  }
  