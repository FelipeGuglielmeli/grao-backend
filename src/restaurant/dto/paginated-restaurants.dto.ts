export class RestaurantSummaryDto {
  id: number
  name: string;
  description: string;
  deliveryFee: number;
  averageRating: number;
}

export class PaginatedRestaurantsDto {
  data: RestaurantSummaryDto[];
  total: number;
  page: number;
  lastPage: number;
}
