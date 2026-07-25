import { loadDashboardData } from "@/services/data/load-generated-data";

function main(): void {
  const data = loadDashboardData();
  const providerSummary = data.status.items
    .map((provider) => `${provider.provider}=${provider.state}`)
    .join(", ");
  console.log(
    `Generated data is valid (${data.status.overall}; ${providerSummary}).`,
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.stack ?? error.message : error;
  console.error(`Generated data validation failed: ${String(message)}`);
  process.exitCode = 1;
}

