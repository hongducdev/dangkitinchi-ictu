export const extractTimeAndRoom = (htmlContent: string) => {
  const matches = htmlContent.match(
    /Từ (.*?) đến (.*?): <b>\((\d+)\)<\/b><br>&nbsp;&nbsp;&nbsp;<b>(.*?)<\/b>/
  );
  if (matches) {
    const [, startTime, endTime, sessionNumber, roomInfo] = matches;
    return { startTime, endTime, sessionNumber, roomInfo };
  }
  return null;
};
