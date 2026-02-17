export const getFutureDates = (date: Date, number: number) => {
  const mToS = 1000 * 60 * 60;
  const list = [date.toLocaleDateString()];
  for (let i = 0; i < number; i++) {
    list.push(new Date(date.getTime() + mToS * (24 * i)).toLocaleDateString());
  }
  return list;
};
