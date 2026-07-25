import { act, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import weatherFixture from "../../../fixtures/weather/open-meteo.json";
import { loadDashboardData } from "@/services/data/load-generated-data";

import { toDashboardViewModel } from "../dashboard-view-model";
import { Dashboard } from "./dashboard";

function dashboardData() {
  return toDashboardViewModel(loadDashboardData());
}

describe("Dashboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the dashboard hierarchy and demonstration disclosures", () => {
    render(<Dashboard data={dashboardData()} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Morning Briefing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Weather" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Cricket" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Football" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Demonstration data/i).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("keeps fallback weather until a geolocation response is validated", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => weatherFixture,
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Dashboard data={dashboardData()} />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent("daybreak:location", {
          detail: { latitude: 40.7128, longitude: -74.006 },
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Current location")).toBeInTheDocument();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        /Partly cloudy conditions lead the day at your current location/,
      ),
    ).toBeInTheDocument();
  });
});
