import { useMemo, useState } from "react";

export function useVehicles(vehicles: any[]) {
  // 🔍 search riêng
  const [searchText, setSearchText] = useState("");

  // 🎯 filters
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(30000000);

  function normalize(text?: string) {
    return text?.toLowerCase().trim();
  }

  // 🔹 chỉ tính là filtering khi có FILTER (không tính search)
  const isFiltering =
    selectedType !== null ||
    selectedLocation !== null ||
    maxPrice < 30000000;

  // 🔹 reset FILTER (không đụng search)
  function resetFilters() {
    setSelectedType(null);
    setSelectedLocation(null);
    setMaxPrice(30000000);
  }

  // 🔹 reset SEARCH riêng
  function resetSearch() {
    setSearchText("");
  }

  // 🔹 danh sách xe sau khi lọc + search
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchName =
        !searchText ||
        v.name?.toLowerCase().includes(searchText.toLowerCase());

      const matchType = selectedType
        ? Array.isArray(v.type)
          ? v.type.some(
              (t: string) => normalize(t) === normalize(selectedType)
            )
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
    // search
    searchText,
    setSearchText,
    resetSearch,

    // filters
    selectedType,
    selectedLocation,
    maxPrice,
    setSelectedType,
    setSelectedLocation,
    setMaxPrice,
    resetFilters,

    // computed
    filteredVehicles,
    isFiltering,
  };
}
