import { ExplorePreview } from "@/components/explore/ExplorePreview";
import { Hero } from "@/components/hero/Hero";
import { AIExplanation, CampusMapPreview, FinalCTA, PersonalizedDay, ProblemSection, ProcessSection, QuestionsSection } from "@/components/landing/LandingSections";
import { Navbar } from "@/components/navigation/Navbar";

export default function Home(){return <main><Navbar/><Hero/><ExplorePreview/><ProblemSection/><ProcessSection/><QuestionsSection/><PersonalizedDay/><CampusMapPreview/><AIExplanation/><FinalCTA/></main>}
