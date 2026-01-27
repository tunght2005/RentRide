import { useMemo, useState } from "react";

export function useVehicles(vehicles: any[]) {
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(3000000);

  function normalize(text?: string) {
    return text?.toLowerCase().trim();
  }

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchName = v.name
        ?.toLowerCase()
        .includes(searchText.toLowerCase());

      const matchType = selectedType
        ? Array.isArray(v.type)
          ? v.type.some((t: string) => normalize(t) === normalize(selectedType))
          : normalize(v.type) === normalize(selectedType)
        : true;

      const matchLocation = selectedLocation
        ? normalize(v.locationId) === normalize(selectedLocation)
        : true;

      const price = Number(v.price ?? 0);
      const matchPrice = price <= maxPrice;

      return matchName && matchType && matchLocation && matchPrice;
    });
  }, [vehicles, searchText, selectedType, selectedLocation, maxPrice]);

  return {
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    selectedLocation,
    setSelectedLocation,
    maxPrice,
    setMaxPrice,
    filteredVehicles,
  };
}
