import type { BriefingContent } from "@/domain/briefing";
import type {
  CricketDocument,
  FootballDocument,
  WeatherDocument,
} from "@/domain/generated-data";

export interface BriefingContext {
  weather: WeatherDocument;
  cricket: CricketDocument;
  football: FootballDocument;
  now: Date;
}

export interface BriefingGenerator {
  generate(context: BriefingContext): BriefingContent;
}

