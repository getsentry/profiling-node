import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import "./src/index";

Sentry.init({
  dsn: "https://3e28828639ff4360baed0f350b8010bd@o1137848.ingest.sentry.io/6326615",
  debug: true,
  tracesSampleRate: 1,
});

const transaction = Sentry.startTransaction({ name: "Testing" });

(async function blocking() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
})();

transaction.setName("profiling.node");
transaction.setStatus("Ok");

(async () => {
  transaction.finish();
  await Sentry.flush(5000);
})();
