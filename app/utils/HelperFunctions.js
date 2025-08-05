const binColours = {
  domestic: "#000000",
  organic: "#026928",
  recycle: "#0D47A1",
};

const binNames = {
  domestic: "General Waste",
  organic: "Food Waste",
  recycle: "Recyclables",
};

export function getDateWithSuffix(date) {
  const day = date.getDate();
  let suffix = "th";

  if (day === 1 || day === 21 || day === 31) {
    suffix = "st";
  } else if (day === 2 || day === 22) {
    suffix = "nd";
  } else if (day === 3 || day === 23) {
    suffix = "rd";
  }

  return day + suffix;
}

export function getBinColour(roundType) {
  if (!roundType) return "";

  return binColours[roundType.toLowerCase()];
}

export function getBinName(roundType) {
  if (!roundType) return "";

  return binNames[roundType.toLowerCase()];
}
