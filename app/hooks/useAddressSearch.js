import { useState } from "react";
import { throttle } from "lodash";
import Toast from "react-native-toast-message";
import analytics from "../utils/analytics";

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
      analytics.trackAction("postcode_validation_error", {
        error: "empty_postcode",
      });
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

    // Validate postcode format
    if (!postcodeRegex.test(postcode.trim())) {
      setValidationError("Please enter a valid Cambridge postcode");
      setAddresses([]);
      analytics.trackAction("postcode_validation_error", {
        error: "invalid_format",
        postcode: postcode.trim(),
      });
      return;
    }

    setLoading(true);

    try {
      const apiStartTime = Date.now();
      const response = await fetch(
        `https://servicelayer3c.azure-api.net/wastecalendar/address/search?postcode=${encodeURIComponent(
          postcode
        )}`
      );
      const apiDuration = Date.now() - apiStartTime;

      if (!response.ok) {
        analytics.trackApiCall(
          "address_search_api",
          "GET",
          response.status,
          apiDuration,
          {
            postcode: postcode.trim(),
            error: "api_error",
          }
        );
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
        analytics.trackApiCall(
          "address_search_api",
          "GET",
          response.status,
          apiDuration,
          {
            postcode: postcode.trim(),
            addresses_found: 0,
            error: "no_addresses",
          }
        );
        return;
      }

      // Track successful API call
      analytics.trackApiCall(
        "address_search_api",
        "GET",
        response.status,
        apiDuration,
        {
          postcode: postcode.trim(),
          addresses_found: data.length,
        }
      );

      setAddresses(data);
    } catch (err) {
      analytics.trackError(err, {
        component: "address_search",
        action: "fetch_addresses",
        postcode: postcode.trim(),
      });

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
