const binColours = { domestic: "black", organic: "green", recycle: "blue" };

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

export function getBinColour(binType) {
  if (!binType) return "";

  return binColours[binType.toLowerCase()];
}

export function getBinName(binType) {
  if (!binType) return "";
  
  return binNames[binType.toLowerCase()];
}
