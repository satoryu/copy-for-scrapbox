export default () => {
  // Define env vars for sending an event data to google analytics
  process.env.VITE_GA_ENDPOINT = "https://www.google-analytics.com/mp/collect";
  process.env.VITE_MEASUREMENT_ID = "measurement-id";
  process.env.VITE_API_SECRET = "api-secret";
}
