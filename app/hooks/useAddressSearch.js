import { useState } from "react";
import { throttle } from "lodash";
import Toast from "react-native-toast-message";

export const useAddressSearch = () => {
  const [postcode, setPostcode] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const fetchAddresses = async () => {
    // Clear previous errors and addresses
    setValidationError(null);
    setAddresses([]);

    // Check for empty input
    if (!postcode.trim()) {
      setValidationError("Please enter a postcode");
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

    // Validate postcode format
    if (!postcodeRegex.test(postcode.trim())) {
      setValidationError("Please enter a valid Cambridge postcode");
      setAddresses([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=${encodeURIComponent(
          postcode
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Couldn't reach the server. Please check your connection."
        );
      }

      const data = await response.json();

      if (!data.length || data[0].id < 0) {
        setValidationError(
          "No addresses found for this postcode. Please ensure you're entering a Cambridge area postcode."
        );
        setAddresses([]);
        setLoading(false);
        return;
      }

      setAddresses(data);
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Search failed",
        text2: err.message || "Something went wrong. Please try again.",
      });
      setAddresses([]);
    }

    setLoading(false);
  };

  // At most one API call every 10 seconds with latest postcode
  const throttledFetchAddresses = throttle(() => fetchAddresses(), 10000);

  const resetState = () => {
    setPostcode("");
    setAddresses([]);
    setSelectedRowId(null);
    setValidationError(null);
  };

  const clearAddresses = () => {
    setAddresses([]);
    setSelectedRowId(null);
  };

  return {
    postcode,
    setPostcode,
    addresses,
    loading,
    validationError,
    setValidationError,
    selectedRowId,
    setSelectedRowId,
    fetchAddresses,
    throttledFetchAddresses,
    resetState,
    clearAddresses,
  };
};
