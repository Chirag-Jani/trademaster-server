export const truncateAddress = (address: string): string => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatNumber = (num: number) => {
  const abbreviations = ["", "K", "M", "B", "T"];
  let index = 0;

  if (typeof num === "string") {
    num = parseFloat(num);
  }

  if (
    num === null ||
    num === undefined ||
    typeof num !== "number" ||
    isNaN(num) ||
    !isFinite(num)
  ) {
    return "0";
  } else if (Math.abs(num) > 100000000000000) {
    return num > 0 ? ">100T" : "<-100T";
  }

  const isNegative = num < 0;
  num = Math.abs(num);

  while (num >= 1000 && index < abbreviations.length - 1) {
    num /= 1000;
    index++;
  }

  const formatted = num.toFixed(1);
  const result = formatted.endsWith(".0")
    ? formatted.slice(0, -2) + abbreviations[index]
    : formatted + abbreviations[index];

  return isNegative ? `-${result}` : result;
};
