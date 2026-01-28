import { getAuth } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getUserProfile } from "../lib/firebase/firestore";

export function useVehicles(vehicles: any[]) {
  // =====================
  // 🔍 SEARCH
  // =====================
  const [searchText, setSearchText] = useState("");
  const isSearching = searchText.trim().length > 0;
  // =====================
  // 🎯 FILTERS
  // =====================
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(30000000);

  // =====================
  // 👤 USER / AVATAR
  // =====================
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      getUserProfile(currentUser.uid).then(setUser);
    }
  }, []);

  // =====================
  // 🧹 NORMALIZE
  // =====================
  function normalize(text?: string) {
    return text?.toLowerCase().trim();
  }

  // =====================
  // 🔹 đang filter (KHÔNG tính search)
  // =====================
  const isFiltering =
    selectedType !== null || selectedLocation !== null || maxPrice < 30000000;

  // =====================
  // 🔹 reset filters
  // =====================
  function resetFilters() {
    setSelectedType(null);
    setSelectedLocation(null);
    setMaxPrice(30000000);
  }

  function resetSearch() {
    setSearchText("");
  }
  const locations = useMemo(() => {
    const set = new Set<string>();

    vehicles.forEach((v) => {
      if (v.locationId) {
        set.add(v.locationId.toUpperCase());
      }
    });

    return Array.from(set);
  }, [vehicles]);

  // =====================
  // 🚗 FILTERED VEHICLES
  // =====================
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 🔍 name
      const matchName =
        !searchText ||
        (normalize(v.name) ?? "").includes(normalize(searchText) ?? "");
      // 🚘 type
      const matchType = selectedType
        ? Array.isArray(v.type)
          ? v.type.some((t: string) => normalize(t) === normalize(selectedType))
          : normalize(v.type) === normalize(selectedType)
        : true;

      // 📍 location (HCM / HN – KHÔNG phân biệt hoa thường)
      const matchLocation = selectedLocation
        ? normalize(v.locationId) === normalize(selectedLocation)
        : true;

      // 💰 price
      const price = Number(v.price ?? 0);
      const matchPrice = price <= maxPrice;

      return matchName && matchType && matchLocation && matchPrice;
    });
  }, [vehicles, searchText, selectedType, selectedLocation, maxPrice]);

  // =====================
  // 📦 EXPORT
  // =====================
  return {
    // 🔍 search
    searchText,
    setSearchText,
    resetSearch,

    // 🎯 filters
    selectedType,
    selectedLocation,
    maxPrice,
    setSelectedType,
    setSelectedLocation,
    setMaxPrice,
    resetFilters,

    // 👤 user
    user,
    locations,
    // 📦 computed
    filteredVehicles,
    isFiltering,
  };
}
