/**
 * Waste calendar API endpoint helpers.
 *
 * Centralizes URL building so screens/hooks don't duplicate string templates.
 * This module does not perform network requests; it only builds URLs.
 */

const WASTE_CALENDAR_BASE_URL =
  "https://servicelayer3c.azure-api.net/wastecalendar";

export function buildAddressSearchUrl(postcode) {
  return `${WASTE_CALENDAR_BASE_URL}/address/search?postcode=${encodeURIComponent(
    postcode
  )}`;
}

export function buildCollectionSearchUrl(
  addressId,
  { authority = "CCC", numberOfCollections = 12 } = {}
) {
  return `${WASTE_CALENDAR_BASE_URL}/collection/search/${addressId}/?authority=${authority}&numberOfCollections=${numberOfCollections}`;
}
