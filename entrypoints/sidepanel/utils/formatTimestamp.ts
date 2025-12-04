import { getMessage } from './i18n';

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < SECONDS_IN_MINUTE) {
    return getMessage('timeJustNow', 'Just now');
  } else if (diffInSeconds < SECONDS_IN_HOUR) {
    const minutes = Math.floor(diffInSeconds / SECONDS_IN_MINUTE);
    return getMessage('timeMinutesAgo', [minutes.toString()], `${minutes} minutes ago`);
  } else if (diffInSeconds < SECONDS_IN_DAY) {
    const hours = Math.floor(diffInSeconds / SECONDS_IN_HOUR);
    return getMessage('timeHoursAgo', [hours.toString()], `${hours} hours ago`);
  } else {
    const days = Math.floor(diffInSeconds / SECONDS_IN_DAY);
    return getMessage('timeDaysAgo', [days.toString()], `${days} days ago`);
  }
}
