import { getAuth } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { getPaidContracts, getUserProfile } from "../lib/firebase/firestore";

export function useVehicles(vehicles: any[]) {
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState(30000000);
  const [user, setUser] = useState<any>(null);
  const [rentingVehicles, setRentingVehicles] = useState<any[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      getUserProfile(currentUser.uid).then(setUser);

      // Lấy danh sách xe đang thuê (status: paid)
      getPaidContracts(currentUser.uid).then((contracts) => {
        const activeVehicles = contracts.map((c) => ({
          ...c.vehicle,
          price: c.booking.pricePerDay || 0,
          images: [c.vehicle.image],
        }));
        setRentingVehicles(activeVehicles);
      });
    }
  }, []);

  function normalize(text?: string) {
    return text?.toLowerCase().trim();
  }

  const isFiltering =
    selectedType !== null || selectedLocation !== null || maxPrice < 30000000;

  const resetFilters = () => {
    setSelectedType(null);
    setSelectedLocation(null);
    setMaxPrice(30000000);
  };

  const resetSearch = () => setSearchText("");

  // Lấy danh sách các tỉnh thành từ data xe
  const locations = useMemo(() => {
    const set = new Set<string>();
    vehicles.forEach((v) => {
      if (v.locationId) set.add(v.locationId.toUpperCase());
    });
    return Array.from(set);
  }, [vehicles]);

  // Lấy danh sách ID các xe đang thuê để ẩn
  const rentedVehicleIds = useMemo(() => {
    return rentingVehicles.map((v) => v.id);
  }, [rentingVehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Ẩn xe nếu nó nằm trong danh sách đang thuê
      if (rentedVehicleIds.includes(v.id)) return false;

      const matchName =
        !searchText ||
        (normalize(v.name) ?? "").includes(normalize(searchText) ?? "");

      const matchType = selectedType
        ? Array.isArray(v.type)
          ? v.type.some((t: any) => normalize(t) === normalize(selectedType))
          : normalize(v.type) === normalize(selectedType)
        : true;

      const matchLocation = selectedLocation
        ? normalize(v.locationId) === normalize(selectedLocation)
        : true;

      const price = Number(v.price ?? 0);
      const matchPrice = price <= maxPrice;

      return matchName && matchType && matchLocation && matchPrice;
    });
  }, [
    vehicles,
    searchText,
    selectedType,
    selectedLocation,
    maxPrice,
    rentedVehicleIds,
  ]);

  return {
    searchText,
    setSearchText,
    resetSearch,
    selectedType,
    selectedLocation,
    maxPrice,
    setSelectedType,
    setSelectedLocation,
    setMaxPrice,
    resetFilters,
    rentingVehicles,
    user,
    locations,
    filteredVehicles,
    isFiltering,
  };
}
