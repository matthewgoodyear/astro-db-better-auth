export function formatDate(d: Date) {
  const isoString = d.toISOString();
  const date = new Date(isoString);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "long",
  }).format(date);

  return formattedDate;
}
