export class AddressDto {
    street: string;
    city: string;
    number: string;
    neighborhood: string;
}

export class RestaurantDetailsDto {
    id: number
    name: string;
    averageRating: number;
    deliveryFee: number
    phone: string;
    address: AddressDto;
}
