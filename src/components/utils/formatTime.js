export const formatNotificationTime = (isoString) => {
  const dateObj = new Date(isoString);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return dateObj.toLocaleString('en-IN', options); 
};

